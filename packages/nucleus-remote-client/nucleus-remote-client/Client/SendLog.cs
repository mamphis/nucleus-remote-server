using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace nucleus_remote_client.Client
{
    internal class SendLog : IClient
    {
        public string Message { get; set; }
        public SendLog(string message)
        {
            this.Message = message;
        }
        public Task ExecuteAsync(HostSettings hostSettings)
        {
            Console.WriteLine(this.Message);
            return Task.CompletedTask;
        }
    }
}
