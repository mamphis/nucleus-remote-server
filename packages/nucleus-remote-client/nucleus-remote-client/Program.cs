using nucleus_remote_client;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddHostedService<Worker>();

builder.Services.Configure<HostSettings>(
    builder.Configuration.GetSection("HostSettings")
);


var host = builder.Build();
host.Run();
