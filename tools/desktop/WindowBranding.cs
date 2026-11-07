using System;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text;
using System.Windows.Forms;

namespace TsuventureDesktop
{
    // Native game window identity, icon and relaunch command.
    internal static class WindowBranding
    {
        const string AppId = "Tsuventure.Game";
        static readonly Guid PropertySet = new Guid("9F4C2855-9F79-4B39-A8D0-E1D42DE1D5F3");
        static Icon largeIcon, smallIcon;
        delegate bool WindowCallback(IntPtr window, IntPtr data);
        [DllImport("user32.dll")] static extern bool EnumWindows(WindowCallback callback, IntPtr data);
        [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr window);
        [DllImport("user32.dll", CharSet=CharSet.Unicode)] static extern int GetWindowText(IntPtr window, StringBuilder text, int length);
        [DllImport("user32.dll", CharSet=CharSet.Unicode)] static extern int GetClassName(IntPtr window, StringBuilder text, int length);
        [DllImport("user32.dll", CharSet=CharSet.Unicode)] static extern IntPtr SendMessageTimeout(IntPtr window, uint message, IntPtr wParam, IntPtr lParam, uint flags, uint timeout, out IntPtr result);
        [DllImport("shell32.dll")] static extern int SHGetPropertyStoreForWindow(IntPtr window, ref Guid iid, out IPropertyStore store);
        [DllImport("ole32.dll")] static extern int PropVariantClear(ref PropertyValue value);
        [StructLayout(LayoutKind.Sequential)] struct PropertyKey { public Guid format; public uint id; public PropertyKey(uint value) { format=PropertySet; id=value; } }
        [StructLayout(LayoutKind.Explicit, Size=24)] struct PropertyValue
        {
            [FieldOffset(0)] public ushort type;
            [FieldOffset(8)] public IntPtr pointer;
            public static PropertyValue Text(string value) { return new PropertyValue { type=31, pointer=Marshal.StringToCoTaskMemUni(value) }; }
        }
        [ComImport, Guid("886D8EEB-8CF2-4446-8D02-CDBA1DBDCF99"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
        interface IPropertyStore
        {
            [PreserveSig] int GetCount(out uint count);
            [PreserveSig] int GetAt(uint index, out PropertyKey key);
            [PreserveSig] int GetValue(ref PropertyKey key, out PropertyValue value);
            [PreserveSig] int SetValue(ref PropertyKey key, ref PropertyValue value);
            [PreserveSig] int Commit();
        }
        static void Set(IPropertyStore store, uint id, string text)
        {
            PropertyKey key=new PropertyKey(id); PropertyValue value=PropertyValue.Text(text);
            try { Marshal.ThrowExceptionForHR(store.SetValue(ref key,ref value)); } finally { PropVariantClear(ref value); }
        }
        static string Get(IPropertyStore store, uint id)
        {
            PropertyKey key=new PropertyKey(id); PropertyValue value;
            Marshal.ThrowExceptionForHR(store.GetValue(ref key,out value));
            try { return value.type==31 ? Marshal.PtrToStringUni(value.pointer) : ""; } finally { PropVariantClear(ref value); }
        }
        static IPropertyStore Store(IntPtr window)
        {
            Guid iid=typeof(IPropertyStore).GUID; IPropertyStore store;
            Marshal.ThrowExceptionForHR(SHGetPropertyStoreForWindow(window,ref iid,out store));return store;
        }
        internal static void Apply(IntPtr window, string relaunch)
        {
            string executable=Assembly.GetExecutingAssembly().Location;
            if(largeIcon==null) { using(Icon source=Icon.ExtractAssociatedIcon(executable)) { largeIcon=new Icon(source,48,48);smallIcon=new Icon(source,16,16); } }
            IPropertyStore store=Store(window);
            try
            {
                // Windows requires relaunch properties before the explicit AppUserModelID.
                Set(store,2,relaunch);Set(store,3,executable+",0");Set(store,4,"Tsuventure");Set(store,5,AppId);
                Marshal.ThrowExceptionForHR(store.Commit());
            }
            finally { Marshal.ReleaseComObject(store); }
            IntPtr ignored;
            SendMessageTimeout(window,0x0080,new IntPtr(1),largeIcon.Handle,2,500,out ignored);
            SendMessageTimeout(window,0x0080,IntPtr.Zero,smallIcon.Handle,2,500,out ignored);
        }
        public static void Verify(string path)
        {
            using(Form form=new Form())
            {
                form.Text="Tsuventure branding test";form.ShowInTaskbar=false;
                IntPtr window=form.Handle;string command="\""+Assembly.GetExecutingAssembly().Location+"\"";
                Apply(window,command);IPropertyStore store=Store(window);
                try
                {
                    bool identity=Get(store,5)==AppId,icon=Get(store,3)==Assembly.GetExecutingAssembly().Location+",0",name=Get(store,4)=="Tsuventure",relaunch=Get(store,2)==command;
                    IntPtr nativeIcon;SendMessageTimeout(window,0x007F,new IntPtr(1),IntPtr.Zero,2,500,out nativeIcon);
                    bool image=nativeIcon!=IntPtr.Zero;
                    Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(path)));
                    File.WriteAllText(path,"{\"appId\":"+Bool(identity)+",\"iconResource\":"+Bool(icon)+",\"displayName\":"+Bool(name)+",\"relaunchCommand\":"+Bool(relaunch)+",\"windowIcon\":"+Bool(image)+"}");
                    if(!identity||!icon||!name||!relaunch||!image)throw new InvalidOperationException("Window branding verification failed.");
                }
                finally { Marshal.ReleaseComObject(store); }
            }
        }
        static string Bool(bool value) { return value?"true":"false"; }
    }
}
