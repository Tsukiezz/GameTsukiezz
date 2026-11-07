using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Web.Script.Serialization;

namespace TsuventureDesktop
{
    internal static class GameSaves
    {
        internal static readonly JavaScriptSerializer Json=new JavaScriptSerializer{MaxJsonLength=24*1024*1024,RecursionLimit=100};
        internal static string FileName;
        internal static bool IsGameKey(string key){return key!=null&&(key.StartsWith("tsuventure_",StringComparison.Ordinal)||key.StartsWith("tsukiezz_",StringComparison.Ordinal));}
        internal static Dictionary<string,string> Validate(object input)
        {
            Dictionary<string,object> data=input as Dictionary<string,object>;if(data==null)throw new InvalidDataException("Bản lưu không đúng định dạng.");
            Dictionary<string,string> values=new Dictionary<string,string>();long size=0;
            foreach(KeyValuePair<string,object> item in data){if(!IsGameKey(item.Key)||!(item.Value is string)||item.Key.Length>160)continue;string value=(string)item.Value;size+=value.Length;if(value.Length>5*1024*1024||size>20*1024*1024||values.Count>=128)throw new InvalidDataException("Bản lưu vượt giới hạn.");values[item.Key]=value;}
            return values;
        }
        internal static Dictionary<string,string> Read(string file)
        {
            if(!System.IO.File.Exists(file))return new Dictionary<string,string>();
            if(new FileInfo(file).Length>24*1024*1024)throw new InvalidDataException("Bản lưu quá lớn.");
            Dictionary<string,object> data=Json.DeserializeObject(System.IO.File.ReadAllText(file,Encoding.UTF8)) as Dictionary<string,object>;
            if(data==null||!data.ContainsKey("format")||Convert.ToString(data["format"])!="tsuventure-save"||!data.ContainsKey("version")||Convert.ToInt32(data["version"])!=1||!data.ContainsKey("values"))throw new InvalidDataException("Hãy chọn file bản lưu Tsuventure phiên bản 1.");
            return Validate(data["values"]);
        }
        internal static void Write(Dictionary<string,string> values,string file)
        {
            string folder=Path.GetDirectoryName(Path.GetFullPath(file));Directory.CreateDirectory(folder);
            string data=Json.Serialize(new{format="tsuventure-save",version=1,savedAt=DateTime.UtcNow.ToString("O"),values=values});
            string temporary=file+"."+Guid.NewGuid().ToString("N")+".tmp";System.IO.File.WriteAllText(temporary,data,new UTF8Encoding(false));
            if(System.IO.File.Exists(file))System.IO.File.Replace(temporary,file,file+".previous",true);else System.IO.File.Move(temporary,file);
        }
        internal static Dictionary<string,string> Initial()
        {
            if(System.IO.File.Exists(FileName))return Read(FileName);
            Dictionary<string,string> legacy=LegacyGameSave.Find();if(legacy.Count>0)Write(legacy,FileName);return legacy;
        }
    }
}
