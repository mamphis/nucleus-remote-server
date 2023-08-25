using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace nucleus_remote_client
{
    internal class PathHelper
    {
        internal static string GetPath(string path)
        {
            if (string.IsNullOrEmpty(path))
            {
                throw new ArgumentNullException("path");
            }

            if (Enum.TryParse<Environment.SpecialFolder>(path, true, out Environment.SpecialFolder result))
            {
                return Environment.GetFolderPath(result);
            }

            return path.Replace("{{username}}", Environment.UserName, StringComparison.OrdinalIgnoreCase);
        }
    }
}
