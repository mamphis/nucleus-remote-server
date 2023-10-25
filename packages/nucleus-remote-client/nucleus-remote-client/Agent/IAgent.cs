using nucleus_remote_client.Lib;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace nucleus_remote_client.Agent
{
    internal interface IAgent
    {
        Task Run(HostSettings hostSettings, CancellationToken cancellationToken);
    }
}
