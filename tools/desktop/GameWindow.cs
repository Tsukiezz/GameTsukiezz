using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace TsuventureDesktop
{
    internal sealed class GameWindow:Form
    {
        internal static GameWindow Current;
        internal static string UserDataFolder,DebugPort;
        readonly string url;readonly WebView2 view=new WebView2();readonly MenuStrip menu=new MenuStrip();
        string seedScript;bool closing,full;FormBorderStyle normalBorder;Rectangle normalBounds;
        Dictionary<string,string> pendingSave;readonly Timer saveTimer=new Timer{Interval=700};
        internal static void Open(string url)
        {
            if(Current!=null&&!Current.IsDisposed){if(Current.WindowState==FormWindowState.Minimized)Current.WindowState=FormWindowState.Normal;Current.Show();Current.Activate();return;}
            Current=new GameWindow(url);Current.Show();
        }
        GameWindow(string target)
        {
            url=target;Text="Tsuventure";Name="TsuventureGameWindow";Icon=Icon.ExtractAssociatedIcon(System.Reflection.Assembly.GetExecutingAssembly().Location);BackColor=Color.FromArgb(7,15,29);StartPosition=FormStartPosition.CenterScreen;Size=new Size(1440,940);MinimumSize=new Size(800,600);KeyPreview=true;
            var saves=new ToolStripMenuItem("Bản lưu");saves.DropDownItems.Add("Xuất bản lưu…",null,async delegate{await ExportSave();});saves.DropDownItems.Add("Nhập bản lưu…",null,async delegate{await ImportSave();});menu.Items.Add(saves);menu.Items.Add("Toàn màn hình · F11",null,delegate{ToggleFullScreen();});menu.BackColor=Color.FromArgb(18,29,43);menu.ForeColor=Color.Gainsboro;MainMenuStrip=menu;
            view.Dock=DockStyle.Fill;view.DefaultBackgroundColor=BackColor;Controls.Add(view);Controls.Add(menu);
            Shown+=async delegate{try{WindowBranding.Apply(Handle,Launcher.RelaunchCommand);}catch{}await StartView();};FormClosing+=OnClosing;FormClosed+=delegate{saveTimer.Stop();Flush();view.Dispose();Current=null;Application.Exit();};
            saveTimer.Tick+=delegate{saveTimer.Stop();Flush();};
        }
        async Task StartView()
        {
            try
            {
                var options=new CoreWebView2EnvironmentOptions("--autoplay-policy=no-user-gesture-required --disable-background-networking --disable-component-update --no-first-run");
                if(!String.IsNullOrEmpty(DebugPort))options.AdditionalBrowserArguments+=" --remote-debugging-port="+DebugPort;
                var environment=await CoreWebView2Environment.CreateAsync(null,UserDataFolder,options);await view.EnsureCoreWebView2Async(environment);
                var core=view.CoreWebView2;core.Settings.AreDefaultContextMenusEnabled=false;core.Settings.AreDevToolsEnabled=false;core.Settings.AreBrowserAcceleratorKeysEnabled=false;core.Settings.IsStatusBarEnabled=false;core.Settings.IsZoomControlEnabled=false;core.Settings.IsBuiltInErrorPageEnabled=false;
                core.AddWebResourceRequestedFilter("*",CoreWebView2WebResourceContext.All);
                core.WebResourceRequested+=delegate(object sender,CoreWebView2WebResourceRequestedEventArgs e){Uri resource;if(!Uri.TryCreate(e.Request.Uri,UriKind.Absolute,out resource))return;if(resource.Scheme=="data"||resource.Scheme=="blob"||resource.AbsoluteUri=="about:blank")return;if(!SameOrigin(resource))e.Response=core.Environment.CreateWebResourceResponse(new MemoryStream(),403,"Offline game","");};
                core.NavigationStarting+=delegate(object sender,CoreWebView2NavigationStartingEventArgs e){Uri destination;if(!Uri.TryCreate(e.Uri,UriKind.Absolute,out destination)||!SameOrigin(destination))e.Cancel=true;};
                core.NewWindowRequested+=delegate(object sender,CoreWebView2NewWindowRequestedEventArgs e){e.Handled=true;};
                core.ContainsFullScreenElementChanged+=delegate{if(core.ContainsFullScreenElement!=full)ToggleFullScreen();};
                core.PermissionRequested+=delegate(object sender,CoreWebView2PermissionRequestedEventArgs e){e.State=CoreWebView2PermissionState.Deny;};
                core.ProcessFailed+=delegate(object sender,CoreWebView2ProcessFailedEventArgs e){Log("Renderer: "+e.ProcessFailedKind);MessageBox.Show(this,"Bộ hiển thị game đã dừng. Hãy đóng và mở lại Tsuventure. Bản lưu gần nhất vẫn được giữ.","Tsuventure",MessageBoxButtons.OK,MessageBoxIcon.Information);};
                core.WebMessageReceived+=OnMessage;
                await Seed(GameSaves.Initial(),false);core.Navigate(url);view.Focus();
            }
            catch(WebView2RuntimeNotFoundException){MessageBox.Show(this,"Máy thiếu Microsoft Edge WebView2 Runtime. Cài thành phần WebView2 của Microsoft rồi mở lại game. Không cần Chrome hoặc tài khoản Google.","Tsuventure",MessageBoxButtons.OK,MessageBoxIcon.Information);Close();}
            catch(Exception error){Log(error.ToString());MessageBox.Show(this,"Không mở được cửa sổ game.\n"+error.Message,"Tsuventure",MessageBoxButtons.OK,MessageBoxIcon.Error);Close();}
        }
        bool SameOrigin(Uri uri){Uri origin=new Uri(url);return uri.Scheme==origin.Scheme&&uri.Host==origin.Host&&uri.Port==origin.Port;}
        static void Log(string value){try{string dir=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"Tsuventure");Directory.CreateDirectory(dir);File.AppendAllText(Path.Combine(dir,"native.log"),DateTime.UtcNow.ToString("O")+" "+value+Environment.NewLine);}catch{}}
        async Task Seed(Dictionary<string,string> values,bool force)
        {
            if(seedScript!=null)view.CoreWebView2.RemoveScriptToExecuteOnDocumentCreated(seedScript);
            string json=GameSaves.Json.Serialize(values),script=@"(()=>{if(window!==top||location.origin!==ORIGIN)return;const seed=SEED,game=k=>k.startsWith('tsuventure_')||k.startsWith('tsukiezz_');try{if(FORCE||!Object.keys(localStorage).some(game)){if(FORCE)for(const k of Object.keys(localStorage))if(game(k))localStorage.removeItem(k);for(const [k,v]of Object.entries(seed))localStorage.setItem(k,v);}}catch{}let timer;const collect=()=>Object.fromEntries(Object.keys(localStorage).filter(game).map(k=>[k,localStorage.getItem(k)]));window.tsuventureDesktop={snapshot:collect,host:'webview2'};const send=()=>{try{chrome.webview.postMessage({type:'save',values:collect()});}catch{}};for(const name of ['setItem','removeItem','clear']){const original=Storage.prototype[name];Storage.prototype[name]=function(...args){const result=original.apply(this,args);if(this===localStorage){clearTimeout(timer);timer=setTimeout(send,250);}return result;};}addEventListener('tsuventure-ready',send);addEventListener('pagehide',send);addEventListener('visibilitychange',()=>{if(document.hidden)send();});})();";
            // Apply an explicit import once, including across reloads in this window.
            script=script.Replace("if(FORCE||", "const importId=IMPORT_ID,applyForce=FORCE&&sessionStorage.getItem('__tsuventure_import')!==importId;if(applyForce)sessionStorage.setItem('__tsuventure_import',importId);if(applyForce||").Replace("if(FORCE)for", "if(applyForce)for");
            script=script.Replace("FORCE",force?"true":"false").Replace("IMPORT_ID",GameSaves.Json.Serialize(Guid.NewGuid().ToString("N"))).Replace("ORIGIN",GameSaves.Json.Serialize(new Uri(url).GetLeftPart(UriPartial.Authority))).Replace("SEED",json);
            script+="addEventListener('keydown',e=>{if(e.code==='F11'&&!e.repeat){e.preventDefault();e.stopImmediatePropagation();chrome.webview.postMessage({type:'fullscreen'});}},{capture:true});";
            seedScript=await view.CoreWebView2.AddScriptToExecuteOnDocumentCreatedAsync(script);
        }
        void OnMessage(object sender,CoreWebView2WebMessageReceivedEventArgs e)
        {
            try{Uri source;if(!Uri.TryCreate(e.Source,UriKind.Absolute,out source)||!SameOrigin(source))return;var message=GameSaves.Json.DeserializeObject(e.WebMessageAsJson) as Dictionary<string,object>;if(message==null||!message.ContainsKey("type"))return;if(Convert.ToString(message["type"])=="fullscreen"){ToggleFullScreen();return;}if(Convert.ToString(message["type"])!="save"||!message.ContainsKey("values"))return;pendingSave=GameSaves.Validate(message["values"]);saveTimer.Stop();saveTimer.Start();}catch(Exception error){System.Diagnostics.Debug.WriteLine(error.Message);}
        }
        void Flush(){if(pendingSave==null)return;try{GameSaves.Write(pendingSave,GameSaves.FileName);pendingSave=null;}catch(Exception error){System.Diagnostics.Debug.WriteLine(error.Message);}}
        async Task<Dictionary<string,string>> Snapshot(){if(view.CoreWebView2==null)return GameSaves.Initial();string data=await view.CoreWebView2.ExecuteScriptAsync("window.tsuventureDesktop?tsuventureDesktop.snapshot():{}");return GameSaves.Validate(GameSaves.Json.DeserializeObject(data));}
        async Task ExportSave(){try{pendingSave=await Snapshot();Flush();using(var dialog=new SaveFileDialog{Filter="Tsuventure save (*.json)|*.json",FileName="Tsuventure-save-"+DateTime.Now.ToString("yyyyMMdd-HHmm")+".json"})if(dialog.ShowDialog(this)==DialogResult.OK)GameSaves.Write(pendingSave??GameSaves.Read(GameSaves.FileName),dialog.FileName);}catch(Exception error){MessageBox.Show(this,error.Message,"Bản lưu");}}
        async Task ImportSave(){try{using(var dialog=new OpenFileDialog{Filter="Tsuventure save (*.json)|*.json"})if(dialog.ShowDialog(this)==DialogResult.OK){var data=GameSaves.Read(dialog.FileName);if(data.Count==0)throw new InvalidDataException("Bản lưu không có dữ liệu game.");if(MessageBox.Show(this,"Nạp bản lưu đã chọn? Tiến trình hiện tại được sao lưu trước khi thay.","Tsuventure",MessageBoxButtons.YesNo,MessageBoxIcon.Question)!=DialogResult.Yes)return;pendingSave=await Snapshot();Flush();GameSaves.Write(data,GameSaves.FileName);await Seed(data,true);view.CoreWebView2.Reload();}}catch(Exception error){MessageBox.Show(this,error.Message,"Bản lưu");}}
        async void OnClosing(object sender,FormClosingEventArgs e){if(closing)return;e.Cancel=true;closing=true;try{var request=Snapshot();if(await Task.WhenAny(request,Task.Delay(1500))==request)pendingSave=await request;}catch{}Flush();Close();}
        void ToggleFullScreen(){if(!full){normalBorder=FormBorderStyle;normalBounds=Bounds;WindowState=FormWindowState.Normal;FormBorderStyle=FormBorderStyle.None;Bounds=Screen.FromControl(this).Bounds;menu.Visible=false;full=true;}else{FormBorderStyle=normalBorder;Bounds=normalBounds;menu.Visible=true;full=false;}view.Focus();}
    }
}
