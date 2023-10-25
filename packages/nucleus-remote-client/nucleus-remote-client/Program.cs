using nucleus_remote_client;
using nucleus_remote_client.Lib;
using System.Diagnostics;

var ServiceName = "nucleus-remote-agent";

if (args.Contains("install"))
{
    Installer.Install(ServiceName);
    return;
}

if (args.Contains("uninstall"))
{
    Installer.Uninstall(ServiceName);
    return;
}

if (args.Length == 0 && Environment.UserInteractive)
{
    // started without arguments... restart with no window
    var psi = new ProcessStartInfo(Installer.GetEntryLocation(), "run")
    {
        UseShellExecute = false,
        CreateNoWindow = true,
    };

    var proc = new Process
    {
        StartInfo = psi,
        EnableRaisingEvents = true
    };

    proc.Start();
    return;
}

var builder = Host.CreateApplicationBuilder(args);

builder.Services.Configure<HostSettings>(
    builder.Configuration.GetSection("HostSettings")
);

builder.Services.AddWindowsService(options =>
{
    options.ServiceName = ServiceName;
});

builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();
