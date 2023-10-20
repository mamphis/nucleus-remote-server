using Microsoft.Win32;
using nucleus_remote_client.Lib;
using nucleus_remote_client.Tasks;
using System.Net.Http.Json;
using System.Runtime.Versioning;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace nucleus_remote_client.Client
{
    internal class SendInstalledPrograms : IClient
    {
        struct InstalledProgram
        {
            [JsonPropertyName("name")]
            public string Name { get; set; }
            [JsonPropertyName("version")]
            public string Version { get; set; }
            [JsonPropertyName("registryKey")]
            public string RegistryKey { get; set; }
            [JsonPropertyName("publisher")]
            public string Publisher { get; set; }
            [JsonPropertyName("installDate")]
            public DateTime InstallDate { get; set; }
            public InstalledProgram(string name, string? version, string? publisher, string? installDate, string registryKey)
            {
                Name = name;
                Version = version ?? "- unknown -";
                Publisher = publisher ?? "- unknown -";

                if (DateTime.TryParseExact(installDate, "yyyyMMdd", null, System.Globalization.DateTimeStyles.None, out DateTime result))
                {
                    InstallDate = result;
                }
                else
                {
                    InstallDate = DateTime.MinValue;
                }

                RegistryKey = registryKey;
            }
        }


        [SupportedOSPlatformGuard("windows")]
        private readonly bool _isWindows = OperatingSystem.IsWindows();

        [SupportedOSPlatform("windows")]
        private static async Task WindowsSendInstalledPrograms(HostSettings hostSettings)
        {
            string registry_key = @"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall";
            string registry_key_32 = @"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall";

            static InstalledProgram GetInstalledProgram(string subkeyName, RegistryKey subkey)
            {
                return new InstalledProgram(
                    subkey.GetValue("DisplayName")?.ToString() ?? subkeyName,
                    subkey.GetValue("DisplayVersion")?.ToString(),
                    subkey.GetValue("Publisher")?.ToString(),
                    subkey.GetValue("InstallDate")?.ToString(),
                    subkey.Name);

            }

            List<InstalledProgram> installed = new();
            using (RegistryKey? key = Registry.LocalMachine.OpenSubKey(registry_key))
            {
                if (key != null)
                {
                    foreach (string subkey_name in key.GetSubKeyNames())
                    {
                        using RegistryKey? subkey = key.OpenSubKey(subkey_name);
                        if (subkey != null)
                        {
                            installed.Add(GetInstalledProgram(subkey_name, subkey));
                        }
                    }
                }
            }

            using (RegistryKey? key = Registry.LocalMachine.OpenSubKey(registry_key_32))
            {
                if (key != null)
                {
                    foreach (string subkey_name in key.GetSubKeyNames())
                    {
                        using RegistryKey? subkey = key.OpenSubKey(subkey_name);
                        if (subkey != null)
                        {
                            installed.Add(GetInstalledProgram(subkey_name, subkey));
                        }
                    }
                }
            }
            var client = ClientHelper.GetHttpClient(hostSettings);
            var _response = await client.PutAsJsonAsync($"c2/{hostSettings.Id}/installedApps", installed);
            if (!_response.IsSuccessStatusCode)
            {
                await SendLog.Error(hostSettings, await _response.Content.ReadAsStringAsync());
            }
        }

        public async Task ExecuteAsync(HostSettings hostSettings)
        {
            if (!await FeatureFlags.IsFeatureEnabled(hostSettings, "f-1.0.8-installed_apps"))
            {
                return;
            }

            if (_isWindows)
            {
                await WindowsSendInstalledPrograms(hostSettings);
            }
        }

    }
}
