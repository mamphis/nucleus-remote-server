using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace nucleus_remote_client.Lib
{
    public class FeatureFlag
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string TenantId { get; set; }
        public bool Enabled { get; set; }
    }
}
