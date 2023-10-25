using nucleus_remote_client.ClientImpl;
using nucleus_remote_client.Tasks;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace nucleus_remote_client.Lib
{
    internal class FeatureFlags
    {
        private static readonly Cache<string, bool> cache = new();

        private static async Task GetFeatureFlags(HostSettings hostSettings)
        {
            try
            {
                var client = ClientHelper.GetHttpClient(hostSettings);
                var features = await client.GetFromJsonAsync<FeatureFlag[]>($"c2/{hostSettings.Id}/features");

                if (features == null)
                {
                    await SendLog.Error(hostSettings, "Cannot parse get features response");
                    return;
                }

                foreach (var feature in features)
                {
                    cache.Set(feature.Id, feature.Enabled);
                }
            }
            catch (Exception e)
            {
                await SendLog.Error(hostSettings, e.Message);
            }
        }

        public static async Task<bool> IsFeatureEnabled(HostSettings hostSettings, string featureId)
        {
            if (cache.Has(featureId))
            {
                return cache.GetValue(featureId);
            }

            await GetFeatureFlags(hostSettings);
            if (cache.Has(featureId))
            {
                return cache.GetValue(featureId);
            }

            return false;
        }
    }
}
