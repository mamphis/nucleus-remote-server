using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace nucleus_remote_client.Lib
{
    internal class Cache<TKey, TValue> where TKey : notnull
    {
        public TimeSpan ValidTime { get; private set; }
        private readonly Dictionary<TKey, TValue> values = new();

        public Cache(TimeSpan validTime)
        {
            this.ValidTime = validTime;
        }

        public Cache() : this(TimeSpan.FromMinutes(5)) { }

        public void Set(TKey key, TValue value)
        {
            if (Has(key)) { return; }

            values.Add(key, value);
            Timer timer = new Timer((state) =>
            {
                values.Remove(key);
            }, null, this.ValidTime, Timeout.InfiniteTimeSpan);
        }

        public bool Has(TKey key)
        {
            return values.ContainsKey(key);
        }

        public TValue GetValue(TKey key)
        {
            return values[key];
        }
    }
}
