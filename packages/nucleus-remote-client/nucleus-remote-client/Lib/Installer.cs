using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace nucleus_remote_client.Lib
{
    internal class Installer
    {
        internal static void Install(string serviceName)
        {
            Console.WriteLine(Assembly.GetExecutingAssembly().GetName().Name);
            Console.WriteLine(Assembly.GetExecutingAssembly().GetName().Version);

            var ServiceBinPath = GetEntryLocation();
            Console.Write("Please enter your password: ");
            var Password = ReadSecret();
            string[] args = new string[]
            {
                "create",
                serviceName,
                "type=own",
                // "type=interact",
                "start=auto",
                "binpath=" + ServiceBinPath,
                "displayname=" + serviceName,
                "obj=" + Environment.UserDomainName + "\\" + Environment.UserName,
                "password=" + Password,
            };

            Console.WriteLine(args.Aggregate((a, b) => a + " " + b));

            var psi = new ProcessStartInfo("sc.exe", args);
            psi.RedirectStandardError = true;
            psi.RedirectStandardOutput = true;
            var proc = Process.Start(psi);

            proc.WaitForExit();

            Console.WriteLine(proc.StandardOutput.ReadToEnd());
            Environment.Exit(0);
        }
        internal static void Uninstall(string serviceName)
        {

            var ServiceBinPath = GetEntryLocation();

            string[] args = new string[]
            {
                "delete",
                serviceName,
            };

            Console.WriteLine(args.Aggregate((a, b) => a + " " + b));

            var psi = new ProcessStartInfo("sc.exe", args);
            psi.RedirectStandardError = true;
            psi.RedirectStandardOutput = true;
            var proc = Process.Start(psi);

            proc.WaitForExit();

            Console.WriteLine(proc.StandardOutput.ReadToEnd());
            Environment.Exit(0);
        }

        internal static void GrantUserToLogonAsService()
        {
            using (LsaWrapper lsa = new LsaWrapper())
            {
                lsa.AddPrivileges(Environment.UserDomainName + "\\" + Environment.UserName, "SeServiceLogonRight");
            }
        }

        private static string GetEntryLocation()
        {
            var path = Assembly.GetCallingAssembly().Location;
            if (path.EndsWith(".exe"))
            {
                return path;
            }

            return Path.ChangeExtension(path, ".exe");
        }

        private static string ReadSecret()
        {
            ConsoleKeyInfo keyInfo = Console.ReadKey(true);
            string text = "";
            while (keyInfo.Key != ConsoleKey.Enter)
            {
                if (keyInfo.Key == ConsoleKey.Backspace && text.Length > 0)
                {
                    text = text[..^1];
                    Console.SetCursorPosition(Console.CursorLeft - 1, Console.CursorTop);
                    Console.Write(' ');
                    Console.SetCursorPosition(Console.CursorLeft - 1, Console.CursorTop);
                }
                else if (keyInfo.Key != ConsoleKey.Backspace)
                {
                    text += keyInfo.KeyChar;
                    Console.Write('*');
                }

                keyInfo = Console.ReadKey(true);
            }

            Console.WriteLine();
            return text;
        }
    }
}
