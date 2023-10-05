using nucleus_remote_client;
using nucleus_remote_client.Lib;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.Configure<HostSettings>(
    builder.Configuration.GetSection("HostSettings")
);

builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();
