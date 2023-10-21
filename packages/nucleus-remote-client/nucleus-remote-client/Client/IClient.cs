using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using nucleus_remote_client.Lib;

namespace nucleus_remote_client.Client
{
    internal interface IClient
    {
        Task<HttpResponseMessage?> ExecuteAsync(HostSettings hostSettings);
    }
}
