using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using nucleus_remote_client.Client;
using nucleus_remote_client.Lib;

namespace nucleus_remote_client.Tasks
{
    internal class ExecuteFile : ITask
    {
        public string File { get; set; }
        public string? Arguments { get; set; }
        public bool HideWindow { get; set; }
        public bool StartIfProcessIsRunning { get; set; }

        private static Dictionary<int, string> StartedProcesses = new Dictionary<int, string>();

        public async Task Run(HostSettings hostSettings, TaskContainer taskContainer)
        {
            var path = PathHelper.GetPath(File);

            if (string.IsNullOrEmpty(path))
            {
                return;
            }

            if (StartedProcesses.ContainsValue(path) && !this.StartIfProcessIsRunning)
            {
                var procs = Process.GetProcesses();
                foreach (var item in StartedProcesses)
                {
                    var existingProc = procs.FirstOrDefault(p => p.Id == item.Key);
                    if (existingProc != null && !existingProc.HasExited)
                    {
                        return;
                    }

                    StartedProcesses.Remove(item.Key);
                }
            }

            var psi = new ProcessStartInfo(path, this.Arguments ?? "");
            psi.CreateNoWindow = this.HideWindow;

            var output = taskContainer.output == OutputType.Special;

            psi.RedirectStandardOutput = output;
            psi.RedirectStandardError = output;
            psi.UseShellExecute = false;

            var proc = new Process();
            proc.StartInfo = psi;
            proc.EnableRaisingEvents = output;

            var processName = "";
            if (output)
            {
                string outputData = "";
                string errorData = "";

                var log = async (string type, string data) =>
                {
                    if (!string.IsNullOrWhiteSpace(data))
                    {
                        await SendLog.Info(hostSettings, $"[Task {taskContainer.name}]: Process {proc.Id} (${processName}) {type}> {data}");
                    }
                };

                proc.OutputDataReceived += (sender, args) => outputData += args.Data + "\n";
                proc.ErrorDataReceived += (sender, args) => errorData += args.Data + "\n";

                proc.Exited += async (sender, args) =>
                {
                    var exitCode = proc.ExitCode;
                    await log("O", outputData);
                    await log("E", errorData);
                    await SendLog.Info(hostSettings, $"[Task {taskContainer.name}]: Process {proc.Id} (${processName}) exited with exit code {exitCode}");
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

        }
    }
}
