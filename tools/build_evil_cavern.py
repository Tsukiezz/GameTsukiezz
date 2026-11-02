"""Blender source for the unlit underground Evil God maze and its inhabitants."""
import bpy, json, math, random
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
rng=random.Random(241177)
old=bpy.data.collections.get('EvilGodCavern')
if old:
    bpy.data.batch_remove(ids=list(old.all_objects))
    bpy.data.collections.remove(old)
collection=bpy.data.collections.new('EvilGodCavern');bpy.context.scene.collection.children.link(collection)
palette={'moonrock':(.23,.25,.29),'cutstone':(.32,.35,.39),'diamond':(.54,.73,.78),'iron':(.13,.15,.19),'cloth':(.2,.10,.18),'bone':(.48,.44,.35),'worm':(.27,.25,.23),'teeth':(.6,.57,.47),'wood':(.18,.12,.08),'seal':(.37,.3,.18)}
materials={}
for name,color in palette.items():
    mat=bpy.data.materials.new('EvilCavern_'+name);mat.use_nodes=True;mat.diffuse_color=(*color,1)
    node=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED');node.inputs['Base Color'].default_value=(*color,1);node.inputs['Roughness'].default_value=.3 if name=='diamond' else .93
    materials[name]=mat

def boxgeo(x,y,z,w,h,d):
    vs=[[x+sx*w/2,y+sy*h/2,z+sz*d/2] for sx,sy,sz in [(-1,-1,-1),(-1,-1,1),(-1,1,-1),(-1,1,1),(1,-1,-1),(1,-1,1),(1,1,-1),(1,1,1)]];ids=[]
    for a,b,c,e in [(2,6,4,0),(5,7,3,1),(4,5,1,0),(3,7,6,2),(1,3,2,0),(6,7,5,4)]:ids.extend([a,b,c,a,c,e])
    return vs,ids

def oval(center,scale,segments=10,rows=6):
    vertices=[];indices=[]
    for j in range(rows+1):
        t=j*math.pi/rows
        for i in range(segments):a=i*math.tau/segments;vertices.append([center[0]+math.sin(t)*math.cos(a)*scale[0],center[1]+math.cos(t)*scale[1],center[2]+math.sin(t)*math.sin(a)*scale[2]])
    for j in range(rows):
        for i in range(segments):a=j*segments+i;b=j*segments+(i+1)%segments;indices.extend([a,b,a+segments,b,b+segments,a+segments])
    return vertices,indices

def crystal(x,y,z,r,h):
    vs=[[x,y,z],[x,y+h,z]]+[[x+math.cos(i*math.tau/6)*r,y+h*.4,z+math.sin(i*math.tau/6)*r] for i in range(6)];ids=[]
    for i in range(6):a=2+i;b=2+(i+1)%6;ids.extend([0,b,a,1,a,b])
    return vs,ids

def mesh(name,geometry,material):
    vs,ids=geometry;data=bpy.data.meshes.new(name);data.from_pydata([(x,-z,y) for x,y,z in vs],[],[ids[i:i+3] for i in range(0,len(ids),3)]);data.update()
    obj=bpy.data.objects.new(name,data);collection.objects.link(obj);data.materials.append(materials[material]);return obj

parts=[];colliders=[]
def part(name,geometry,material):
    vs,ids=geometry;parts.append(dict(name=name,vertices=vs,indices=ids,material=material));return mesh(name,geometry,material)
def box(name,x,y,z,w,h,d,material='moonrock',solid=False,standable=False):
    obj=part(name,boxgeo(x,y,z,w,h,d),material)
    if solid:colliders.append(dict(name=name,x=x,z=z,width=w,depth=d,minY=y-h/2,maxY=y+h/2,standable=standable))
    return obj

