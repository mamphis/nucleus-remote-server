using nucleus_remote_client.ClientImpl.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Management;
using System.Runtime.Versioning;
using System.Text;
using System.Threading.Tasks;

namespace nucleus_remote_client.Lib
{
    internal class LocalDriveEventManager
    {

        internal event EventHandler<LocalDriveConnectionEventArgs>? OnLocalDrivesChanged;

        [SupportedOSPlatformGuard("windows")]
        private readonly bool _isWindows = OperatingSystem.IsWindows();

        [SupportedOSPlatform("windows")]
        private void SetupWindowsEvents()
        {
            ManagementEventWatcher watcher = new();
            WqlEventQuery query = new("SELECT * FROM Win32_VolumeChangeEvent WHERE EventType = 2 OR EventType = 3");
            watcher.EventArrived += (sender, e) =>
            {
                var driveLetter = e.NewEvent.Properties["DriveName"].Value.ToString();
                var type = e.NewEvent.Properties["EventType"].Value.ToString();

                if (driveLetter != null && type != null)
                {
                    if (type == "2")
                        OnLocalDrivesChanged?.Invoke(null, LocalDriveConnectionEventArgs.Connected(driveLetter));
                    else if (type == "3")
                        OnLocalDrivesChanged?.Invoke(null, LocalDriveConnectionEventArgs.Disconnected(driveLetter));
                }
            };
            watcher.Query = query;
            watcher.Start();
        }


        internal LocalDriveEventManager()
        {
            if (_isWindows)
            {
                SetupWindowsEvents();
            }
        }
    }
}
