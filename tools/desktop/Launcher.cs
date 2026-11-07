using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Net.Cache;
using System.Net.Sockets;
using System.Reflection;
using System.Runtime.InteropServices;
using Microsoft.Win32.SafeHandles;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Win32;

namespace TsuventureDesktop
{
    internal static class Launcher
    {
        static EventWaitHandle restart,openWindow;
        static LocalServer server;
        static NotifyIcon tray;
        static string originalLauncher, projectRoot,windowUserData,windowDebugPort;
        static int port = 8883;
        static string Url { get { return "http://127.0.0.1:" + port + "/"; } }

        [STAThread]
        static int Main(string[] args)
        {
            bool headless = Has(args, "--headless");
            try
            {
                string brandingReport=Value(args,"--verify-branding");
                if(brandingReport!=null) { WindowBranding.Verify(brandingReport);return 0; }
                string storageReport=Value(args,"--verify-native-storage");
                if(storageReport!=null){LegacyGameSave.SourceOverride=Value(args,"--legacy-source-dir");var migrated=LegacyGameSave.Find();GameSaves.Write(migrated,storageReport);return 0;}
                originalLauncher=Value(args,"--launcher")??Assembly.GetExecutingAssembly().Location;
                string portArg = Value(args, "--port");
                if (portArg != null && (!int.TryParse(portArg, out port) || port < 1024 || port > 65535))
                    throw new ArgumentException("Invalid local port.");
                string root = Value(args, "--root");
                if (root == null && File.Exists(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "demo", "index.html")))
                    root = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "demo");
                bool project = root != null;
                projectRoot=project?Path.GetFullPath(root):null;
                GameSaves.FileName=Value(args,"--save-file")??Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"Tsuventure","Saves","progress.json");
                windowUserData=Value(args,"--user-data-dir")??Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"Tsuventure","PlayerData");
                windowDebugPort=Value(args,"--test-debug-port");
                string cache = Value(args, "--cache-dir") ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Tsuventure", "Bundles");
                // Keep the Desktop EXE replaceable even while the server runs.
                // Its private, content-addressed copy owns the background tray.
                if (!headless && !Has(args, "--host"))
                {
                    string self = Assembly.GetExecutingAssembly().Location, fingerprint;
                    using (SHA256 digest = SHA256.Create())
                    using (FileStream input = File.OpenRead(self)) fingerprint = BitConverter.ToString(digest.ComputeHash(input)).Replace("-", "").ToLowerInvariant();
                    string hostFolder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Tsuventure", "Launcher", fingerprint);
                    Directory.CreateDirectory(hostFolder);
                    string hostExe = Path.Combine(hostFolder, "TsuventureHost.exe");
                    if (!File.Exists(hostExe))
                    {
                        string temporary = Path.Combine(hostFolder, Guid.NewGuid().ToString("N") + ".tmp");
                        File.Copy(self, temporary);
                        try { File.Move(temporary, hostExe); } catch (IOException) { if (!File.Exists(hostExe)) throw; File.Delete(temporary); }
                    }
                    string arguments = "--host --port " + port + " --cache-dir " + Quote(cache) + " --launcher " + Quote(self);
                    if (project) arguments += " --root " + Quote(Path.GetFullPath(root));
                    foreach(string option in new[]{"--save-file","--user-data-dir","--test-debug-port"})if(Value(args,option)!=null)arguments+=" "+option+" "+Quote(Value(args,option));
                    Process.Start(new ProcessStartInfo(hostExe, arguments) { UseShellExecute = false, CreateNoWindow = true, WindowStyle = ProcessWindowStyle.Hidden });
                    return 0;
                }
                string rootId = Hash(project ? Path.GetFullPath(root).ToLowerInvariant() : "bundle:" + BuildInfo.BundleId);
                string existing = ReadLocal("__tsuventure/status");
                if (existing != null && existing.Contains("\"game\":\"Tsuventure\""))
                {
                    if (existing.Contains("\"root\":\"" + rootId + "\"") && existing.Contains("\"bundle\":\"" + BuildInfo.BundleId + "\"") && existing.Contains("\"launcher\":\"" + BuildInfo.LauncherId + "\""))
                    { if (!headless)using(EventWaitHandle signal=EventWaitHandle.OpenExisting("Local\\Tsuventure.Open."+port))signal.Set(); return 0; }
                    using (EventWaitHandle signal = EventWaitHandle.OpenExisting("Local\\Tsuventure.Restart." + port)) signal.Set();
                    for (int i = 0; i < 40 && ReadLocal("__tsuventure/status") != null; i++) Thread.Sleep(150);
                }
                else
                {
                    string page = ReadLocal("");
                    if (page != null)
                    {
                        if (!page.Contains("<title>Tsuventure")) throw new IOException("Cổng " + port + " đang được ứng dụng khác sử dụng.");
                        string expectedPage;
                        if (project) expectedPage = File.ReadAllText(Path.Combine(root, "index.html"));
                        else using (Stream input = Assembly.GetExecutingAssembly().GetManifestResourceStream("Tsuventure.Game.zip"))
                            using (ZipArchive archive = new ZipArchive(input, ZipArchiveMode.Read))
                            using (StreamReader reader = new StreamReader(archive.GetEntry("index.html").Open())) expectedPage = reader.ReadToEnd();
                        if (Hash(page) != Hash(expectedPage)) throw new IOException("Một phiên game khác đang chạy ở cổng " + port + ". Hãy thoát phiên cũ trước khi mở bản mới.");
                        throw new IOException("Hãy thoát máy chủ web cũ ở cổng "+port+" trước khi mở cửa sổ Tsuventure mới.");
                    }
                }
                using (Mutex mutex = new Mutex(false, "Local\\Tsuventure.Server." + port))
                {
                    bool owns;
                    try { owns = mutex.WaitOne(10000); } catch (AbandonedMutexException) { owns = true; }
                    if (!owns) throw new IOException("Game đang khởi động. Vui lòng thử lại sau vài giây.");
                    try
                    {
                        root = project ? Path.GetFullPath(root) : ExtractBundle(cache);
                        if (!File.Exists(Path.Combine(root, "index.html"))) throw new FileNotFoundException("Không tìm thấy dữ liệu game.");
                        restart = new EventWaitHandle(false, EventResetMode.ManualReset, "Local\\Tsuventure.Restart." + port);
                        server = new LocalServer(root, port, rootId, project);
                        server.Start();
                        int seconds;
                        if (headless)
                        {
                            if (!int.TryParse(Value(args, "--timeout") ?? "180", out seconds) || seconds < 1 || seconds > 86400) seconds = 180;
                            restart.WaitOne(seconds * 1000);
                        }
                        else
                        {
                            Application.EnableVisualStyles();
                            DesktopDependencies.Prepare();
                            openWindow=new EventWaitHandle(false,EventResetMode.AutoReset,"Local\\Tsuventure.Open."+port);
                            tray = new NotifyIcon();
                            tray.Icon = Icon.ExtractAssociatedIcon(Assembly.GetExecutingAssembly().Location);
                            tray.Text = "Tsuventure — Bấm hai lần để chơi";
                            ContextMenuStrip menu = new ContextMenuStrip();
                            menu.Items.Add("Mở game", null, delegate { OpenGame(); });
                            menu.Items.Add("Thoát Tsuventure", null, delegate { Application.Exit(); });
                            tray.ContextMenuStrip = menu;
                            tray.DoubleClick += delegate { OpenGame(); };
                            tray.Visible = true;
                            System.Windows.Forms.Timer timer = new System.Windows.Forms.Timer();
                            timer.Interval = 300;
                            timer.Tick += delegate { if (restart.WaitOne(0)) Application.Exit();else if(openWindow.WaitOne(0))OpenGame(); };
                            timer.Start();
                            OpenGame();
                            Application.Run();
                            timer.Dispose();
                        }
                    }
                    finally
                    {
                        if (tray != null) { tray.Visible = false; tray.Dispose(); }
                        if (server != null) server.Stop();
                        if (restart != null) restart.Dispose();
                        if (openWindow != null) openWindow.Dispose();
                        mutex.ReleaseMutex();
                    }
                }
                return 0;
            }
            catch (Exception error)
            {
                try
                {
                    string log = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Tsuventure");
                    Directory.CreateDirectory(log);
                    File.AppendAllText(Path.Combine(log, "launcher.log"), DateTime.UtcNow.ToString("O") + " " + error + Environment.NewLine);
                }
                catch { }
                if (!headless) MessageBox.Show("Không mở được Tsuventure.\n\n" + error.Message, "Tsuventure", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return 1;
            }
        }

        static bool Has(string[] args, string name) { return Array.IndexOf(args, name) >= 0; }
        static string Value(string[] args, string name)
        {
            int i = Array.IndexOf(args, name);
            if (i < 0) return null;
            if (i + 1 >= args.Length) throw new ArgumentException("Missing value: " + name);
            return args[i + 1];
        }
        static string Hash(string value)
        {
            using (SHA256 hash = SHA256.Create()) return BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(value))).Replace("-", "").ToLowerInvariant().Substring(0, 24);
        }
        static string ExtractBundle(string cache)
        {
            string folder = Path.GetFullPath(Path.Combine(cache, BuildInfo.BundleId));
            Directory.CreateDirectory(folder);
            string prefix = folder.TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
            using (Stream stream = Assembly.GetExecutingAssembly().GetManifestResourceStream("Tsuventure.Game.zip"))
            using (ZipArchive archive = new ZipArchive(stream, ZipArchiveMode.Read))
            {
                foreach (ZipArchiveEntry entry in archive.Entries)
                {
                    if (entry.FullName.EndsWith("/")) continue;
                    string target = Path.GetFullPath(Path.Combine(folder, entry.FullName.Replace('/', Path.DirectorySeparatorChar)));
                    if (!target.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)) throw new InvalidDataException("Invalid bundled path.");
                    FileInfo file = new FileInfo(target);
                    if (file.Exists && file.Length == entry.Length) continue;
                    Directory.CreateDirectory(Path.GetDirectoryName(target));
                    using (Stream input = entry.Open())
                    using (FileStream output = new FileStream(target, FileMode.Create, FileAccess.Write, FileShare.None)) input.CopyTo(output);
                }
            }
            return folder;
        }
        static string ReadLocal(string path)
        {
            try
            {
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(Url + path);
                request.Proxy = null; request.Timeout = 1000; request.ReadWriteTimeout = 1000;
                request.CachePolicy = new RequestCachePolicy(RequestCacheLevel.NoCacheNoStore);
                using (WebResponse response = request.GetResponse())
                using (StreamReader reader = new StreamReader(response.GetResponseStream())) return reader.ReadToEnd();
            }
            catch { return null; }
        }
        static string Quote(string value) { return "\"" + value.TrimEnd('\\').Replace("\"", "") + "\""; }
        internal static string FreshUrl() { return Url + "?desktop=1&launch=" + Guid.NewGuid().ToString("N"); }
        internal static string RelaunchCommand { get { return Quote(originalLauncher)+" --port "+port+(projectRoot==null?"":" --root "+Quote(projectRoot)); } }
        static void OpenGame()
        {
            GameWindow.UserDataFolder=windowUserData;GameWindow.DebugPort=windowDebugPort;
            GameWindow.Open(FreshUrl());
        }
    }

    internal sealed class LocalServer
    {
        readonly string root, prefix, identity, physicalPrefix;
        readonly int port;
        readonly TcpListener listener;
        volatile bool running;
        public LocalServer(string folder, int localPort, string rootId, bool project)
        {
            root = Path.GetFullPath(folder); prefix = root.TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar; port = localPort;
            using (SafeFileHandle handle = CreateFile(root, 0, 7, IntPtr.Zero, 3, 0x02000000, IntPtr.Zero))
            { if (handle.IsInvalid) throw new IOException("Cannot open game directory."); physicalPrefix = FinalPath(handle).TrimEnd('\\') + "\\"; }
            identity = "{\"game\":\"Tsuventure\",\"bundle\":\"" + BuildInfo.BundleId + "\",\"launcher\":\"" + BuildInfo.LauncherId + "\",\"root\":\"" + rootId + "\",\"mode\":\"" + (project ? "project" : "embedded") + "\",\"port\":" + port + "}";
            listener = new TcpListener(IPAddress.Loopback, port);
        }
        public void Start()
        {
            listener.Start(128); running = true; ThreadPool.SetMinThreads(16, 16);
            Thread thread = new Thread(delegate()
            {
                while (running) try { TcpClient client = listener.AcceptTcpClient(); ThreadPool.QueueUserWorkItem(delegate { Serve(client); }); } catch (SocketException) { if (running) throw; } catch (ObjectDisposedException) { break; }
            }); thread.IsBackground = true; thread.Start();
        }
        public void Stop() { running = false; listener.Stop(); }
        void Serve(TcpClient client)
        {
            using (client)
            {
                try
                {
                    client.ReceiveTimeout = 10000; client.SendTimeout = 30000;
                    using (NetworkStream stream = client.GetStream())
                    {
                        StringBuilder request = new StringBuilder(); int value;
                        while (request.Length < 16384 && (value = stream.ReadByte()) >= 0)
                        {
                            request.Append((char)value);
                            if (request.Length >= 4 && request.ToString(request.Length - 4, 4) == "\r\n\r\n") break;
                        }
                        if (request.Length >= 16384) { Reply(stream, 431, "Headers too large", "text/plain", false); return; }
                        string[] lines = request.ToString().Split(new[] { "\r\n" }, StringSplitOptions.None), first = lines[0].Split(' ');
                        if (first.Length != 3) { Reply(stream, 400, "Bad request", "text/plain", false); return; }
                        bool head = first[0] == "HEAD";
                        if (!head && first[0] != "GET") { Reply(stream, 405, "Method not allowed", "text/plain", false); return; }
                        Dictionary<string, string> headers = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                        foreach (string line in lines) { int colon = line.IndexOf(':'); if (colon > 0) headers[line.Substring(0, colon).Trim()] = line.Substring(colon + 1).Trim(); }
                        string host;
                        if (!headers.TryGetValue("Host", out host) || !(host == "127.0.0.1:" + port || host == "localhost:" + port)) { Reply(stream, 403, "Local requests only", "text/plain", head); return; }
                        string url = first[1].Split('?')[0];
                        if (url == "/__tsuventure/status") { Reply(stream, 200, identity, "application/json; charset=utf-8", head); return; }
                        if (url == "/__tsuventure/launch") { Reply(stream, 200, "{\"url\":\"" + Launcher.FreshUrl() + "\"}", "application/json; charset=utf-8", head); return; }
                        if (!url.StartsWith("/")) { Reply(stream, 400, "Bad request", "text/plain", head); return; }
                        url = Uri.UnescapeDataString(url);
                        if (url.Contains("\\") || url.Contains(":")) { Reply(stream, 403, "Forbidden", "text/plain", head); return; }
                        string path = Path.GetFullPath(Path.Combine(root, url.TrimStart('/').Replace('/', Path.DirectorySeparatorChar)));
                        if (!path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase) && path != root) { Reply(stream, 403, "Forbidden", "text/plain", head); return; }
                        if (Directory.Exists(path)) path = Path.Combine(path, "index.html");
                        if (!File.Exists(path)) { Reply(stream, 404, "Not found", "text/plain", head); return; }
                        using (FileStream file = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete))
                        {
                            // Resolve real paths: OneDrive cloud files are valid reparse
                            // points, while a link leaving the game directory is not.
                            if (!FinalPath(file.SafeFileHandle).StartsWith(physicalPrefix, StringComparison.OrdinalIgnoreCase)) { Reply(stream, 403, "Forbidden", "text/plain", head); return; }
                            long start = 0, end = file.Length - 1; string range; bool partial = headers.TryGetValue("Range", out range);
                            if (partial && !ParseRange(range, file.Length, out start, out end)) { Header(stream, 416, 0, "text/plain", "Content-Range: bytes */" + file.Length + "\r\n"); return; }
                            long count = file.Length == 0 ? 0 : end - start + 1;
                            Header(stream, partial ? 206 : 200, count, Mime(path), partial ? "Content-Range: bytes " + start + "-" + end + "/" + file.Length + "\r\n" : "", Path.GetExtension(path).Equals(".html", StringComparison.OrdinalIgnoreCase));
                            if (head) return;
                            file.Seek(start, SeekOrigin.Begin); byte[] buffer = new byte[65536];
                            while (count > 0) { int read = file.Read(buffer, 0, (int)Math.Min(buffer.Length, count)); if (read == 0) break; stream.Write(buffer, 0, read); count -= read; }
                        }
                    }
                }
                catch (IOException) { } catch (SocketException) { } catch (ArgumentException) { } catch (UnauthorizedAccessException) { }
            }
        }
        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        static extern SafeFileHandle CreateFile(string name, uint access, uint share, IntPtr security, uint disposition, uint flags, IntPtr template);
        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        static extern uint GetFinalPathNameByHandle(SafeFileHandle handle, StringBuilder path, uint count, uint flags);
        static string FinalPath(SafeFileHandle handle)
        { StringBuilder path = new StringBuilder(32768); uint size = GetFinalPathNameByHandle(handle, path, (uint)path.Capacity, 0); if (size == 0 || size >= path.Capacity) throw new IOException("Cannot resolve game asset path."); return path.ToString(); }
        static bool ParseRange(string range, long length, out long start, out long end)
        {
            start = 0; end = length - 1;
            if (length == 0 || !range.StartsWith("bytes=") || range.Contains(",")) return false;
            string[] parts = range.Substring(6).Split('-'); long value;
            if (parts.Length != 2) return false;
            if (parts[0] == "") { if (!long.TryParse(parts[1], out value) || value <= 0) return false; start = Math.Max(0, length - value); }
            else
            {
                if (!long.TryParse(parts[0], out start) || start < 0 || start >= length) return false;
                if (parts[1] != "") { if (!long.TryParse(parts[1], out value) || value < start) return false; end = Math.Min(end, value); }
            }
            return true;
        }
        static void Reply(Stream stream, int status, string message, string mime, bool head)
        { byte[] data = Encoding.UTF8.GetBytes(message); Header(stream, status, data.Length, mime, ""); if (!head) stream.Write(data, 0, data.Length); }
        static void Header(Stream stream, int status, long length, string mime, string extra, bool document = false)
        {
            string reason = status == 200 ? "OK" : status == 206 ? "Partial Content" : status == 404 ? "Not Found" : status == 416 ? "Range Not Satisfiable" : "Request Error";
            byte[] bytes = Encoding.ASCII.GetBytes("HTTP/1.1 " + status + " " + reason + "\r\nContent-Type: " + mime + "\r\nContent-Length: " + length.ToString(CultureInfo.InvariantCulture) + "\r\nCache-Control: " + (document ? "no-store, max-age=0" : "no-cache") + "\r\nAccept-Ranges: bytes\r\nX-Content-Type-Options: nosniff\r\nConnection: close\r\n" + extra + "\r\n");stream.Write(bytes, 0, bytes.Length);
        }
        static string Mime(string path)
        {
            switch (Path.GetExtension(path).ToLowerInvariant())
            {
                case ".html": return "text/html; charset=utf-8";
                case ".js": return "application/javascript; charset=utf-8";
                case ".css": return "text/css; charset=utf-8";
                case ".json": case ".webmanifest": return "application/json; charset=utf-8";
                case ".png": return "image/png"; case ".jpg": case ".jpeg": return "image/jpeg";
                case ".svg": return "image/svg+xml"; case ".ico": return "image/x-icon";
                case ".webm": return "video/webm"; case ".mp4": return "video/mp4";
                case ".mp3": return "audio/mpeg"; case ".ogg": return "audio/ogg";
                case ".woff2": return "font/woff2"; case ".ttf": return "font/ttf";
                default: return "application/octet-stream";
            }
        }
    }
}
