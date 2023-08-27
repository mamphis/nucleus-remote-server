using nucleus_remote_updater;
using System.Diagnostics;
using System.IO.Compression;

const string UPDATE_FILENAME = "update.zip";
const string UPDATE_DIRNAME = "update";
const string BACKUP_DIRNAME = "backup";
const string SERVICE_NAME = "nucleus-remote-client";


if (!File.Exists(UPDATE_FILENAME))
{
    return;
}
if (Directory.Exists(UPDATE_DIRNAME))
{
    Directory.Delete(UPDATE_DIRNAME, true);
}
if (Directory.Exists(BACKUP_DIRNAME))
{
    Directory.Delete(BACKUP_DIRNAME, true);
}

Directory.CreateDirectory(UPDATE_DIRNAME);
Directory.CreateDirectory(BACKUP_DIRNAME);
ZipFile.ExtractToDirectory(UPDATE_FILENAME, UPDATE_DIRNAME);

Thread.Sleep(5000);
var proc = Process.GetProcesses().FirstOrDefault(p => p.ProcessName == SERVICE_NAME);
var filename = proc?.StartInfo.FileName;
proc?.Kill();
Thread.Sleep(5000);

foreach (var relativeFilename in Directory.GetFiles(UPDATE_DIRNAME, "*.*", new EnumerationOptions() { RecurseSubdirectories = true }))
{
    var localFilename = relativeFilename.Substring(UPDATE_DIRNAME.Length + 1);
    if (File.Exists(localFilename))
    {
        File.Move(localFilename, Path.Combine(BACKUP_DIRNAME, localFilename));
    }

    File.Move(relativeFilename, localFilename);
}

if (filename != null)
{
    Process.Start(filename);
}
else
{
    Process.Start(SERVICE_NAME + ".exe");
}

Thread.Sleep(5000);
Directory.Delete(UPDATE_DIRNAME, true);
Directory.Delete(BACKUP_DIRNAME, true);
File.Delete(UPDATE_FILENAME);