using nucleus_remote_client.Lib;
using System.Net.Http.Json;
using System.Runtime.Versioning;
using System.Management;
using System.IO;
using IWshRuntimeLibrary;
using nucleus_remote_client.ClientImpl.Models;

namespace nucleus_remote_client.ClientImpl
{
    internal class SendLocalDrives : IClient
    {

        public async Task<HttpResponseMessage?> ExecuteAsync(HostSettings hostSettings)
        {
            if (!await FeatureFlags.IsFeatureEnabled(hostSettings, "f-1.0.12-drive_monitor"))
            {
                return null;
            }

            var drives = Environment.GetLogicalDrives().ToList().Select(drive =>
            {
                var driveInfo = new DriveInfo(drive);
                return new Models.LocalDrive(driveInfo);
            });

            var client = ClientHelper.GetHttpClient(hostSettings);
            return await client.PutAsJsonAsync($"c2/{hostSettings.Id}/localDrives", drives);
        }
    }
}
