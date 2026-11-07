"""Read-only migration fixtures: WAL fragments, SST/Snappy, deletions and scope."""
from pathlib import Path
import json,struct,subprocess
ROOT=Path(__file__).resolve().parents[2];area=ROOT/'.runtime/native-desktop/storage-tests';area.mkdir(parents=True,exist_ok=True)
prefix=b'_http://127.0.0.1:8883\0'
def var(n):
 out=bytearray()
 while n>127:out.append((n&127)|128);n>>=7
 out.append(n);return bytes(out)
def key(name,origin=prefix):return origin+b'\1'+name.encode()
def value(text,utf16=False):return (b'\0'+text.encode('utf-16le')) if utf16 else b'\1'+text.encode()
def entry(k,v):return b'\0'+var(len(k))+var(len(v))+k+v
def block(records):return b''.join(entry(k,v) for k,v in records)+struct.pack('<II',0,1)
def snappy(data):
 n=len(data)-1
 if n<60:tag=bytes([n<<2])
 else:
  size=(n.bit_length()+7)//8;tag=bytes([(59+size)<<2])+n.to_bytes(size,'little')
 return var(len(data))+tag+data
def table(records,compressed):
 raw=block([(k+struct.pack('<Q',(seq<<8)|kind),v) for k,v,seq,kind in records]);payload=snappy(raw) if compressed else raw
 data=payload+bytes([int(compressed)])+b'\0'*4
 index=block([(b'last',var(0)+var(len(payload)))]);offset=len(data);data+=index+b'\0'*5
 footer=var(0)+var(0)+var(offset)+var(len(index));return data+footer.ljust(40,b'\0')+struct.pack('<Q',0xdb4775248b80fb57)
def log(records,seq):
 batch=struct.pack('<QI',seq,len(records))
 for k,v,deleted in records:batch+=bytes([0 if deleted else 1])+var(len(k))+k+(b'' if deleted else var(len(v))+v)
 out=bytearray();chunks=[batch[i:i+32761] for i in range(0,len(batch),32761)]
 for i,chunk in enumerate(chunks):
  kind=1 if len(chunks)==1 else 2 if i==0 else 4 if i==len(chunks)-1 else 3
  out+=b'\0'*4+struct.pack('<HB',len(chunk),kind)+chunk
  if i<len(chunks)-1:out+=b'\0'*(32768-len(out)%32768) if len(out)%32768 else b''
 return out
checks=[]
for compressed in [False,True]:
 source=area/str(compressed);source.mkdir(exist_ok=True)
 (source/'000001.ldb').write_bytes(table([(key('tsuventure_native_test'),value('old'),1,1),(key('tsuventure_deleted'),value('gone'),2,1),(key('other_app_key'),value('excluded'),3,1),(key('tsuventure_wrong_origin',b'_https://unrelated.invalid\0'),value('excluded'),4,1)],compressed))
 (source/'000002.log').write_bytes(log([(key('tsuventure_native_test'),value('new'),False),(key('tsuventure_deleted'),b'',True),(key('tsuventure_unicode'),value('Rừng Nguyệt Quang',True),False),(key('tsuventure_large'),value('x'*40000),False)],100))
 target=source/'result.json';r=subprocess.run([str(ROOT/'Tsuventure.exe'),'--headless','--verify-native-storage',str(target),'--legacy-source-dir',str(source)],timeout=30,creationflags=subprocess.CREATE_NO_WINDOW)
 d=json.loads(target.read_text(encoding='utf8'));v=d['values']
 for name,ok in [('migration succeeds',r.returncode==0),('latest WAL wins',v.get('tsuventure_native_test')=='new'),('deletion preserved','tsuventure_deleted' not in v),('UTF16 round trip',v.get('tsuventure_unicode')=='Rừng Nguyệt Quang'),('WAL fragmentation',v.get('tsuventure_large')=='x'*40000),('only game and origin',len(v)==3),('versioned native format',d['format']=='tsuventure-save' and d['version']==1)]:checks.append({'name':f'{compressed}: {name}','ok':ok})
(area/'report.json').write_text(json.dumps({'checks':checks},indent=2),encoding='utf8');print(json.dumps({'checks':len(checks),'failures':[c for c in checks if not c['ok']]}));assert all(c['ok'] for c in checks)
