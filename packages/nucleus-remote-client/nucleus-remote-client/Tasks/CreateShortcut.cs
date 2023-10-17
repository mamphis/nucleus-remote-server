using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using IWshRuntimeLibrary;
using nucleus_remote_client.Lib;

namespace nucleus_remote_client.Tasks
{
    internal class CreateShortcut : ITask
    {
        public string? LinkDirectory { get; set; }
        public string? LinkName { get; set; }
        public string? TargetPath { get; set; }
        public string? Arguments { get; set; }
        public string? WorkingDirectory { get; set; }
        public string? IconLocation { get; set; }
        public bool OverrideExisting { get; set; }

        public Task Run(HostSettings hostSettings, TaskContainer taskContainer)
        {
            if (this.LinkDirectory == null)
            {
                throw new Exception("Invalid Link Directory. Cannot create shortcut.");
            }

            var dirPath = PathHelper.GetPath(LinkDirectory);
            var path = Path.Join(dirPath, LinkName + ".lnk");

            if (System.IO.File.Exists(path) && !OverrideExisting)
            {
                return Task.CompletedTask;
            }

            if (System.IO.File.Exists(path))
            {
                System.IO.File.Delete(path);
            }

            WshShell wshShell = new WshShell();
            IWshShortcut wshShortcut = wshShell.CreateShortcut(path);
            
            if (!string.IsNullOrEmpty(TargetPath))
            {
                wshShortcut.TargetPath = PathHelper.GetPath(TargetPath);
            }

            if (!string.IsNullOrEmpty(Arguments))
            {
                wshShortcut.Arguments = Arguments;
            }

            if (!string.IsNullOrEmpty(WorkingDirectory))
            {
                wshShortcut.WorkingDirectory = PathHelper.GetPath(WorkingDirectory);
            }

            if (!string.IsNullOrEmpty(IconLocation))
            {
                Console.WriteLine("Old Icon: " + wshShortcut.IconLocation);
                wshShortcut.IconLocation = IconLocation;
            }

            wshShortcut.Save();
            return Task.CompletedTask;
        }
    }
}
