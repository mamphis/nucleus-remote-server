using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace nucleus_remote_client.ClientImpl.Models
{
    internal class InstalledProgram
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
}
