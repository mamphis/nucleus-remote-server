using nucleus_remote_client.Tasks;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace nucleus_remote_client.Client
{
    internal class GetConfigurationTasks : IClient
    {
        public async Task ExecuteAsync(HostSettings hostSettings)
        {
            HttpClient client = new()
            {
                BaseAddress = new Uri(hostSettings.BaseUrl ?? ""),
            };

            var tasks = await client.GetFromJsonAsync<TaskContainer[]>($"clients/{hostSettings.Id}/tasks");

            if (tasks == null)
            {
                var _ = new SendLog("Cannot parse get tasks response").ExecuteAsync(hostSettings);
                return;
            }

            foreach (var taskContainer in tasks)
            {
                try
                {
                    ITask task = this.GetTask(taskContainer);
                    await task.Run(hostSettings);

                    var _ = new SendLog($"Execution of task {taskContainer.name} was successful.").ExecuteAsync(hostSettings);
                }
                catch (Exception ex)
                {
                    var _ = new SendLog(ex.Message).ExecuteAsync(hostSettings);
                }
            }
        }

        private ITask GetTask(TaskContainer taskContainer)
        {
            var options = new JsonSerializerOptions() { PropertyNameCaseInsensitive = true };
            if (taskContainer.content == null)
            {
                throw new Exception($"Task '{taskContainer.name}' of type {taskContainer.type} has no content.");
            }
            
            switch (taskContainer.type)
            {
                case "CreateShortcut":
                    var task = JsonSerializer.Deserialize<CreateShortcut>(taskContainer.content, options);
                    if (task == null)
                    {
                        throw new Exception($"Cannot deserialze task '{taskContainer.name}'.");
                    }

                    return task;
                default:
                    throw new Exception($"Cannot parse task, because the type '{taskContainer.type}' is unknown");
            }
        }
    }
}
