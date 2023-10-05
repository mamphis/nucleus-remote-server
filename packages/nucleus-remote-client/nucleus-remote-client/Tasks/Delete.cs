

using nucleus_remote_client.Lib;

namespace nucleus_remote_client.Tasks
{
    internal class Delete : ITask
    {
        public string? Path { get; set; }
        public bool Recursive { get; set; }
        public bool IgnoreIfMissing { get; set; }

        public Task Run(HostSettings hostSettings)
        {
            var path = PathHelper.GetPath(Path);
            if (!System.IO.Path.Exists(path))
            {
                if (this.IgnoreIfMissing)
                {
                    return Task.CompletedTask;
                }

                throw new Exception("The path does not exist.");
            }

            if (File.Exists(path))
            {
                File.Delete(path);
            }

            if (Directory.Exists(path))
            {
                Directory.Delete(path, Recursive);
            }


            return Task.CompletedTask;
        }
    }
}
