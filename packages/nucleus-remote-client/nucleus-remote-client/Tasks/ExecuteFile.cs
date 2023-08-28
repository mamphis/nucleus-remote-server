using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace nucleus_remote_client.Tasks
{
    internal class ExecuteFile : ITask
    {
        public string File { get; set; }
        public string? Arguments { get; set; }
        public bool HideWindow { get; set; }
        public bool StartIfProcessIsRunning { get; set; }

        private static Dictionary<string, int> StartedProcesses = new Dictionary<string, int>();

        public async Task Run(HostSettings hostSettings)
        {
            var path = PathHelper.GetPath(File);

            if (string.IsNullOrEmpty(path))
            {
                return;
            }

            if (StartedProcesses.ContainsKey(path) && !this.StartIfProcessIsRunning)
            {
                var existingProc = Process.GetProcesses().FirstOrDefault(p => p.Id == StartedProcesses[path]);
                if (existingProc != null && !existingProc.HasExited)
                {
                    return;
                }

                StartedProcesses.Remove(path);
            }

            var psi = new ProcessStartInfo(path, this.Arguments ?? "");
            psi.CreateNoWindow = this.HideWindow;

            var proc = Process.Start(psi);
            if (proc == null)
            {
                throw new Exception("The process cannot be started.");
            }

            ExecuteFile.StartedProcesses.Add(path, proc.Id);
        }
    }
}
