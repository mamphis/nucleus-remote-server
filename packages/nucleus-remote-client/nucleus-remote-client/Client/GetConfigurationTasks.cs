using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace nucleus_remote_client.Client
{
    internal class GetConfigurationTasks : IClient
    {
        public async Task ExecuteAsync(HostSettings hostSettings)
        {
            HttpClient client = new()
            {
                BaseAddress = new Uri(hostSettings.BaseUrl),
            };

            var response = await client.GetAsJsonAsync<TaskContainer[]>($"clients/{hostSettings.Id}/tasks");

            Console.WriteLine(response.StatusCode);
            Console.WriteLine(await response.Content.ReadAsStringAsync());
        }
    }
}
