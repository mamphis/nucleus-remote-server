using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using IWshRuntimeLibrary;

namespace nucleus_remote_client.Tasks
{
    internal class CreateShortcut : ITask
    {
        /*var options = new JsonSerializerOptions
{
    PropertyNameCaseInsensitive = true
};*/
        public Environment.SpecialFolder LinkDirectory { get; set; }
        public string LinkName { get; set; }
        public string TargetPath { get; set; }
        public string? Arguments { get; set; }
        public string? WorkingDirectory { get; set; }
        public bool OverrideExisting { get; set; }

        internal async Task Run()
        {
            var path = Path.Join(Environment.GetFolderPath(LinkDirectory), LinkName + ".lnk");

            if (System.IO.File.Exists(path) && !OverrideExisting)
            {
                return;
            }

            if (System.IO.File.Exists(path))
            {
                System.IO.File.Delete(path);
            }

            WshShell wshShell = new WshShell();
            IWshShortcut wshShortcut = wshShell.CreateShortcut(path);
            wshShortcut.TargetPath = TargetPath;
            if (Arguments != null) { 
                wshShortcut.Arguments = Arguments;
            }

            if (WorkingDirectory != null)
            {
                wshShortcut.WorkingDirectory = WorkingDirectory;
            }

            wshShortcut.Save();
        }
    }
}
