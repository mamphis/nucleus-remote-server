using Microsoft.Extensions.Options;
using nucleus_remote_client.Client;
using nucleus_remote_client.Lib;
using nucleus_remote_client.Tasks;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Runtime.Versioning;
using System.Timers;

namespace nucleus_remote_client
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> _logger;
        private readonly HostSettings _hostSettings;

        public Worker(ILogger<Worker> logger, IOptions<HostSettings> hostSettings)
        {
            _logger = logger;
            _hostSettings = hostSettings.Value;
        }

        private async Task SetupUpgrade()
        {
            if (_hostSettings.PrivateKey == null)
            {
                // Download the new settingsFile
                var client = ClientHelper.GetHttpClient(_hostSettings);
                try
                {
                    var appSettingsContent = await client.GetStringAsync($"c2/{_hostSettings.Id}/upgrade");

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

        private void SetupTimer()
        {

            var timer = new System.Timers.Timer
            {
                AutoReset = true,
                Interval = TimeSpan.FromMinutes(30).TotalMilliseconds,
            };

            async void Elapsed(object? sender, EventArgs _)
            {
                await Try(new SendLocalDrives());
                await Try(new SendInstalledPrograms());
                StartUpdater();
            }

            timer.Elapsed += Elapsed;
            timer.Start();

            Elapsed(null, EventArgs.Empty);
        }

        private void SetupEvents()
        {
            var localDriveEventManager = new LocalDriveEventManager();
            localDriveEventManager.OnLocalDrivesChanged += async (sender, args) =>
            {
                await Try(new SendLocalDrives());
            };
        }

        private async Task Setup()
        {
            await SetupUpgrade();
            SetupTimer();
            SetupEvents();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await Setup();

            var pinger = new SendPing();
            var executer = new GetConfigurationTasks();
            await Try(new SendInstalledPrograms());

            while (!stoppingToken.IsCancellationRequested)
            {
                if (_logger.IsEnabled(LogLevel.Information))
                {
                    _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
                }

                await Try(executer);
                await Try(pinger);
                await Try(new SendDetails());
#if DEBUG
                await Task.Delay(10000, stoppingToken);
#else
                await Task.Delay(60000, stoppingToken);
#endif
            }
        }

        private async Task Try(IClient client)
        {
            try
            {
                var response = await client.ExecuteAsync(_hostSettings);
                if (response != null)
                {
                    if (!response.IsSuccessStatusCode)
                    {
                        var content = await response.Content.ReadAsStringAsync();

                        await SendLog.Error(_hostSettings, content);
                    }
                }
            }
            catch (Exception e)
            {
                await SendLog.Error(_hostSettings, e.Message);
            }
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
