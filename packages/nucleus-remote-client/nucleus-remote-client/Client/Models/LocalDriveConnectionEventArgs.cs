using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace nucleus_remote_client.Client.Models
{
    enum LocalDriveConnectionEventType
    {
        Connected,
        Disconnected,
    }

    internal class LocalDriveConnectionEventArgs : EventArgs
    {
        public DriveInfo DriveInfo { get; set; }
        public LocalDriveConnectionEventType EventType { get; set; }

        private LocalDriveConnectionEventArgs(DriveInfo driveInfo, LocalDriveConnectionEventType eventType)
        {
            DriveInfo = driveInfo;
            EventType = eventType;
        }

        internal static LocalDriveConnectionEventArgs Connected(string driveLetter)
        {
            return new LocalDriveConnectionEventArgs(new DriveInfo(driveLetter), LocalDriveConnectionEventType.Connected);
        }
        internal static LocalDriveConnectionEventArgs Disconnected(string driveLetter)
        {
            return new LocalDriveConnectionEventArgs(new DriveInfo(driveLetter), LocalDriveConnectionEventType.Disconnected);
        }
    }
}
