using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace nucleus_remote_client.ClientImpl.Models
{
    internal class LocalDrive
    {
        [JsonPropertyName("driveLetter")]
        public string DriveLetter { get; set; }
        [JsonPropertyName("driveDescription")]
        public string DriveDescription { get; set; }
        [JsonPropertyName("driveType")]
        public string DriveType { get; set; }
        [JsonPropertyName("driveFileSystem")]
        public string DriveFileSystem { get; set; }
        [JsonPropertyName("driveSize")]
        public long DriveSize { get; set; }
        [JsonPropertyName("driveFreeSpace")]
        public long DriveFreeSpace { get; set; }

        public LocalDrive(DriveInfo driveInfo)
        {
            DriveLetter =   driveInfo.Name;
            DriveDescription = driveInfo.VolumeLabel;
            DriveSize = driveInfo.TotalSize;
            DriveFreeSpace = driveInfo.TotalFreeSpace;
            DriveType = driveInfo.DriveType.ToString();
            DriveFileSystem = driveInfo.DriveFormat;
        }
    }
}
