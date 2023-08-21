using Microsoft.Extensions.Options;
using nucleus_remote_client.Client;
using nucleus_remote_client.Tasks;

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
            var pinger = new SendPing();
            while (!stoppingToken.IsCancellationRequested)
            {
                if (_logger.IsEnabled(LogLevel.Information))
                {
                    _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
                }

                var createShortcut = new CreateShortcut()
                {
                    LinkPath = Path.Join(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "Test.lnk"),
                    TargetPath = "cmd.exe",
                    Arguments = "/c calc.exe"
                };

                await createShortcut.Run();

                await pinger.ExecuteAsync(_hostSettings);
                await Task.Delay(5000, stoppingToken);
            }
        }
    }
}
