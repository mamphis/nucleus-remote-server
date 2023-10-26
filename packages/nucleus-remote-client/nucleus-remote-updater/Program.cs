using nucleus_remote_updater.Properties;
using System.Diagnostics;
using System.IO.Compression;

const string UPDATE_FILENAME = "update.zip";
const string UPDATE_DIRNAME = "update";
const string BACKUP_DIRNAME = "backup";
const string EXECUTABLE_NAME = "nucleus-remote-client";
const string SERVICE_NAME = "nucleus-remote-agent";
const int MAX_START_TRIES = 10;

int startTries = 0;
async Task CheckAssemblyFileVersion()
{
    await Console.Out.WriteLineAsync("Checking for update.");
    var servicePath = Path.GetFullPath(EXECUTABLE_NAME + ".exe");
    FileVersionInfo fvo = FileVersionInfo.GetVersionInfo(servicePath);

    HttpClient client = new();
    string newestVersion = await client.GetStringAsync(UpdaterSettings.Default.UpdateBaseUrl + "version");

    if (new Version(newestVersion) > new Version(fvo.FileVersion))
    {
        await Console.Out.WriteLineAsync($"Update to newest Version ({newestVersion}) from version {fvo.FileVersion}");
        return;
    }
    await Console.Out.WriteLineAsync("Software is up to date.");
    Environment.Exit(0);
}

void Cleanup()
{
    Console.WriteLine("Cleaning the update directories");
    if (File.Exists(UPDATE_FILENAME))
    {
        File.Delete(UPDATE_FILENAME);
    }
    if (Directory.Exists(UPDATE_DIRNAME))
    {
        Directory.Delete(UPDATE_DIRNAME, true);
    }
    if (Directory.Exists(BACKUP_DIRNAME))
    {
        Directory.Delete(BACKUP_DIRNAME, true);
    }
}

async Task PrepareUpdate()
{
    Console.WriteLine("Preparing the update");

    HttpClient client = new();
    byte[] versionZip = await client.GetByteArrayAsync(UpdaterSettings.Default.UpdateBaseUrl + "file");
    File.WriteAllBytes(UPDATE_FILENAME, versionZip);

    Directory.CreateDirectory(UPDATE_DIRNAME);
    Directory.CreateDirectory(BACKUP_DIRNAME);
    ZipFile.ExtractToDirectory(UPDATE_FILENAME, UPDATE_DIRNAME);
}

void StopExecutable()
{
    Console.WriteLine("Stopping the client.");
    var procs = Process.GetProcesses().Where(p => p.ProcessName == EXECUTABLE_NAME);
    foreach(var proc in procs)
    {
        proc.Kill();
        proc.WaitForExit();
    }

    Thread.Sleep(5000);
}

void ApplyUpdate()
{
    Console.WriteLine("Applying the update.");
    foreach (var relativeFilename in Directory.GetFiles(UPDATE_DIRNAME, "*.*", new EnumerationOptions() { RecurseSubdirectories = true }))
    {
        Console.WriteLine($"  > Updating file {relativeFilename}");
        try
        {
            var localFilename = relativeFilename[(UPDATE_DIRNAME.Length + 1)..];
            if (File.Exists(localFilename))
            {
                File.Move(localFilename, Path.Combine(BACKUP_DIRNAME, localFilename));
            }

            File.Copy(relativeFilename, localFilename);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"  ! -> " + ex.Message);
        }
    }
}

void StartExecutable()
{
    if (startTries > MAX_START_TRIES)
    {
        Console.WriteLine("Cannot start the client.");
        return;
    }

    startTries++;
    Console.WriteLine($"Starting the client. ({startTries}/{MAX_START_TRIES})");
    try
    {
        var servicePath = Path.GetFullPath(EXECUTABLE_NAME + ".exe");
        Process proc = Process.Start(servicePath);
        Thread.Sleep(5000);

        if (proc.HasExited)
        {
            throw new Exception($"Failed to start executable: " + proc.ExitCode);
        }

        var scProc = Process.Start("sc.exe", new string[] { "start", SERVICE_NAME});
        scProc.WaitForExit();
        if (scProc.ExitCode != 0)
        {
            throw new Exception($"Failed to start service: " + proc.ExitCode);
        }
    }
    catch (Exception e)
    {
        Console.WriteLine("Failed to apply Update: " + e.Message);
        Rollback();
    }
}

void Rollback()
{
    StopExecutable();
    Console.WriteLine("Applying the update.");
    foreach (var relativeFilename in Directory.GetFiles(BACKUP_DIRNAME, "*.*", new EnumerationOptions() { RecurseSubdirectories = true }))
    {
        var localFilename = relativeFilename[(BACKUP_DIRNAME.Length + 1)..];
        if (File.Exists(localFilename))
        {
            File.Delete(localFilename);
        }

        File.Copy(relativeFilename, localFilename);
    }

    StartExecutable();
}

Cleanup();

await CheckAssemblyFileVersion();

await PrepareUpdate();

StopExecutable();

ApplyUpdate();

StartExecutable();

Cleanup();
