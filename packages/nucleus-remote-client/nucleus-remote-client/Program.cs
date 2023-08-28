using nucleus_remote_client;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.Configure<HostSettings>(
    builder.Configuration.GetSection("HostSettings")
);

var ServiceName = "nucleus-remote-client";
builder.Services.AddWindowsService(options =>
{
    options.ServiceName = ServiceName;
});

builder.Services.AddHostedService<Worker>();

if (args.Contains("install"))
{
    Installer.GrantUserToLogonAsService();
    Installer.Install(ServiceName);
}
if (args.Contains("uninstall"))
{
    Installer.Uninstall(ServiceName);
}

var host = builder.Build();
host.Run();
