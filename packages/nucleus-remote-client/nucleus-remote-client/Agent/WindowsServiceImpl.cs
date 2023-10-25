using Microsoft.Win32.SafeHandles;
using nucleus_remote_client.ClientImpl;
using nucleus_remote_client.Lib;
using nucleus_remote_client.Tasks;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace nucleus_remote_client.Agent
{
    class WindowsServiceContext
    {
        public HostSettings HostSettings { get; set; }
        public CancellationToken CancellationToken { get; set; }
        public HttpListener Listener { get; set; }

        public WindowsServiceContext(HostSettings hostSettings, HttpListener httpListener, CancellationToken cancellationToken)
        {
            this.HostSettings = hostSettings;
            this.CancellationToken = cancellationToken;
            this.Listener = httpListener;
        }
    }

    internal class WindowsServiceImpl : IAgent
    {
        public static readonly int PORT = 44213;

        private static void SetupTimer(HostSettings _)
        {

            var timer = new System.Timers.Timer
            {
                AutoReset = true,
                Interval = TimeSpan.FromMinutes(30).TotalMilliseconds,
            };

            static void Elapsed(object? sender, EventArgs _)
            {
                StartUpdater();
            }

            timer.Elapsed += Elapsed;
            timer.Start();

            Elapsed(null, EventArgs.Empty);
        }

        public async Task Run(HostSettings hostSettings, CancellationToken cancellationToken)
        {
            SetupTimer(hostSettings);
            // Create a http listener which listens on localhost and a specific port and waits for commands

            var listener = new HttpListener();
            listener.Prefixes.Add($"http://localhost:{WindowsServiceImpl.PORT}/");
            try
            {
                listener.Start();
            }
            catch (HttpListenerException)
            {
                // Already running
                return;
            }

            await SendLog.Info(hostSettings, "Started Windows Service. Listening on port " + PORT);
            listener.BeginGetContext(this.ResolveContextAsync, new WindowsServiceContext(hostSettings, listener, cancellationToken));
            while (!cancellationToken.IsCancellationRequested)
            {
                await Task.Delay(1000, cancellationToken);
            }

            listener.Stop();
        }

        private async void ResolveContextAsync(IAsyncResult ar)
        {
            WindowsServiceContext? windowsServiceContext = (WindowsServiceContext?)ar.AsyncState;
            if (windowsServiceContext == null)
            {
                return;
            }

            var listener = windowsServiceContext.Listener;

            if (!listener.IsListening)
            {
                return;
            }

            HttpListenerContext? context = listener.EndGetContext(ar);
            if (context == null)
            {
                return;
            }

            listener.BeginGetContext(this.ResolveContextAsync, windowsServiceContext);

            var request = context.Request;
            var response = context.Response;
            try
            {
                await HandleRequest(request, response, windowsServiceContext);
            }
            finally
            {
                response.Close();
            }
        }

        private static async Task HandleRequest(HttpListenerRequest request, HttpListenerResponse _, WindowsServiceContext context)
        {
            var requestString = await new StreamReader(request.InputStream, request.ContentEncoding).ReadToEndAsync();
            if (requestString == null)
            {
                return;
            }

            var taskContainer = JsonSerializer.Deserialize<TaskContainer>(requestString);
            if (taskContainer == null)
            {
                return;
            }

            if (!taskContainer.Active)
            {
                return;
            }

            await ExecuteTaskHelper.ExecuteTask(taskContainer, context.HostSettings);
        }

        private static void StartUpdater()
        {
#if DEBUG
            return;
#endif

#pragma warning disable CS0162 // Unreachable code detected
            var updaterPath = Path.GetFullPath("nucleus-remote-updater.exe");
            if (Path.Exists(updaterPath))
            {
                var psi = new ProcessStartInfo(updaterPath)
                {
                    CreateNoWindow = true
                };
                Process? proc = Process.Start(psi);
            }
#pragma warning restore CS0162 // Unreachable code detected
        }
    }
}
