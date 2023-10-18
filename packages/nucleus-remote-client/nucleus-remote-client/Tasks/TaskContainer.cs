using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using IWshRuntimeLibrary;

namespace nucleus_remote_client.Tasks
{
    internal enum OutputType
    {
        All,
        OnlyError,
        Special,
    }

    internal class TaskContainer
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }
        [JsonPropertyName("name")]
        public string? Name { get; set; }
        [JsonPropertyName("type")]
        public string? Type { get; set; }
        [JsonPropertyName("content")]
        public string? Content { get; set; }
        [JsonPropertyName("output")]
        [JsonConverter(typeof(JsonStringEnumConverter<OutputType>))]
        public OutputType Output { get; set; }
        [JsonPropertyName("active")]
        public bool Active { get; set; }
        [JsonPropertyName("runOnce")]
        public bool RunOnce { get; set; }
    }
}
