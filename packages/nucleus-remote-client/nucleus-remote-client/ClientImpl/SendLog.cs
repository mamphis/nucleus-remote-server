using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using nucleus_remote_client.Lib;

namespace nucleus_remote_client.ClientImpl
{
    internal class SendLog : IClient
    {
        public string Message { get; set; }
        public string Level { get; set; }

        public SendLog(string level, string message)
        {
            this.Level = level;
            this.Message = message;
        }

        public async Task<HttpResponseMessage?> ExecuteAsync(HostSettings hostSettings)
        {
            Console.WriteLine($"> {this.Message}");
            try
            {
                var client = ClientHelper.GetHttpClient(hostSettings);
                return await client.PostAsJsonAsync($"c2/{hostSettings.Id}/logs", new
                {
                    level = this.Level,
                    message = this.Message,
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($">>> {ex.Message}");
            }

            return null;
        }

        public static async Task Info(HostSettings hostSettings, string message)
        {
            await new SendLog("info", message).ExecuteAsync(hostSettings);
        }

        public static async Task Error(HostSettings hostSettings, string message)
        {
            await new SendLog("error", message).ExecuteAsync(hostSettings);
        }
    }
}
