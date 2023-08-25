using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

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

            var appVersion = (AssemblyInformationalVersionAttribute?)Assembly.GetExecutingAssembly().GetCustomAttributes(typeof(AssemblyInformationalVersionAttribute), false).FirstOrDefault();
            var versionRegex = new Regex(@"\d+\.\d+\.\d+\+[a-f0-9]{8}");

            var response = await client.PutAsJsonAsync("clients", new
            {
                username = Environment.UserName,
                os = Environment.OSVersion.VersionString,
                hostname = Environment.MachineName,
                appVersion = versionRegex.Match(appVersion?.InformationalVersion ?? "0.0.0+00000000").Value,
                tenantId = hostSettings.TenantId,
                id = hostSettings.Id
            });

            Console.WriteLine(response.StatusCode);
            Console.WriteLine(await response.Content.ReadAsStringAsync());
        }
    }
}
