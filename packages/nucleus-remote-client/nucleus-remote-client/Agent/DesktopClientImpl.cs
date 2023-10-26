using nucleus_remote_client.ClientImpl;
using nucleus_remote_client.Lib;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace nucleus_remote_client.Agent
{
    internal class DesktopClientImpl : IAgent
    {
        private static async Task SetupUpgrade(HostSettings hostSettings)
        {
            if (hostSettings.PrivateKey == null)
            {
                // Download the new settingsFile
                var client = ClientHelper.GetHttpClient(hostSettings);
                try
                {
                    var appSettingsContent = await client.GetStringAsync($"c2/{hostSettings.Id}/upgrade");

                    File.WriteAllText("appsettings.json", appSettingsContent);
                    // Restart this application
                    Process.Start(Process.GetCurrentProcess().MainModule?.FileName ?? throw new InvalidOperationException());
                    Environment.Exit(0);
                }
                catch (HttpRequestException)
                {
                    Thread.Sleep(10000);
                    Process.Start(Process.GetCurrentProcess().MainModule?.FileName ?? throw new InvalidOperationException());
                    Environment.Exit(0);
                }
            }
        }

        private static void SetupTimer(HostSettings hostSettings)
        {
            var timer = new System.Timers.Timer
            {
                AutoReset = true,
                Interval = TimeSpan.FromMinutes(5).TotalMilliseconds,
            };

            void Elapsed(object? sender, EventArgs _)
            {
                Task.Run(async () =>
                {
                    await Try(new SendLocalDrives(), hostSettings);
                    await Try(new SendInstalledPrograms(), hostSettings);
                });
            }

            timer.Elapsed += Elapsed;
            timer.Start();

            Elapsed(null, EventArgs.Empty);
        }

        private static void SetupEvents(HostSettings hostSettings)
        {
            var localDriveEventManager = new LocalDriveEventManager();
            localDriveEventManager.OnLocalDrivesChanged += async (sender, args) =>
            {
                await Try(new SendLocalDrives(), hostSettings);
            };
        }

        private static async Task Setup(HostSettings hostSettings)
        {
            await SetupUpgrade(hostSettings);
            SetupTimer(hostSettings);
            SetupEvents(hostSettings);
        }

        public async Task Run(HostSettings hostSettings, CancellationToken cancellationToken)
        {

            await Setup(hostSettings);

            var pinger = new SendPing();
            var executer = new GetConfigurationTasks();

            while (!cancellationToken.IsCancellationRequested)
            {
               
                await Try(executer, hostSettings);
                await Try(pinger, hostSettings);
                await Try(new SendDetails(), hostSettings);
#if DEBUG
                await Task.Delay(10000, cancellationToken);
#else
                await Task.Delay(60000, cancellationToken);
#endif
            }
        }



        private static async Task Try(IClient client, HostSettings hostSettings)
        {
            try
            {
                var response = await client.ExecuteAsync(hostSettings);
                if (response != null)
                {
                    if (!response.IsSuccessStatusCode)
                    {
                        var content = await response.Content.ReadAsStringAsync();

                        await SendLog.Error(hostSettings, content);
                    }
                }
            }
            catch (Exception e)
            {
                await SendLog.Error(hostSettings, e.Message);
            }
        }
    }
}
