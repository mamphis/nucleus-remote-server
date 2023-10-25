using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using nucleus_remote_client.ClientImpl;
using nucleus_remote_client.Lib;

namespace nucleus_remote_client.Tasks
{
    internal class ExecuteFile : ITask
    {
        public string? File { get; set; }
        public string? Arguments { get; set; }
        public bool HideWindow { get; set; }
        public bool StartIfProcessIsRunning { get; set; }

        private static readonly Dictionary<int, string> StartedProcesses = new();

        public Task Run(HostSettings hostSettings, TaskContainer taskContainer)
        {
            if (File == null)
            {
                throw new MemberAccessException("The file is not set.");
            }

            var path = PathHelper.GetPath(File);

            if (string.IsNullOrEmpty(path))
            {
                return Task.CompletedTask;
            }

            if (StartedProcesses.ContainsValue(path) && !this.StartIfProcessIsRunning)
            {
                var procs = Process.GetProcesses();
                foreach (var item in StartedProcesses)
                {
                    var existingProc = procs.FirstOrDefault(p => p.Id == item.Key);
                    if (existingProc != null && !existingProc.HasExited)
                    {
                        return Task.CompletedTask;
                    }

                    StartedProcesses.Remove(item.Key);
                }
            }

            var psi = new ProcessStartInfo(path, this.Arguments ?? "")
            {
                CreateNoWindow = this.HideWindow
            };

            var output = taskContainer.Output == OutputType.Special;

            psi.RedirectStandardOutput = output;
            psi.RedirectStandardError = output;
            psi.UseShellExecute = false;

            var proc = new Process
            {
                StartInfo = psi,
                EnableRaisingEvents = output
            };

            var processName = "";
            if (output)
            {
                string outputData = "";
                string errorData = "";

                async Task log(string type, string data)
                {
                    if (!string.IsNullOrWhiteSpace(data))
                    {
                        await SendLog.Info(hostSettings, $"[Task {taskContainer.Name}]: Process {proc.Id} (${processName}) {type}> {data}");
                    }
                }

                proc.OutputDataReceived += (sender, args) => outputData += args.Data + "\n";
                proc.ErrorDataReceived += (sender, args) => errorData += args.Data + "\n";

                proc.Exited += async (sender, args) =>
                {
                    var exitCode = proc.ExitCode;
                    await log("O", outputData);
                    await log("E", errorData);
                    await SendLog.Info(hostSettings, $"[Task {taskContainer.Name}]: Process {proc.Id} (${processName}) exited with exit code {exitCode}");
                };
            }

            try
            {
                proc.Start();
                proc.BeginOutputReadLine();
                proc.BeginErrorReadLine();
                processName = proc.ProcessName;
            }
            catch (Exception e)
            {
                throw new Exception($"The process cannot be started [{e.GetType().Name}]: {e.Message}");
            }

            ExecuteFile.StartedProcesses.Add(proc.Id, path);
            return Task.CompletedTask;
        }
    }
}
