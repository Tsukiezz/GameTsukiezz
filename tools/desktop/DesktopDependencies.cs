using System;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Security.Cryptography;

namespace TsuventureDesktop
{
    internal static class DesktopDependencies
    {
        static string folder;
        [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)] static extern IntPtr LoadLibrary(string path);
        public static void Prepare()
        {
            folder=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"Tsuventure","Native",BuildInfo.LauncherId);
            Directory.CreateDirectory(folder);
            foreach(string name in new[]{"Microsoft.Web.WebView2.Core.dll","Microsoft.Web.WebView2.WinForms.dll",IntPtr.Size==8?"WebView2Loader.x64.dll":"WebView2Loader.x86.dll"})
            {
                string target=Path.Combine(folder,name.StartsWith("WebView2Loader")?"WebView2Loader.dll":name);
                using(Stream input=Assembly.GetExecutingAssembly().GetManifestResourceStream("Tsuventure.Native."+name))
                {
                    if(input==null)throw new FileNotFoundException("Thiếu thành phần hiển thị game: "+name);
                    byte[] expected;using(MemoryStream memory=new MemoryStream()){input.CopyTo(memory);expected=memory.ToArray();}
                    bool valid=false;if(File.Exists(target))using(SHA256 sha=SHA256.Create())valid=Convert.ToBase64String(sha.ComputeHash(File.ReadAllBytes(target)))==Convert.ToBase64String(sha.ComputeHash(expected));
                    if(!valid){string temporary=target+"."+Guid.NewGuid().ToString("N")+".tmp";File.WriteAllBytes(temporary,expected);if(File.Exists(target))File.Delete(target);File.Move(temporary,target);}
                }
            }
            AppDomain.CurrentDomain.AssemblyResolve+=delegate(object sender,ResolveEventArgs args)
            {
                string name=new AssemblyName(args.Name).Name;
                return name=="Microsoft.Web.WebView2.Core"||name=="Microsoft.Web.WebView2.WinForms"?Assembly.LoadFrom(Path.Combine(folder,name+".dll")):null;
            };
            if(LoadLibrary(Path.Combine(folder,"WebView2Loader.dll"))==IntPtr.Zero)throw new IOException("Không nạp được bộ hiển thị game Windows.");
        }
    }
}
