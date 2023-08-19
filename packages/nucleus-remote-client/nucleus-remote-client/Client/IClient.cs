using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace nucleus_remote_client.Client
{
    internal interface IClient
    {
        Task ExecuteAsync(HostSettings hostSettings);
    }
}
