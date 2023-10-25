using Microsoft.Extensions.Options;
using nucleus_remote_client.Agent;
using nucleus_remote_client.ClientImpl;
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
        private readonly HostSettings _hostSettings;

        public Worker(IOptions<HostSettings> hostSettings)
        {
            _hostSettings = hostSettings.Value;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            IAgent agent;
            // Check if run as a windows service
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows) && !Environment.UserInteractive)
            {
                agent = new WindowsServiceImpl();
            }
            else
            {
                agent = new DesktopClientImpl();
            }

            await agent.Run(_hostSettings, stoppingToken);
        }
    }
}
