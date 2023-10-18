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

namespace nucleus_remote_client.Client
{
    internal class GetConfigurationTasks : IClient
    {
        private static readonly HashSet<string> RunnedTasks = new();

        public async Task ExecuteAsync(HostSettings hostSettings)
        {
            var client = ClientHelper.GetHttpClient(hostSettings);
            var tasks = await client.GetFromJsonAsync<TaskContainer[]>($"c2/{hostSettings.Id}/tasks");

            if (tasks == null)
            {
                await SendLog.Error(hostSettings, "Cannot parse get tasks response");
                return;
            }

            foreach (var taskContainer in tasks.Where(task => Runnable(task)))
            {
                try
                {
                    ITask task = GetTask(taskContainer);
                    await task.Run(hostSettings, taskContainer);
                    if (taskContainer.Output == OutputType.All)
                    {
                        await SendLog.Info(hostSettings, $"[Task {taskContainer.Name}]: Execution was successful.");
                    }

                    if (taskContainer.Id != null)
                    {
                        RunnedTasks.Add(taskContainer.Id);
                    }
                }
                catch (Exception ex)
                {
                    await SendLog.Error(hostSettings, $"[Task {taskContainer.Name}]: " + ex.Message);
                }
            }
        }

        private static bool Runnable(TaskContainer taskContainer)
        {
            if (!taskContainer.Active)
            {
                return false;
            }

            if (taskContainer.Id == null)
            {
                return false;
            }

            if (taskContainer.RunOnce && RunnedTasks.Contains(taskContainer.Id))
            {
                return false;
            }

            return true;
        }

        private static ITask GetTask(TaskContainer taskContainer)
        {

            if (string.IsNullOrEmpty(taskContainer.Content))
            {
                throw new Exception($"Task '{taskContainer.Name}' of type {taskContainer.Type} has no content.");
            }

            return taskContainer.Type switch
            {
                "CreateShortcut" => GetTask<CreateShortcut>(taskContainer),
                "Delete" => GetTask<Delete>(taskContainer),
                "DownloadFile" => GetTask<DownloadFile>(taskContainer),
                "ExecuteFile" => GetTask<ExecuteFile>(taskContainer),
                _ => throw new Exception($"Cannot parse task, because the type '{taskContainer.Type}' is unknown"),
            };
        }

        private static T GetTask<T>(TaskContainer taskContainer)
        {
            var options = new JsonSerializerOptions() { PropertyNameCaseInsensitive = true };
            if (taskContainer.Content == null)
            {
                throw new Exception($"Cannot deserialze task '{taskContainer.Name}' because the content is null.");
            }

            var task = JsonSerializer.Deserialize<T>(taskContainer.Content, options);
            return task == null ? throw new Exception($"Cannot deserialze task '{taskContainer.Name}'.") : task;
        }
    }
}
