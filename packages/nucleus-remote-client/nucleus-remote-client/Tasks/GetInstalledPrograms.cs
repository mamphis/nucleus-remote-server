using Microsoft.Win32;
using nucleus_remote_client.Client;
using nucleus_remote_client.Lib;
using System.Text.Json;

namespace nucleus_remote_client.Tasks
{
    internal class GetInstalledPrograms : ITask
    {

        struct InstalledProgram
        {
            public string Name { get; set; }
            public string Version { get; set; }
            public string RegistryKey { get; set; }

            public InstalledProgram(string name, string version, string registryKey)
            {
                this.Name = name;
                this.Version = version;
                this.RegistryKey = registryKey;
            }
        }
        public async Task Run(HostSettings hostSettings)
        {
            string registry_key = @"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall";
            string registry_key_32 = @"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall";

            List<InstalledProgram> installed = new List<InstalledProgram>();
            using (RegistryKey key = Registry.LocalMachine.OpenSubKey(registry_key))
            {
                foreach (string subkey_name in key.GetSubKeyNames())
                {
                    using (RegistryKey subkey = key.OpenSubKey(subkey_name))
                    {
                        installed.Add(new InstalledProgram(subkey.GetValue("DisplayName")?.ToString() ?? subkey_name, subkey.GetValue("DisplayVersion")?.ToString() ?? "-unknown-", subkey.Name));
                    }
                }
            }
            using (RegistryKey key = Registry.LocalMachine.OpenSubKey(registry_key_32))
            {
                foreach (string subkey_name in key.GetSubKeyNames())
                {
                    using (RegistryKey subkey = key.OpenSubKey(subkey_name))
                    {
                        installed.Add(new InstalledProgram(subkey.GetValue("DisplayName")?.ToString() ?? subkey_name, subkey.GetValue("DisplayVersion")?.ToString() ?? "-unknown-", subkey.Name));
                    }
                }
            }

            await SendLog.Info(hostSettings, JsonSerializer.Serialize(installed));
        }
    }
}
