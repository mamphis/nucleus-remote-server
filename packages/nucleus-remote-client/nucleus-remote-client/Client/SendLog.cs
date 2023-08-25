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
    internal class SendLog : IClient
    {
        public string Message { get; set; }
        public SendLog(string message)
        {
            this.Message = message;
        }
        public async Task ExecuteAsync(HostSettings hostSettings)
        {
            Console.WriteLine($"> {this.Message}");

            HttpClient client = new()
            {
                BaseAddress = new Uri(hostSettings.BaseUrl ?? ""),
            };

            var _response = await client.PostAsJsonAsync($"clients/{hostSettings.Id}/logs", new
            {
                message = this.Message,
            });

        }
    }
}
