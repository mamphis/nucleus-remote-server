using Microsoft.Extensions.Options;
using nucleus_remote_client.Client;
using nucleus_remote_client.Lib;
using nucleus_remote_client.Tasks;
using System.Diagnostics;
using System.Runtime.Versioning;

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

        [SupportedOSPlatformGuard("windows")]
        private readonly bool _isWindows = OperatingSystem.IsWindows();

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            StartUpdater();
            var pinger = new SendPing();
            var executer = new GetConfigurationTasks();
            if (_isWindows)
            {
                await new SendInstalledPrograms().ExecuteAsync(_hostSettings);
            }

            while (!stoppingToken.IsCancellationRequested)
            {
                if (_logger.IsEnabled(LogLevel.Information))
                {
                    _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
                }

                await Try(executer, _hostSettings);
                await Try(pinger, _hostSettings);
                await Try(new SendDetails(), _hostSettings);
#if DEBUG
                await Task.Delay(10000, stoppingToken);
#else
                await Task.Delay(60000, stoppingToken);
#endif
            }
        }

        private async Task Try(IClient client, HostSettings hostSettings)
        {
            try
            {
                await client.ExecuteAsync(_hostSettings);
            }
            catch (Exception e)
            {
                await SendLog.Error(_hostSettings, e.Message);
            }
        }

        private void StartUpdater()
        {
#if DEBUG
            return;
#endif

            var updaterPath = Path.GetFullPath("nucleus-remote-updater.exe");
            if (Path.Exists(updaterPath))
            {
                var psi = new ProcessStartInfo(updaterPath);
                psi.CreateNoWindow = true;
                Process? proc = Process.Start(psi);
            }
        }
    }
}