N=21;STEP=10;CX=125;CZ=-320;FLOOR=-44;SIZE=N*STEP;X0=CX-SIZE/2;Z0=CZ-SIZE/2;HEIGHT=6.4
center=lambda i:[X0+(i%N+.5)*STEP,FLOOR,Z0+(i//N+.5)*STEP]
entry=(N-1)*N+N//2;middle=(N//2)*N+N//2
links=[set() for _ in range(N*N)]
def join(a,b):links[a].add(b);links[b].add(a)
seen={entry};stack=[entry]
while stack:
    a=stack[-1];x=a%N;z=a//N;options=[zz*N+xx for xx,zz in [(x-1,z),(x+1,z),(x,z-1),(x,z+1)] if 0<=xx<N and 0<=zz<N and zz*N+xx not in seen]
    if not options:stack.pop();continue
    b=rng.choice(options);join(a,b);seen.add(b);stack.append(b)
for _ in range(36):
    a=rng.randrange(N*N);options=[b for b in [a+1,a+N] if b<N*N and abs(a%N-b%N)+abs(a//N-b//N)==1]
    if options:join(a,rng.choice(options))
room={z*N+x for z in range(N//2-1,N//2+2) for x in range(N//2-1,N//2+2)}
for a in room:
    for b in [a-1,a+1,a-N,a+N]:
        if b in room and abs(a%N-b%N)+abs(a//N-b//N)==1:join(a,b)
box('Cavern_MoonstoneFloor',CX,FLOOR-.4,CZ,SIZE+.9,.8,SIZE+.9,'moonrock',True,True)
wall_start=len(colliders)
for row in range(N+1):
    for col in range(N):
        a=(row-1)*N+col;b=row*N+col
        if row==N and col==N//2:continue
        if 0<row<N and b in links[a]:continue
        box('MazeWall_H',X0+(col+.5)*STEP,FLOOR+HEIGHT/2,Z0+row*STEP,STEP+.9,HEIGHT,.9,solid=True)
for col in range(N+1):
    for row in range(N):
        a=row*N+col-1;b=row*N+col
        if 0<col<N and b in links[a]:continue
        box('MazeWall_V',X0+col*STEP,FLOOR+HEIGHT/2,Z0+(row+.5)*STEP,.9,HEIGHT,STEP+.9,solid=True)
wall_end=len(colliders)
for cell in range(N*N):
    if cell in room:continue
    x,y,z=center(cell);box('MoonrockRoof',x,FLOOR+HEIGHT+.4,z,STEP,.8,STEP,solid=True)
box('DiamondChamberRoof',CX,FLOOR+11.4,CZ,30,.8,30,solid=True)
for side in [-1,1]:
    for other in [-1,1]:
        x=CX+side*12;z=CZ+other*12;box('DiamondChamberPillar',x,FLOOR+5,z,1.4,10,1.4,'cutstone',True)
        for j in range(7):part('UnlitDiamondCluster',crystal(x+math.cos(j*2.4)*1.3,FLOOR,z+math.sin(j*2.4)*1.3,.3+j%3*.12,1.4+j%4*.4),'diamond')
chest=[CX+4,FLOOR,CZ-4]
box('SealedTreasuryChest',CX+4,FLOOR+.8,CZ-4,3,1.6,2.4,'wood',True)
for x in [CX+2.9,CX+5.1]:box('ChestIronBand',x,FLOOR+.82,CZ-4,.16,1.7,2.48,'iron')
box('TreasureSeal',CX+4,FLOOR+1.35,CZ-2.75,.45,.6,.2,'seal')

raw=(ROOT/'demo/features/world/data/expanded-realm.js').read_text(encoding='utf8');realm=json.loads(raw[raw.index('{'):raw.rfind('}')+1])
def surface(x,z):
    n=realm['segments'];u=(x+realm['size']/2)/realm['size']*n;v=(z+realm['size']/2)/realm['size']*n;i=int(u);j=int(v);fx=u-i;fz=v-j;hs=realm['heights'];a=hs[j*(n+1)+i];b=hs[j*(n+1)+i+1];c=hs[(j+1)*(n+1)+i];d=hs[(j+1)*(n+1)+i+1]
    return a+(b-a)*fx+(c-a)*fz if fx+fz<=1 else d+(c-d)*(1-fx)+(b-d)*(1-fz)
top=surface(CX,-108);steps=math.ceil((top-FLOOR)/.24);run=107/steps;tunnel=dict(x=CX,z0=-108,z1=-215,top=top,bottom=FLOOR,width=6,steps=steps)
for i in range(steps):
    z=-108-(i+.5)*run;y=top-(i+1)*(top-FLOOR)/steps
    box('Descent_MoonstoneStep',CX,y-.35,z,6,.7,run+.015,'cutstone')
    for side in [-1,1]:box('Descent_RockWall',CX+side*3.5,y+2.9,z,1,6.6,run+.03,solid=True)
    box('Descent_RockRoof',CX,y+6.3,z,8,.6,run+.03,solid=True)
for side in [-1,1]:box('CaveGate_Pillar',CX+side*4.7,top+2.4,-108,1.8,4.8,3.2,'cutstone',True)
for i in range(15):
    a=i*math.pi/15;b=(i+1)*math.pi/15;vs=[]
    for z in [-109.6,-106.4]:
        for r,t in [(3.8,a),(5.6,a),(5.6,b),(3.8,b)]:vs.append([CX+math.cos(t)*r,top+3.7+math.sin(t)*r,z])
    ids=[0,1,2,0,2,3,4,6,5,4,7,6,0,4,5,0,5,1,1,5,6,1,6,2,2,6,7,2,7,3,3,7,4,3,4,0];part('LunarStoneEntranceArch',(vs,ids),'cutstone')
guards=[[CX-7,surface(CX-7,-102),-102],[CX+7,surface(CX+7,-102),-102]]

models={}
for kind in ['worm','warrior']:
    pieces=[];joints={'body':[0,0,0]}
    def modelpart(name,joint,geometry,material):
        vs,ids=geometry;pieces.append(dict(name=name,joint=joint,vertices=vs,indices=ids,material=material))
    if kind=='worm':
        for i in range(9):
            joints['segment'+str(i)]=[0,i*.55,0];y=i*.55
            modelpart('RockArmouredSegment','segment'+str(i),oval((0,y,0),(1.2-i*.035,.47,1.15-i*.025),12,6),'worm')
            for j in range(6):a=j*math.tau/6;modelpart('StoneSpine','segment'+str(i),crystal(math.cos(a)*1.05,y,math.sin(a)*1.05,.18,.55),'moonrock')
        joints['jaw']=[0,4.6,0]
        modelpart('AbyssMaw','jaw',oval((0,4.65,0),(.9,.6,.9),12,6),'iron')
        for i in range(12):a=i*math.tau/12;modelpart('MawTooth','jaw',crystal(math.cos(a)*.73,4.65,math.sin(a)*.73,.17,.85),'teeth')
    else:
        joints.update(head=[0,2.3,0],armL=[-.65,1.95,0],armR=[.65,1.95,0],legL=[-.26,.9,0],legR=[.26,.9,0])
        for name,joint,shape,mat in [('CursedBreastplate','body',boxgeo(0,1.7,0,1.15,1.25,.6),'iron'),('RaggedTabard','body',boxgeo(0,.9,.04,.85,.75,.5),'cloth'),('ClosedHelmet','head',oval((0,2.55,0),(.45,.52,.4),8,5),'iron'),('Visor','head',boxgeo(0,2.55,.38,.6,.1,.03),'bone')]:modelpart(name,joint,shape,mat)
        for side,joint in [(-1,'armL'),(1,'armR')]:
            modelpart('Pauldrons',joint,oval((side*.7,1.95,0),(.35,.3,.36),8,4),'iron');modelpart('Arm',joint,boxgeo(side*.76,1.45,0,.3,.9,.32),'iron')
        for side,joint in [(-1,'legL'),(1,'legR')]:modelpart('Greaves',joint,boxgeo(side*.28,.5,0,.36,.95,.45),'iron')
        modelpart('CursedSword','armR',boxgeo(.83,.85,.55,.16,1.8,.13),'bone');modelpart('SwordGuard','armR',boxgeo(.83,1.52,.55,.65,.12,.2),'iron');modelpart('Shield','armL',boxgeo(-.78,1.45,.3,.65,.95,.14),'iron')
    models[kind]=dict(joints=joints,pieces=pieces)
    for p in pieces:
        obj=mesh('CreaturePrototype_'+kind+'_'+p['name'],(p['vertices'],p['indices']),p['material']);obj.hide_render=True;obj.hide_viewport=True
for i,position in enumerate(guards):
    for p in models['warrior']['pieces']:
        obj=mesh('CaveSentinel_'+str(i)+'_'+p['name'],(p['vertices'],p['indices']),p['material']);obj.location=(position[0],-position[2],position[1])

data=dict(source='Blender',n=N,step=STEP,x0=X0,z0=Z0,size=SIZE,floor=FLOOR,height=HEIGHT,center=[CX,FLOOR,CZ],entry=entry,middle=middle,links=[sorted(s) for s in links],room=sorted(room),parts=parts,colliders=colliders,walls=colliders[wall_start:wall_end],materials=palette,models=models,tunnel=tunnel,guards=guards,chest=chest,warriorSpawns=[center(i) for i in [2*N+2,5*N+N-3,(N-4)*N+3,(N-2)*N+N-3]])
out=ROOT/'demo/features/cavern/data/evil-cavern.js';out.parent.mkdir(parents=True,exist_ok=True);out.write_text('window.EVIL_CAVERN_DATA='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8')
path=ROOT/'Assets/Art/Blender/Environments/EvilGodCavern.blend';bpy.ops.wm.save_as_mainfile(filepath=str(path))
print(json.dumps(dict(path=str(path),rooms=N*N,walls=len(data['walls']),connections=sum(map(len,links))//2,stairs=steps)))
