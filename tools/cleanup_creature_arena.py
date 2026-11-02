"""Auditable cleanup of obsolete exports and diagnostics; source/runtime protected.

Audit first. --apply requires the final-checks.json acceptance result and verifies
every candidate's path and hash again. No Git metadata or live server log is removed.
"""
from pathlib import Path
import argparse,hashlib,json,zipfile
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--apply',action='store_true');args=parser.parse_args()
manifest=ROOT/'docs/cleanup-creature-arena-20261031.json'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def safe(p):
    p=p.resolve();p.relative_to(ROOT);assert not any(x in p.parts for x in ['.git','.agents','.codex','.aws']);assert p.is_file();return p
if not args.apply:
    candidates={};runtime='\n'.join(p.read_text(encoding='utf8',errors='ignore') for p in (ROOT/'demo').rglob('*') if p.is_file() and p.suffix in ['.js','.html','.css'] and 'verification' not in p.parts)
    def add(p,reason):
        p=safe(p);candidates[str(p.relative_to(ROOT)).replace('\\','/')]={'reason':reason,'bytes':p.stat().st_size,'sha256':sha(p)}
    for p in (ROOT/'Assets').rglob('*.fbx'):
        assert p.name not in runtime;add(p,'Legacy Unity FBX export; browser uses JS mesh data and editable Blender source is retained')
    retired=['Assets/Art/Blender/Environments/RomanArenaAndMoon.blend','tools/sync_arena_blender.py','tools/tests/verify_arena.js','tools/tests/arena_checks.js']
    archive=ROOT/'.runtime/arena-creatures-rollback-20261031.zip'
    if not archive.exists():
        with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
            for p in (ROOT/'.runtime/arena-creatures-before').rglob('*'):
                if p.is_file():z.write(p,'before/'+str(p.relative_to(ROOT/'.runtime/arena-creatures-before')).replace('\\','/'))
            for name in retired:
                p=ROOT/name
                if p.exists():z.write(p,'retired/'+name)
    for name in retired:
        p=ROOT/name
        if p.exists():add(p,'Superseded arena scene/exporter/tests; current scaled arena has replacement source and regressions, original archived')
    keep_reports={'arena-levels','creature-arena','terrain-traversal','meaningful-interactions'}
    for p in (ROOT/'demo/verification').rglob('*'):
        if p.is_file() and p.relative_to(ROOT/'demo/verification').parts[0] not in keep_reports:add(p,'Superseded generated diagnostic/report; current acceptance reports are retained')
    keep_runtime={'arena-levels-before-20261031.zip','arena-creatures-rollback-20261031.zip','game-server-8883.out.log','game-server-8883.err.log','game-server-8883.pid','void-debug.json'}
    for p in (ROOT/'.runtime').rglob('*'):
        if p.is_file() and p.name not in keep_runtime:add(p,'Completed temporary build input, diagnostic or backed-up intermediate file')
    for p in ROOT.rglob('*'):
        if not p.is_file() or '.git' in p.parts:continue
        if p.suffix=='.pyc' or p.suffix.startswith('.blend') and p.suffix[6:].isdigit():add(p,'Regenerable Python cache or Blender automatic backup')
    result={'workspace':str(ROOT),'retained':['demo runtime and assets','editable current Blender source','current builders/tests','active server logs','current acceptance reports','one rollback archive'],'files':candidates,'count':len(candidates),'bytes':sum(v['bytes'] for v in candidates.values())}
    manifest.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps({'candidates':result['count'],'MiB':round(result['bytes']/1048576,2)}))
else:
    accepted=json.loads((ROOT/'demo/verification/creature-arena/final-checks.json').read_text(encoding='utf8'));assert accepted['allPassed'],'Complete acceptance checks before deletion'
    plan=json.loads(manifest.read_text(encoding='utf8'));removed=[]
    for name,spec in plan['files'].items():
        if (ROOT/name).exists():
            p=safe(ROOT/name);assert sha(p)==spec['sha256'],'Changed since audit: '+name
    for name in plan['files']:
        if (ROOT/name).exists():safe(ROOT/name).unlink()
        removed.append(name)
    plan['removed']=removed;plan['applied']=True
    manifest.write_text(json.dumps(plan,ensure_ascii=False,indent=2),encoding='utf8')
    for parent in [ROOT/'.runtime',ROOT/'demo/verification',ROOT/'tools']:
        for p in sorted((p for p in parent.rglob('*') if p.is_dir()),key=lambda p:len(p.parts),reverse=True):
            p.resolve().relative_to(ROOT)
            if not any(p.iterdir()):p.rmdir()
    plan['removed']=removed;plan['applied']=True;manifest.write_text(json.dumps(plan,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps({'removed':len(removed),'MiB':round(plan['bytes']/1048576,2)}))
