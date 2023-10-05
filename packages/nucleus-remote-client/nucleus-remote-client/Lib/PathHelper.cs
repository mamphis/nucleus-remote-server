using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace nucleus_remote_client.Lib
{
    internal class PathHelper
    {
        internal static string GetPath(string path)
        {
            if (string.IsNullOrEmpty(path))
            {
                throw new ArgumentNullException("path");
            }

            var parts = path.Split(new char[] { '/', '\\' });

            if (Enum.TryParse(parts[0], true, out Environment.SpecialFolder result))
            {
                var paths = new List<string> { Environment.GetFolderPath(result) };
                paths.AddRange(parts.Skip(1));
                return Path.Combine(paths.ToArray());
            }

            return path
                .Replace("{{username}}", Environment.UserName, StringComparison.OrdinalIgnoreCase)
                .Replace("{{cwd}}", Directory.GetCurrentDirectory());
        }
    }
}
