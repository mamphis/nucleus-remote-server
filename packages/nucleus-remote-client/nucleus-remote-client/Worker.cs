using Microsoft.Extensions.Options;
using nucleus_remote_client.Client;
using nucleus_remote_client.Tasks;
using System.Diagnostics;

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

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            StartUpdater();
            var pinger = new SendPing();
            var executer = new GetConfigurationTasks();
            while (!stoppingToken.IsCancellationRequested)
            {
                if (_logger.IsEnabled(LogLevel.Information))
                {
                    _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
                }
                try
                {
                    await executer.ExecuteAsync(_hostSettings);
                }

                catch (Exception e)
                {
                    await SendLog.Error(_hostSettings, e.Message);
                }
                try
                {
                    await pinger.ExecuteAsync(_hostSettings);
                }
                catch (Exception e)
                {
                    await SendLog.Error(_hostSettings, e.Message);
                }
                await Task.Delay(60000, stoppingToken);
            }
        }

        private void StartUpdater()
        {
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
