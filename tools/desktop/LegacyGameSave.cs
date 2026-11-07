/* Read-only migration of this game's localStorage records. Never opens a browser,
   changes a browser profile, or imports cookies, credentials or other sites. */
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Microsoft.Win32;

namespace TsuventureDesktop
{
    internal static class LegacyGameSave
    {
        internal static string SourceOverride,SelectedSource;
        sealed class Entry{internal ulong Sequence;internal string Value;}
        static readonly byte[] Prefix=Encoding.UTF8.GetBytes("_http://127.0.0.1:8883\0");
        static ulong Var(byte[] data,ref int index){ulong value=0;for(int shift=0;shift<64;shift+=7){if(index>=data.Length)throw new InvalidDataException();byte b=data[index++];value|=(ulong)(b&127)<<shift;if(b<128)return value;}throw new InvalidDataException();}
        static byte[] Slice(byte[] data,int offset,int length){if(offset<0||length<0||offset>data.Length-length)throw new InvalidDataException();byte[] result=new byte[length];Buffer.BlockCopy(data,offset,result,0,length);return result;}
        static byte[] Bytes(string file){using(FileStream stream=new FileStream(file,FileMode.Open,FileAccess.Read,FileShare.ReadWrite|FileShare.Delete)){if(stream.Length>128*1024*1024)throw new InvalidDataException();using(MemoryStream copy=new MemoryStream()){stream.CopyTo(copy);return copy.ToArray();}}}
        static string Text(byte[] data,int start){if(start>=data.Length)return "";if(data[start]==1)return Encoding.UTF8.GetString(data,start+1,data.Length-start-1);if(data[start]==0)return Encoding.Unicode.GetString(data,start+1,data.Length-start-1);throw new InvalidDataException();}
        static void Accept(Dictionary<string,Entry> found,byte[] key,byte[] value,ulong sequence,bool deleted)
        {
            if(key.Length<=Prefix.Length||!key.Take(Prefix.Length).SequenceEqual(Prefix))return;
            string name=Text(key,Prefix.Length);if(!GameSaves.IsGameKey(name))return;Entry previous;if(found.TryGetValue(name,out previous)&&previous.Sequence>=sequence)return;
            found[name]=new Entry{Sequence=sequence,Value=deleted?null:Text(value,0)};
        }
        static void Batch(byte[] data,Dictionary<string,Entry> found)
        {
            if(data.Length<12)return;ulong sequence=BitConverter.ToUInt64(data,0);int count=BitConverter.ToInt32(data,8),p=12;if(count<0||count>100000)return;
            for(int i=0;i<count;i++){if(p>=data.Length)throw new InvalidDataException();int tag=data[p++];int n=checked((int)Var(data,ref p));byte[] key=Slice(data,p,n);p+=n;byte[] value=new byte[0];if(tag==1){n=checked((int)Var(data,ref p));value=Slice(data,p,n);p+=n;}else if(tag!=0)throw new InvalidDataException();Accept(found,key,value,sequence+(ulong)i,tag==0);}
        }
        static void Log(byte[] data,Dictionary<string,Entry> found)
        {
            MemoryStream fragments=null;
            for(int block=0;block<data.Length;block+=32768){int end=Math.Min(data.Length,block+32768),p=block;while(p+7<=end){int length=data[p+4]|data[p+5]<<8,kind=data[p+6];p+=7;if(length==0&&kind==0)break;if(p+length>end)break;byte[] record=Slice(data,p,length);p+=length;try{if(kind==1)Batch(record,found);else if(kind==2){fragments=new MemoryStream();fragments.Write(record,0,record.Length);}else if((kind==3||kind==4)&&fragments!=null){fragments.Write(record,0,record.Length);if(kind==4){Batch(fragments.ToArray(),found);fragments.Dispose();fragments=null;}}}catch(InvalidDataException){}}}
            if(fragments!=null)fragments.Dispose();
        }
        static byte[] Snappy(byte[] data)
        {
            int p=0,n=checked((int)Var(data,ref p));if(n>64*1024*1024)throw new InvalidDataException();byte[] output=new byte[n];int at=0;
            while(p<data.Length&&at<n){int tag=data[p++],kind=tag&3,length,offset;if(kind==0){length=tag>>2;if(length<60)length++;else{int bytes=length-59;length=0;for(int i=0;i<bytes;i++)length|=data[p++]<<(i*8);length++;}if(length<0||at>n-length||p>data.Length-length)throw new InvalidDataException();Buffer.BlockCopy(data,p,output,at,length);p+=length;at+=length;continue;}
                if(kind==1){length=4+((tag>>2)&7);offset=((tag&224)<<3)|data[p++];}else{length=1+(tag>>2);int bytes=kind==2?2:4;offset=0;for(int i=0;i<bytes;i++)offset|=data[p++]<<(i*8);}if(offset<=0||offset>at||length<0||at>n-length)throw new InvalidDataException();for(int i=0;i<length;i++){output[at]=output[at-offset];at++;}}
            if(at!=n)throw new InvalidDataException();return output;
        }
        static byte[] Block(byte[] data,byte[] handle){int p=0,offset=checked((int)Var(handle,ref p)),size=checked((int)Var(handle,ref p));byte[] payload=Slice(data,offset,size);if(offset+size>=data.Length)throw new InvalidDataException();int compression=data[offset+size];return compression==0?payload:compression==1?Snappy(payload):throwData();}
        static byte[] throwData(){throw new InvalidDataException();}
        static IEnumerable<KeyValuePair<byte[],byte[]>> Entries(byte[] block)
        {
            if(block.Length<4)yield break;int restarts=BitConverter.ToInt32(block,block.Length-4),end=block.Length-4-restarts*4,p=0;byte[] previous=new byte[0];if(restarts<0||end<0)yield break;
            while(p<end){int shared=checked((int)Var(block,ref p)),unshared=checked((int)Var(block,ref p)),valueSize=checked((int)Var(block,ref p));if(shared>previous.Length||shared<0||unshared<0||valueSize<0||p>end-unshared-valueSize)throw new InvalidDataException();byte[] key=new byte[shared+unshared];Buffer.BlockCopy(previous,0,key,0,shared);Buffer.BlockCopy(block,p,key,shared,unshared);p+=unshared;byte[] value=Slice(block,p,valueSize);p+=valueSize;previous=key;yield return new KeyValuePair<byte[],byte[]>(key,value);}
        }
        static void Table(byte[] data,Dictionary<string,Entry> found)
        {
            if(data.Length<48||BitConverter.ToUInt64(data,data.Length-8)!=0xdb4775248b80fb57UL)return;
            int p=data.Length-48;Var(data,ref p);Var(data,ref p);int start=p;Var(data,ref p);Var(data,ref p);byte[] index=Block(data,Slice(data,start,p-start));
            foreach(var entry in Entries(index))foreach(var item in Entries(Block(data,entry.Value))){if(item.Key.Length<8)continue;ulong packed=BitConverter.ToUInt64(item.Key,item.Key.Length-8);Accept(found,Slice(item.Key,0,item.Key.Length-8),item.Value,packed>>8,(packed&255)==0);}
        }
        internal static Dictionary<string,string> ReadDirectory(string folder)
        {
            var found=new Dictionary<string,Entry>();if(!Directory.Exists(folder))return new Dictionary<string,string>();
            foreach(string file in Directory.GetFiles(folder).Where(f=>f.EndsWith(".ldb")||f.EndsWith(".sst")||f.EndsWith(".log")))try{byte[] bytes=Bytes(file);if(file.EndsWith(".log"))Log(bytes,found);else Table(bytes,found);}catch(Exception error){System.Diagnostics.Debug.WriteLine("Game save migration: "+error.GetType().Name);}
            return found.Where(e=>e.Value.Value!=null).ToDictionary(e=>e.Key,e=>e.Value.Value);
        }
        internal static Dictionary<string,string> Find()
        {
            if(SourceOverride!=null){SelectedSource=SourceOverride;return ReadDirectory(SourceOverride);}
            string local=Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);string[] browsers={@"Google\Chrome\User Data",@"Microsoft\Edge\User Data"};
            using(RegistryKey key=Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\Shell\Associations\UrlAssociations\http\UserChoice")){if(key!=null&&Convert.ToString(key.GetValue("ProgId")).StartsWith("MSEdge",StringComparison.OrdinalIgnoreCase))Array.Reverse(browsers);}
            foreach(string browser in browsers){string root=Path.Combine(local,browser);if(!Directory.Exists(root))continue;var profiles=Directory.GetDirectories(root).Where(d=>Path.GetFileName(d)=="Default"||Path.GetFileName(d).StartsWith("Profile ")).OrderByDescending(d=>Directory.GetLastWriteTimeUtc(Path.Combine(d,"Local Storage","leveldb"))).ToList();
                // Prefer the profile used by the old launcher without touching it.
                try{var state=GameSaves.Json.DeserializeObject(File.ReadAllText(Path.Combine(root,"Local State"))) as Dictionary<string,object>;var profile=state["profile"] as Dictionary<string,object>;string preferred=Convert.ToString(profile["last_used"]);if(preferred=="Default"||preferred.StartsWith("Profile "))profiles=profiles.OrderByDescending(d=>Path.GetFileName(d)==preferred).ToList();}catch{}
                foreach(string profile in profiles){string path=Path.Combine(profile,"Local Storage","leveldb");var result=ReadDirectory(path);if(result.Count>0){SelectedSource=path;return result;}}
            }return new Dictionary<string,string>();
        }
    }
}
