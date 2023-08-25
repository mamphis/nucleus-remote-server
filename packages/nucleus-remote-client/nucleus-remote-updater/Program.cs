using nucleus_remote_updater;
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
ServiceManager.StopService(SERVICE_NAME);
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

ServiceManager.StartService(SERVICE_NAME);

Thread.Sleep(5000);
Directory.Delete(UPDATE_DIRNAME, true);
Directory.Delete(BACKUP_DIRNAME, true);
File.Delete(UPDATE_FILENAME);