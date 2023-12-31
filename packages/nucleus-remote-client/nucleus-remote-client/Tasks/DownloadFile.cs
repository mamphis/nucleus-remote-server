﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using nucleus_remote_client.Lib;

namespace nucleus_remote_client.Tasks
{
    internal class DownloadFile : ITask
    {
        public string? RemoteUrl { get; set; }
        public string? Destination { get; set; }
        public bool Override { get; set; }
        public bool IgnoreIfExists { get; set; }

        public async Task Run(HostSettings hostSettings, TaskContainer taskContainer)
        {
            if (Destination == null)
            {
                throw new MemberAccessException("The destination is not set.");
            }

            if (RemoteUrl == null)
            {
                throw new MemberAccessException("The remote url is not set.");
            }

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

            HttpClient client = new();

            var data = await client.GetByteArrayAsync(RemoteUrl);
            await File.WriteAllBytesAsync(path, data);
        }
    }
}
