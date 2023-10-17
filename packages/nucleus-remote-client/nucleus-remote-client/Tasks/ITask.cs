using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using nucleus_remote_client.Lib;

namespace nucleus_remote_client.Tasks
{
    internal interface ITask
    {
        Task Run(HostSettings hostSettings, TaskContainer taskContainer);
    }
}
