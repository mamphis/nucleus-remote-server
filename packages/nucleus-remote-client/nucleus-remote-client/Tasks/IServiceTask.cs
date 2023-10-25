using nucleus_remote_client.Agent;
using nucleus_remote_client.Lib;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;

namespace nucleus_remote_client.Tasks
{
    internal abstract class IServiceTask : ITask
    {
        public abstract Task Run(HostSettings hostSettings, TaskContainer taskContainer);

        public static async Task SendToService(TaskContainer taskContainer)
        {
            HttpClient httpClient = new()
            {
                BaseAddress = new Uri($"http://localhost:{WindowsServiceImpl.PORT}")
            };

            await httpClient.PostAsJsonAsync("/", taskContainer);
        }
    }
}
