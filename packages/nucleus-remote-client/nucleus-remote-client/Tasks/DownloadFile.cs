using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace nucleus_remote_client.Tasks
{
    internal class DownloadFile : ITask
    {
        public string RemoteUrl { get; set; }
        public string Destination { get; set; }
        public bool Override { get; set; }
        public bool IgnoreIfExists { get; set; }

        public async Task Run(HostSettings hostSettings)
        {
            var path = PathHelper.GetPath(Destination);
            if (File.Exists(path))
            {
                if (this.IgnoreIfExists)
                {
                    return;
                }

                if (this.Override)
                {
                    File.Delete(path);
                }
            }

            HttpClient client = new HttpClient();

            var data = await client.GetByteArrayAsync(RemoteUrl);
            await File.WriteAllBytesAsync(path, data);
        }
    }
}
