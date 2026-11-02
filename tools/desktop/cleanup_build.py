"""Remove only audited build/test intermediates, keeping source and playable EXE."""
from pathlib import Path
import argparse,hashlib,json,socket,stat
ROOT=Path(__file__).resolve().parents[2];manifest=ROOT/'docs/desktop-cleanup-20261102.json'
parser=argparse.ArgumentParser();parser.add_argument('--apply',action='store_true');args=parser.parse_args()
def safe(path):
    path=path.resolve();path.relative_to(ROOT);assert not any(s in path.parts for s in ['.git','.agents','.codex']);assert path.is_file();return path
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
if not args.apply:
    files={}
    def add(path,reason):
        path=safe(path);files[path.relative_to(ROOT).as_posix()]={'bytes':path.stat().st_size,'sha256':sha(path),'reason':reason}
    for directory in ['.runtime/desktop-build','.runtime/desktop-test','demo/verification/void-update','demo/verification/exploration-final']:
        for path in (ROOT/directory).rglob('*'):
            if path.is_file():add(path,'Completed build/test intermediate or duplicate verification output')
    for path in (ROOT/'.runtime').glob('*'):
        if path.is_file() and (path.suffix=='.js' or path.suffix=='.log' and not path.name.startswith('game-server-') or path.name in ['desktop-test-server.json','void-debug.json','void-inspection.json']):add(path,'Finished temporary diagnostic; final reports retained in demo/verification/desktop')
    for path in (ROOT/'tools').rglob('*.pyc'):add(path,'Regenerable Python bytecode')
    plan={'files':files,'count':len(files),'bytes':sum(p['bytes'] for p in files.values()),'retained':['Tsuventure.exe','demo playable map and assets','current Blender authoring sources','desktop source/build tools','current regression reports','rollback archives','game-server logs','Git metadata']};manifest.write_text(json.dumps(plan,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps({'candidates':plan['count'],'MiB':round(plan['bytes']/1048576,2)}))
else:
    assert json.loads((ROOT/'demo/verification/desktop/final-checks.json').read_text(encoding='utf8'))['allPassed']
    probe=socket.socket();assert probe.connect_ex(('127.0.0.1',8897))!=0,'Stop isolated test server before cleanup';probe.close()
    plan=json.loads(manifest.read_text(encoding='utf8'))
    for name,spec in plan['files'].items():assert sha(safe(ROOT/name))==spec['sha256'],'File changed after audit: '+name
    for name in plan['files']:safe(ROOT/name).unlink()
    empty=[]
    for area in [ROOT/'.runtime',ROOT/'demo/verification',ROOT/'tools']:
        for path in sorted((p for p in area.rglob('*') if p.is_dir()),key=lambda p:len(p.parts),reverse=True):
            path.resolve().relative_to(ROOT)
            if not any(path.iterdir()):
                try:path.rmdir()
                except PermissionError:path.chmod(stat.S_IWRITE);path.rmdir()
                empty.append(path.relative_to(ROOT).as_posix())
    plan.update(applied=True,removed=list(plan['files']),emptyDirectories=empty);manifest.write_text(json.dumps(plan,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps({'removed':plan['count'],'MiB':round(plan['bytes']/1048576,2)}))
