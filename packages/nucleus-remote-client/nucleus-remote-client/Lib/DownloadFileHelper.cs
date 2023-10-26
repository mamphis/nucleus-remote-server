using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace nucleus_remote_client.Lib
{
    internal class DownloadFileHelper
    {
        internal static async Task<byte[]> DownloadData(HostSettings hostSettings, string url)
        {
            if (url.StartsWith("serverfile:"))
            {
                var httpClient = ClientHelper.GetHttpClient(hostSettings);
                var fileId = url.Replace("serverfile:", "");
                return await httpClient.GetByteArrayAsync($"c2/{hostSettings.Id}/files/{fileId}/download");
            }


            HttpClient client = new();
            return await client.GetByteArrayAsync(url);
        }
    }
}
