using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using IWshRuntimeLibrary;

namespace nucleus_remote_client.Tasks
{
    internal class TaskContainer
    {
        public string? id { get; set; }
        public string? name { get; set; }
        public string? type { get; set; }
        public string? content { get; set; }
    }
}
