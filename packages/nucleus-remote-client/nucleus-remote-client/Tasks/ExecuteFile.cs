using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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

        public async Task Run(HostSettings hostSettings)
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

            var proc = Process.Start(psi);
            if (proc == null)
            {
                throw new Exception("The process cannot be started.");
            }

            ExecuteFile.StartedProcesses.Add(proc.Id, path);
        }
    }
}
