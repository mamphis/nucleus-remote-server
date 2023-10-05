using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using nucleus_remote_client.Lib;

namespace nucleus_remote_client.Client
{
    internal class SendPing : IClient
    {
        public SendPing()
        {

        }

        public async Task ExecuteAsync(HostSettings hostSettings)
        {
            HttpClient client = new()
            {
                BaseAddress = new Uri(hostSettings.BaseUrl ?? ""),
            };

            var _response = await client.PutAsJsonAsync("clients", new
            {
                username = Environment.UserName,
                os = Environment.OSVersion.VersionString,
                hostname = Environment.MachineName,
                appVersion = Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "0.0.0.0",
                tenantId = hostSettings.TenantId,
                id = hostSettings.Id
            });
        }
    }
}
