using nucleus_remote_client.ClientImpl;
using nucleus_remote_client.Tasks;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
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
            string[] args = new string[]
            {
                "create",
                "\"" + serviceName + "\"",
                "type=own",
                "type=interact",
                "start=auto",
                "binpath=\"" + ServiceBinPath + "\"",
                "displayname=\"" + serviceName + "\"",
                "obj=LocalSystem",
            };

            Console.WriteLine(args.Aggregate((a, b) => a + " " + b));

            var psi = new ProcessStartInfo(ServiceBinPath, args)
            {
                CreateNoWindow = true,
            };

            psi.RedirectStandardOutput = true;
            psi.RedirectStandardError = true;
            psi.UseShellExecute = false;

            var proc = new Process
            {
                StartInfo = psi,
                EnableRaisingEvents = true
            };

            string outputData = "";
            string errorData = "";

            proc.OutputDataReceived += (sender, args) => outputData += args.Data + "\n";
            proc.ErrorDataReceived += (sender, args) => errorData += args.Data + "\n";

            proc.Exited += async (sender, args) =>
            {
                var exitCode = proc.ExitCode;
                await Console.Out.WriteLineAsync(outputData);
                await Console.Error.WriteLineAsync(errorData);
            };

            proc.Start();
            proc.BeginOutputReadLine();
            proc.BeginErrorReadLine();

            if (proc == null)
            {
                Console.WriteLine("Failed to start process");
                return;
            }

            Console.WriteLine("Process started: " + proc.Id);

            proc.WaitForExit();
        }

        internal static void Uninstall(string serviceName)
        {

            var ServiceBinPath = GetEntryLocation();

            string[] args = new string[]
            {
                "delete",
                "\"" + serviceName + "\"",
            };

            Console.WriteLine(args.Aggregate((a, b) => a + " " + b));

            var psi = new ProcessStartInfo("sc.exe", args)
            {
                RedirectStandardError = true,
                RedirectStandardOutput = true
            };
            var proc = Process.Start(psi);
            if (proc == null)
            {
                Console.WriteLine("Failed to start process");
                Environment.Exit(1);
            }

            proc.WaitForExit();

            Console.WriteLine(proc.StandardOutput.ReadToEnd());
            Environment.Exit(0);
        }

        internal static void GrantUserToLogonAsService()
        {
            using LsaWrapper lsa = new();
            lsa.AddPrivileges(Environment.UserDomainName + "\\" + Environment.UserName, "SeServiceLogonRight");
        }

        internal static string GetEntryLocation()
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
