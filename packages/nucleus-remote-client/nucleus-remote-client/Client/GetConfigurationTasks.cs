using Microsoft.Extensions.Options;
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
        private static readonly HashSet<string> RunnedTasks = new HashSet<string>();

        public async Task ExecuteAsync(HostSettings hostSettings)
        {
            HttpClient client = new()
            {
                BaseAddress = new Uri(hostSettings.BaseUrl ?? ""),
            };

            var tasks = await client.GetFromJsonAsync<TaskContainer[]>($"clients/{hostSettings.Id}/tasks");

            if (tasks == null)
            {
                await SendLog.Error(hostSettings, "Cannot parse get tasks response");
                return;
            }

            foreach (var taskContainer in tasks.Where(task => this.Runnable(task)))
            {
                try
                {
                    ITask task = this.GetTask(taskContainer);
                    await task.Run(hostSettings);
                    
                    await SendLog.Info(hostSettings, $"Execution of task {taskContainer.name} was successful.");
                    RunnedTasks.Add(taskContainer.id);
                }
                catch (Exception ex)
                {
                    await SendLog.Error(hostSettings, $"Task {taskContainer.name}: " + ex.Message);
                }
            }
        }

        private bool Runnable(TaskContainer taskContainer)
        {
            if (!taskContainer.active)
            {
                return false;
            }

            if (taskContainer.runOnce && RunnedTasks.Contains(taskContainer.id))
            {
                return false;
            }

            return true;
        }

        private ITask GetTask(TaskContainer taskContainer)
        {

            if (string.IsNullOrEmpty(taskContainer.content))
            {
                throw new Exception($"Task '{taskContainer.name}' of type {taskContainer.type} has no content.");
            }

            switch (taskContainer.type)
            {
                case "CreateShortcut":
                    return GetTask<CreateShortcut>(taskContainer);
                case "Delete":
                    return GetTask<Delete>(taskContainer);
                case "DownloadFile":
                    return GetTask<DownloadFile>(taskContainer);
                case "ExecuteFile":
                    return GetTask<ExecuteFile>(taskContainer);
                default:
                    throw new Exception($"Cannot parse task, because the type '{taskContainer.type}' is unknown");
            }
        }

        private T GetTask<T>(TaskContainer taskContainer)
        {
            var options = new JsonSerializerOptions() { PropertyNameCaseInsensitive = true };
            var task = JsonSerializer.Deserialize<T>(taskContainer.content, options);
            if (task == null)
            {
                throw new Exception($"Cannot deserialze task '{taskContainer.name}'.");
            }

            return task;
        }
    }
}
