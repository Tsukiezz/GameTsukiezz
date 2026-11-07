"""Verify Blender source of staff, screens and lighting against its runtime export."""
from pathlib import Path
import bpy,json
ROOT=Path(__file__).resolve().parents[1];checks=[]
def check(name,ok,detail=None):checks.append({'name':name,'ok':bool(ok),'detail':detail})
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'Assets/Art/Blender/Environments/TsukiezzTerminalLife.blend'))
asset=bpy.data.collections['Tsukiezz terminal - staff and fixtures']
raw=(ROOT/'demo/features/railway/data/terminal-life.js').read_text(encoding='utf8');D=json.JSONDecoder().raw_decode(raw[raw.index('=')+1:])[0]
check('Editable Blender objects match runtime export',len(asset.objects)==D['sourceObjects'] and D['sourceObjects']>1000)
for kind in ['clerk','engineer','bot']:
 parts=[p for p in D['parts'] if p['model']==kind];check('Six independent motion pivots '+kind,len(parts)==6 and set(p['pivot'] for p in parts)==set(D['pivots'][kind]))
 points=[(p['positions'][i]+D['pivots'][kind][p['pivot']][i%3]) for p in parts for i in range(1,len(p['positions']),3)]
 check('Feet below head, correct Y-up export '+kind,min(points)>=-.001 and max(points)>2,{'minY':min(points),'maxY':max(points)})
 check('Front face has distinctive eyes '+kind,sum('eye' in o.name.lower() and o.get('model')==kind for o in asset.objects)>=2)
check('Fourteen TV enclosures with shared program slots',len(D['screens'])==14 and sum(s['kind']=='space' for s in D['screens'])==4)
check('Screens stay clear of both elevator landings',all(not(abs(s['position'][0]-x)<3.1 and abs(s['position'][2]-z)<3.1 and s['position'][1]<22) for s in D['screens'] for x in [-18,18] for z in [-74,74]))
check('Four crescent chandelier suspensions',sum(o.name.startswith('Chandelier suspension') for o in asset.objects)==4)
check('Lighting and chassis are only two static draw groups',len([p for p in D['parts'] if p['model']=='decor'])==2)
check('Detailed fixtures and staff stay below sixty thousand unique triangles',30000<D['triangles']<60000,D['triangles'])
report={'checks':checks,'failures':[c for c in checks if not c['ok']]};(ROOT/'.runtime/terminal-life/blender-checks.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps({'checks':len(checks),'failures':report['failures']}),flush=True);assert not report['failures']
