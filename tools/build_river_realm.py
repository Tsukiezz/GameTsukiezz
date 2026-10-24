"""Blender-authored braided river, thermal waterfall massif and wildlife prototypes."""
import bpy,bmesh,math,json,random,runpy
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1];rng=random.Random(241026)
COL='ThermalRiverRealm';old=bpy.data.collections.get(COL)
if old:
    for o in list(old.all_objects):bpy.data.objects.remove(o,do_unlink=True)
    bpy.data.collections.remove(old)
collection=bpy.data.collections.new(COL);bpy.context.scene.collection.children.link(collection)
raw=(ROOT/'demo/features/world/data/expanded-realm.js').read_text(encoding='utf-8');realm=json.loads(raw[raw.index('{'):raw.rfind('}')+1]);lake=realm['lake']
def smooth(t):t=max(0,min(1,t));return t*t*(3-2*t)
def base(x,z):
    n=realm['segments'];u=(x+realm['size']/2)/realm['size']*n;v=(z+realm['size']/2)/realm['size']*n;i=int(u);j=int(v);fx=u-i;fz=v-j;hs=realm['heights'];a=hs[j*(n+1)+i];b=hs[j*(n+1)+i+1];c=hs[(j+1)*(n+1)+i];d=hs[(j+1)*(n+1)+i+1]
    return a+(b-a)*fx+(c-a)*fz if fx+fz<=1 else d+(c-d)*(1-fx)+(b-d)*(1-fz)
palette={'rock':(.23,.28,.33),'chalk':(.6,.65,.65),'wood':(.31,.23,.16),'trim':(.47,.42,.30),'water':(.12,.45,.5),'foam':(.71,.89,.88),'kelp':(.15,.35,.24),'coral':(.65,.27,.39),'coralBlue':(.21,.55,.65),'monkey':(.33,.23,.17),'face':(.58,.47,.36),'rump':(.85,.10,.14),'wolf':(.48,.58,.67),'dark':(.075,.12,.19),'eye':(.22,.85,.94),'fishGold':(.72,.51,.18),'fishBlue':(.19,.48,.65),'fishPink':(.63,.27,.43)}
palette.update(bark=(.24,.13,.09),blossom=(.96,.46,.64),blossomLight=(1,.76,.83),blossomDeep=(.79,.25,.47),pineLeaf=(.09,.29,.17),leafGreen=(.17,.42,.18),leafLight=(.33,.58,.22),grassGreen=(.29,.51,.16),wildflower=(.98,.78,.89),pollen=(1,.7,.16))
materials={}
for key,rgb in palette.items():
    mat=bpy.data.materials.new('ThermalRiver_'+key);mat.use_nodes=True;mat.diffuse_color=(*rgb,1);bsdf=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bsdf.inputs['Base Color'].default_value=(*rgb,1);bsdf.inputs['Roughness'].default_value=.85
    if key in ('eye','foam'):bsdf.inputs['Emission Color'].default_value=(*rgb,1);bsdf.inputs['Emission Strength'].default_value=.35
    materials[key]=mat
def object_mesh(name,vs,ids,material):
    mesh=bpy.data.meshes.new(name);mesh.from_pydata([(x,-z,y) for x,y,z in vs],[],[ids[i:i+3] for i in range(0,len(ids),3)]);mesh.update();obj=bpy.data.objects.new(name,mesh);collection.objects.link(obj);mesh.materials.append(materials[material]);return obj
def ellipsoid(c,s,seg=10,rows=6):
    vs=[];ids=[]
    for i in range(rows+1):
        t=math.pi*i/rows
        for j in range(seg):a=math.tau*j/seg;vs.append([c[0]+math.sin(t)*math.cos(a)*s[0],c[1]+math.cos(t)*s[1],c[2]+math.sin(t)*math.sin(a)*s[2]])
    for i in range(rows):
        for j in range(seg):a=i*seg+j;b=i*seg+(j+1)%seg;ids.extend([a,b,a+seg,b,b+seg,a+seg])
    return vs,ids
def boxgeo(x,y,z,w,h,d):
    vs=[[x+sx*w/2,y+sy*h/2,z+sz*d/2] for sx,sy,sz in [(-1,-1,-1),(-1,-1,1),(-1,1,-1),(-1,1,1),(1,-1,-1),(1,-1,1),(1,1,-1),(1,1,1)]];ids=[]
    for a,b,c,e in [(2,6,4,0),(5,7,3,1),(4,5,1,0),(3,7,6,2),(1,3,2,0),(6,7,5,4)]:ids.extend([a,b,c,a,c,e])
    return vs,ids
RIVER_Y=lake['waterY']
NODES={
 'source':[-665,RIVER_Y,555],'w1':[-780,29,350],'w2':[-740,24,170],'w3':[-800,18,-40],'w4':[-735,12,-220],'w5':[-615,6,-350],'lake_w':[-505,1.2,-430],
 's1':[-600,32,620],'s2':[-410,29,740],'s3':[-190,26,760],'s4':[40,23,690],'s5':[260,21,530],'s6':[270,19,320],'e1':[390,17,170],'e2':[560,15,60],'e3':[600,13,-180],'e4':[520,11,-360],'n1':[440,9,-470],'n2':[200,7,-570],'n3':[-30,5,-600],'n4':[-170,3.5,-560],'lake_e':[-245,1.2,-475],
 'braid_w':[-660,28,360],'braid_s':[-50,23,520],'braid_e':[730,14,60],'braid_n':[50,6,-720]}
edge_defs=[('west','source','lake_w',['w1','w2','w3','w4','w5'],13),('southern_ring','source','lake_e',['s1','s2','s3','s4','s5','s6','e1','e2','e3','e4','n1','n2','n3','n4'],11),('western_braid','source','w2',['braid_w'],8),('south_braid','s2','s6',[[-410,27,600],[-260,25,540],'braid_s',[120,21,400]],8),('south_island','s3','braid_s',[[-120,24,640]],6.5),('east_braid','e1','e4',[[470,16,260],[650,15,230],'braid_e',[700,12,-180]],9),('northern_braid','n1','n4',[[300,8, -680],'braid_n',[-150,4.5,-690]],8),('delta','n3','lake_e',[[-120,3.5,-525]],6.5)]
# All lowland branches share Mercury Lake's horizontal water plane.
for p in NODES.values():p[1]=RIVER_Y
def node(v):
    p=NODES[v] if isinstance(v,str) else v
    return [p[0],RIVER_Y,p[2]]
def catmull(a,b,c,d,t):return [.5*((2*b[k])+(-a[k]+c[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t*t+(-a[k]+3*b[k]-3*c[k]+d[k])*t*t*t) for k in (0,2)]
edges=[];segments=[]
for name,start,end,mids,width in edge_defs:
    controls=[node(start)]+[node(m) for m in mids]+[node(end)];points=[]
    for j in range(len(controls)-1):
        a=controls[max(0,j-1)];b=controls[j];c=controls[j+1];d=controls[min(len(controls)-1,j+2)];steps=math.ceil(math.hypot(c[0]-b[0],c[2]-b[2])/6)
        for i in range(steps):
            t=i/steps;x,z=catmull(a,b,c,d,t);points.append([round(x,3),round(b[1]+(c[1]-b[1])*t,4),round(z,3)])
    points.append(controls[-1]);edge=dict(id=name,start=start,end=end,width=width,points=points);edges.append(edge)
    for a,b in zip(points,points[1:]):segments.append(dict(a=a,b=b,w=width,edge=name))
# A 64m spatial index avoids scanning every river segment for every terrain sample.
grid={}
for k,s in enumerate(segments):
    r=s['w']+25
    for i in range(math.floor((min(s['a'][0],s['b'][0])-r)/64),math.floor((max(s['a'][0],s['b'][0])+r)/64)+1):
        for j in range(math.floor((min(s['a'][2],s['b'][2])-r)/64),math.floor((max(s['a'][2],s['b'][2])+r)/64)+1):grid.setdefault((i,j),[]).append(k)
def nearest(x,z):
    best=None;score=1e20
    for k in grid.get((math.floor(x/64),math.floor(z/64)),[]):
        s=segments[k];a=s['a'];b=s['b'];dx=b[0]-a[0];dz=b[2]-a[2];t=max(0,min(1,((x-a[0])*dx+(z-a[2])*dz)/(dx*dx+dz*dz)));distance=math.hypot(x-a[0]-dx*t,z-a[2]-dz*t)
        if distance-s['w']<score:score=distance-s['w'];best=(distance,a[1]+(b[1]-a[1])*t,s['w'],k,t)
    return best
spring=dict(x=-765,z=660,rx=47,rz=33,waterY=236,floor=231)
# A long switchback trail follows the mountain contour instead of a raised zigzag.
def mountain_height(x,z):
    r=math.hypot(x+760,z-650);floor=base(x,z)
    return floor+(235.4-floor)*max(0,min(1,(230-r)/165))**1.08
trail=[]
polar_controls=[(236,2.47),(220,2.3),(204,3.55),(188,2.25),(172,3.58),(156,2.25),(140,3.6),(124,2.3),(108,3.5),(92,2.4),(76,3.45),(65,math.pi)]
for (ra,aa),(rb,ab) in zip(polar_controls,polar_controls[1:]):
    count=math.ceil(math.hypot((rb-ra),((ra+rb)/2)*(ab-aa))/2)
    for i in range(count):
        q=i/count;r=ra+(rb-ra)*q;a=aa+(ab-aa)*q;x=-760+math.cos(a)*r;z=650+math.sin(a)*r
        trail.append([x,mountain_height(x,z),z])
trail.append([-825,235.4,650])

# Trail queries only need the nearest segment within the 10m graded corridor.
trail_grid={}
for i,(a,b) in enumerate(zip(trail,trail[1:])):
    for gx in range(math.floor((min(a[0],b[0])-14)/32),math.floor((max(a[0],b[0])+14)/32)+1):
        for gz in range(math.floor((min(a[2],b[2])-14)/32),math.floor((max(a[2],b[2])+14)/32)+1):trail_grid.setdefault((gx,gz),[]).append(i)
def trail_near(x,z):
    best=(1e20,0)
    for index in trail_grid.get((math.floor(x/32),math.floor(z/32)),[]):
        a=trail[index];b=trail[index+1];dx=b[0]-a[0];dz=b[2]-a[2];q=max(0,min(1,((x-a[0])*dx+(z-a[2])*dz)/(dx*dx+dz*dz)));d=(x-a[0]-q*dx)**2+(z-a[2]-q*dz)**2
        if d<best[0]:best=(d,a[1]+(b[1]-a[1])*q)
    return math.sqrt(best[0]),best[1]

def massif(x,z):
    r=math.hypot(x+760,z-650);floor=base(x,z);h=mountain_height(x,z)
    # Low mossy shoulders break up the cone without a vertical mesa wall.
    h+=math.sin(x*.045)*math.cos(z*.037)*3.5*smooth((r-72)/25)*smooth((230-r)/25)
    # Raised rock spur carries the stream to the sheer waterfall lip.
    dx=100;dz=-40;t=max(0,min(1,((x+760)*dx+(z-650)*dz)/(dx*dx+dz*dz)));dist=math.hypot(x+760-dx*t,z-650-dz*t)
    if dist<34:h=max(h,floor+(235.5-floor)*(1-smooth((dist-22)/12))*smooth((z-600)/10))
    h+=math.sin(x*.13)*math.cos(z*.1)*min(3,max(0,(r-85)/12))*smooth((230-r)/20)
    pond=math.hypot((x-spring['x'])/spring['rx'],(z-spring['z'])/spring['rz'])
    if pond<1:h=231 if pond<.76 else 231+5.9*smooth((pond-.76)/.24)
    elif pond<1.3:h=236.9+(h-236.9)*smooth((pond-1)/.3)
    distance,y=trail_near(x,z)
    if distance<10 and pond>1.17:blend=smooth((10-distance)/4);h=h*(1-blend)+y*blend
    return h
def rawground(x,z):
    original=base(x,z);h=massif(x,z) if -992<=x<=-530 and 420<=z<=880 else original
    hit=nearest(x,z)
    if hit:
        d,y,w,k,t=hit
        if d<=w+20:
            if d<w*.7:h=min(h,y-6+2*(d/(w*.7))**2)
            elif d<w:h=y-4+4.7*smooth((d/w-.7)/.3)
            else:h=(y+.7)*(1-smooth((d-w)/20))+h*smooth((d-w)/20)
    # Preserve the existing 72m lake floor and its boss habitat.
    lr=math.hypot((x-lake['x'])/lake['rx'],(z-lake['z'])/lake['rz'])
    if lr<1:h=min(h,original)
    return h
# Bridges are short timber crossings; banks are graded into their approach ramps.
bridges=[]
for ei,e in enumerate(edges):
    count=7 if ei==1 else 5 if ei==0 else 2
    for j in range(count):
        index=round((j+1)/(count+1)*(len(e['points'])-2));p=e['points'][index];a=e['points'][max(0,index-1)];b=e['points'][index+1];dx=b[0]-a[0];dz=b[2]-a[2];length=math.hypot(dx,dz);nx=-dz/length;nz=dx/length;half=e['width']+2;run=16
        if math.hypot((p[0]-lake['x'])/lake['rx'],(p[2]-lake['z'])/lake['rz'])<1.15:continue
        anchors=[rawground(p[0]+side*nx*(half+run),p[2]+side*nz*(half+run)) for side in [-1,1]]
        bridges.append(dict(id='bridge-'+str(len(bridges)),x=p[0],z=p[2],nx=nx,nz=nz,half=half,run=run,width=3.2,top=p[1]+2.2,anchors=anchors,edge=e['id']))
def bridge_grade(x,z,h):
    for b in bridges:
        dx=x-b['x'];dz=z-b['z'];u=dx*b['nx']+dz*b['nz'];v=-dx*b['nz']+dz*b['nx'];d=abs(u)
        if abs(v)>4 or d<b['half']-.3 or d>b['half']+b['run']:continue
        t=(d-b['half'])/b['run'];t=max(0,min(1,t));target=b['top']+(b['anchors'][0 if u<0 else 1]-b['top'])*t;blend=smooth((4-abs(v))/1.5);h=h*(1-blend)+target*blend
    return h
X0=Z0=-992;STEP=4;N=496;cells=set()
for s in segments:
    r=s['w']+24
    for i in range(max(0,math.floor((min(s['a'][0],s['b'][0])-r-X0)/STEP)),min(N,math.ceil((max(s['a'][0],s['b'][0])+r-X0)/STEP))):
        for j in range(max(0,math.floor((min(s['a'][2],s['b'][2])-r-Z0)/STEP)),min(N,math.ceil((max(s['a'][2],s['b'][2])+r-Z0)/STEP))):
            hit=nearest(X0+(i+.5)*STEP,Z0+(j+.5)*STEP)
            if hit and hit[0]<hit[2]+24:cells.add(j*N+i)
for i in range(math.floor((-992-X0)/STEP),math.ceil((-530-X0)/STEP)):
    for j in range(math.floor((420-Z0)/STEP),math.ceil((880-Z0)/STEP)):cells.add(j*N+i)
keys=set()
for c in cells:
    i=c%N;j=c//N;keys.update([j*(N+1)+i,j*(N+1)+i+1,(j+1)*(N+1)+i,(j+1)*(N+1)+i+1])
keys=sorted(keys);heights={};vs=[];colors=[];lookup={k:i for i,k in enumerate(keys)}
for k in keys:
    i=k%(N+1);j=k//(N+1);x=X0+i*STEP;z=Z0+j*STEP;h=round(bridge_grade(x,z,rawground(x,z)),4);heights[k]=h;vs.append([x,h,z]);hit=nearest(x,z);material='rock'
    if hit and hit[0]<hit[2]*1.2:material='chalk'
    if -992<x<-530 and 420<z<880 and trail_near(x,z)[0]<5:rgb=(.4,.34,.27)
    elif math.hypot(x+760,z-650)<229:
        slope=math.hypot(rawground(x+1,z)-rawground(x-1,z),rawground(x,z+1)-rawground(x,z-1))/2
        shade=.5+.5*math.sin(x*.035)*math.cos(z*.029)
        rgb=(.18+shade*.09,.34+shade*.14,.105+shade*.065) if slope<2.3 else (.28,.34,.23)
    else:rgb=palette[material]
    colors.extend([round(v*(.94+rng.random()*.1),4) for v in rgb])
ids=[]
for c in sorted(cells):
    i=c%N;j=c//N;a=lookup[j*(N+1)+i];b=lookup[j*(N+1)+i+1];d=lookup[(j+1)*(N+1)+i];e=lookup[(j+1)*(N+1)+i+1];ids.extend([a,d,b,b,d,e])
terrain=object_mesh('ThermalRiver_SharedGround',vs,ids,'rock');attribute=terrain.data.color_attributes.new(name='RiverColors',type='FLOAT_COLOR',domain='POINT')
for i in range(len(vs)):attribute.data[i].color=(*colors[i*3:i*3+3],1)
mat=materials['rock'].copy();mat.name='ThermalRiver_TerrainColors';node=mat.node_tree.nodes.new('ShaderNodeVertexColor');node.layer_name='RiverColors';shader=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED');mat.node_tree.links.new(node.outputs['Color'],shader.inputs['Base Color']);terrain.data.materials.clear();terrain.data.materials.append(mat)
def ground(x,z):
    u=(x-X0)/STEP;v=(z-Z0)/STEP;i=math.floor(u);j=math.floor(v);fx=u-i;fz=v-j
    if j*N+i not in cells or min(i,j)<0 or max(i,j)>=N:return base(x,z)
    a=heights[j*(N+1)+i];b=heights[j*(N+1)+i+1];c=heights[(j+1)*(N+1)+i];d=heights[(j+1)*(N+1)+i+1]
    return a+(b-a)*fx+(c-a)*fz if fx+fz<=1 else d+(c-d)*(1-fx)+(b-d)*(1-fz)
trail=[[round(x,4),round(ground(x,z),4),round(z,4)] for x,y,z in trail]
parts=[]
def part(name,vs,ids,mat):parts.append(dict(name=name,vertices=vs,indices=ids,material=mat));return object_mesh(name,vs,ids,mat)
def box(name,x,y,z,w,h,d,mat='rock'):return part(name,*boxgeo(x,y,z,w,h,d),mat)
for b in bridges:
    half=b['half'];angle=math.atan2(-b['nz'],b['nx']);cos=math.cos(angle);sin=math.sin(angle)
    def beam(label,u,y,v,w,h,d,mat='wood'):
        vv,ii=boxgeo(u,y,v,w,h,d);world=[[b['x']+x*cos+z*sin,yy,b['z']-x*sin+z*cos] for x,yy,z in vv];part(b['id']+'_'+label,world,ii,mat)
    count=math.ceil(half*2/.65);plank=half*2/count
    for i in range(count):beam('plank',-half+(i+.5)*plank,b['top']-.12,0,plank-.025,.24,b['width'])
    for side in [-1,1]:
        for level in [.4,.85]:beam('rail',0,b['top']+level,side*1.7,half*2,.10,.12,'trim')
        for i in range(7):beam('post',-half+i*half/3,b['top']+.5,side*1.7,.15,1.2,.15,'trim')
        for u in [-half*.65,half*.65]:beam('pier',u,b['top']-2.5,side*1.25,.35,5,.35)
    # Timber ramps are triangulated planes matching the exact support function.
    for side in [-1,1]:
        a=side*half;e=side*(half+b['run']);ya=b['top'];ye=b['anchors'][0 if side<0 else 1];vv=[]
        for u,y,v in [(a,ya,-1.6),(a,ya,1.6),(e,ye,-1.6),(e,ye,1.6)]:vv.append([b['x']+u*cos+v*sin,y,b['z']-u*sin+v*cos])
        part(b['id']+'_ramp',vv,[0,1,2,2,1,3,0,2,1,2,3,1],'wood')
# Sheer, stratified rock face behind the two-stage waterfall.
cliff=dict(x=-660,z=618,width=68,depth=20,bottom=28,top=235.5)
for i in range(9):
    x=-692+i*8;box('Waterfall_BasaltPillar',x,131.75,618+math.sin(i*2)*2,8.5,207.5,20+math.sin(i)*4,'rock' if i%3 else 'chalk')
for i in range(44):
    x=-700+rng.random()*80;z=570+rng.random()*55;y=ground(x,z);shape=ellipsoid((x,y+1.2,z),(1+rng.random()*2,1+rng.random()*4,1+rng.random()*2),7,4);part('Waterfall_Crag',*shape,'rock')
# Spring terraces, viewing markers and a rim shrine.
for i in range(22):
    a=i*math.tau/22;x=spring['x']+math.cos(a)*spring['rx']*1.2;z=spring['z']+math.sin(a)*spring['rz']*1.2;y=ground(x,z);part('Spring_MineralRim',*ellipsoid((x,y+.35,z),(3.2,.65,2),8,4),'chalk')
for i in range(0,len(trail),14):
    x,y,z=trail[i];box('ThermalTrail_Cairn',x+3.8,y+.5,z,.5,1,.5,'chalk')
prototypes={}
def merge(name,entries):
    vv=[];ii=[]
    for vs,ids in entries:offset=len(vv);vv.extend(vs);ii.extend([i+offset for i in ids])
    prototypes[name]=dict(vertices=vv,indices=ii)
def blade():
    vv=[];ii=[]
    for j in range(3):
        angle=j*math.pi/3;off=len(vv)
        for x,y,z in [(-.16,0,0),(.16,0,0),(-.13,.8,.12),(.13,.8,.12),(-.09,1.7,-.12),(.09,1.7,-.12),(0,2.6,.2)]:vv.append([x*math.cos(angle)+z*math.sin(angle),y,-x*math.sin(angle)+z*math.cos(angle)])
        for tri in [(0,2,1),(1,2,3),(2,4,3),(3,4,5),(4,6,5)]:ii.extend([off+i for i in tri]);ii.extend([off+i for i in reversed(tri)])
    return vv,ii
merge('kelp',[blade()]);merge('coral',[ellipsoid((0,.3,0),(.5,.35,.5),7,4)]+[ellipsoid((math.cos(i*2)*.4,.55+i*.16,math.sin(i*2)*.4),(.15,.6,.15),7,4) for i in range(5)])
fish_body=ellipsoid((0,0,0),(.18,.28,.62),8,4);tail=([[0,0,-.45],[-.06,.35,-.95],[.06,.35,-.95],[-.06,-.35,-.95],[.06,-.35,-.95]],[0,1,3,0,4,2,0,3,1,0,2,4,1,2,4,1,4,3]);merge('fish',[fish_body,tail])
models={}
for kind in ['monkey','wolf']:
    pieces=[];joints={'body':[0,0,0],'head':[0,1, .6],'jaw':[0,.85,.9],'tail':[0, .65,-.65],'legFL':[-.3,.6,.5],'legFR':[.3,.6,.5],'legBL':[-.3,.6,-.5],'legBR':[.3,.6,-.5]}
    def bodypart(label,joint,c,s,mat):vv,ii=ellipsoid(c,s,10,6);pieces.append(dict(name=label,joint=joint,material=mat,vertices=vv,indices=ii))
    if kind=='monkey':
        bodypart('body','body',(0,.66,0),(.34,.48,.52),'monkey');bodypart('head','head',(0,1.08,.52),(.34,.35,.33),'monkey');bodypart('muzzle','head',(0,.99,.79),(.23,.18,.25),'face')
        for side in [-1,1]:bodypart('ear','head',(side*.34,1.15,.44),(.12,.15,.08),'face');bodypart('eye','head',(side*.17,1.17,.76),(.035,.045,.035),'dark');bodypart('red_rump','body',(side*.14,.69,-.5),(.16,.2,.08),'rump')
        for i in range(7):bodypart('tail','tail',(math.sin(i*.3)*.15,.8+i*.12,-.5-i*.18),(.06,.07,.16),'monkey')
    else:
        bodypart('body','body',(0,.95,0),(.5,.6,1.05),'wolf');bodypart('shoulders','body',(0,1.18,.55),(.58,.67,.55),'wolf');bodypart('head','head',(0,1.48,1.0),(.4,.43,.57),'wolf');bodypart('snout','head',(0,1.24,1.42),(.27,.23,.45),'wolf');bodypart('nose','head',(0,1.25,1.79),(.2,.15,.11),'dark');bodypart('jaw','jaw',(0,1.04,1.48),(.24,.12,.38),'dark')
        for side in [-1,1]:bodypart('ear','head',(side*.25,1.94,.81),(.16,.33,.16),'dark');bodypart('eye','head',(side*.33,1.53,1.32),(.07,.08,.05),'eye')
        for i in range(6):bodypart('tail','tail',(0,1.07+i*.07,-.8-i*.25),(.24-i*.025,.25-i*.025,.25),'wolf')
        for i in range(4):bodypart('speed_mark','body',(.48,1.3-i*.15,.3-i*.2),(.04,.12,.25),'eye')
    for key,p in joints.items():
        if key.startswith('leg'):bodypart(key,key,(p[0],.4,p[2]),(.1 if kind=='monkey' else .14,.4,.13),'monkey' if kind=='monkey' else 'dark')
    models[kind]=dict(joints=joints,pieces=pieces)
    for p in pieces:obj=object_mesh('RiverWildlife_'+kind+'_'+p['name'],p['vertices'],p['indices'],p['material']);obj.location=(-760,-660,242 if kind=='monkey' else 246)
decor=[];fish=[];monkeys=[]
for i in range(720):
    s=rng.choice(segments);t=rng.random();a=s['a'];b=s['b'];dx=b[0]-a[0];dz=b[2]-a[2];length=math.hypot(dx,dz);offset=(rng.random()-.5)*s['w']*1.1;x=a[0]+dx*t-dz/length*offset;z=a[2]+dz*t+dx/length*offset;y=ground(x,z)
    decor.append(dict(kind='kelp',x=x,y=y,z=z,scale=.6+rng.random()*.8))
    if i%2==0:fish.append(dict(x=x,y=min(a[1],b[1])-1.5-rng.random()*2,z=z,kind=i%3,phase=rng.random()*math.tau))
for i in range(100):
    a=rng.random()*math.tau;r=math.sqrt(rng.random())*.76;x=spring['x']+math.cos(a)*spring['rx']*r;z=spring['z']+math.sin(a)*spring['rz']*r;y=ground(x,z)
    decor.append(dict(kind='coral' if i%3 else 'kelp',x=x,y=y,z=z,scale=.45+rng.random()*.55))
    if i<60:fish.append(dict(x=x,y=232+rng.random()*2.7,z=z,kind=i%3,phase=rng.random()*math.tau))
for i in range(18):
    a=i*math.tau/18;x=spring['x']+math.cos(a)*64;z=spring['z']+math.sin(a)*49;y=ground(x,z);monkeys.append(dict(x=x,y=y,z=z,phase=rng.random()*6))
for k,proto in prototypes.items():
    # A linked Blender prototype per plant kind, as editable as every bridge.
    if k=='fish':continue
    src=object_mesh('ThermalPrototype_'+k,proto['vertices'],proto['indices'],'kelp' if k=='kelp' else 'coral');src.hide_render=True;src.hide_viewport=True
    for i,p in enumerate([p for p in decor if p['kind']==k]):obj=bpy.data.objects.new('Aquatic_'+k+'_'+str(i),src.data);collection.objects.link(obj);obj.location=(p['x'],-p['z'],p['y']);obj.scale=(p['scale'],)*3
proto=prototypes['fish'];fish_sources={}
for kind,material in enumerate(['fishGold','fishBlue','fishPink']):
    src=object_mesh('ThermalFishPrototype_'+str(kind),proto['vertices'],proto['indices'],material);src.hide_render=True;src.hide_viewport=True;fish_sources[kind]=src
for i,p in enumerate(fish):
    obj=bpy.data.objects.new('RiverFish_'+str(i),fish_sources[p['kind']].data);collection.objects.link(obj);obj.location=(p['x'],-p['z'],p['y']);obj.rotation_euler.z=p['phase']
water=[]
def water_strip(name,points,width,kind):
    vv=[];ii=[];uv=[];distance=0
    for i,p in enumerate(points):
        a=points[max(0,i-1)];b=points[min(len(points)-1,i+1)];dx=b[0]-a[0];dz=b[2]-a[2];length=math.hypot(dx,dz) or 1
        if i:distance+=Vector(p).__sub__(Vector(points[i-1])).length
        for side in [-1,1]:vv.append([p[0]-dz/length*width*side,p[1]+(0 if kind=='river' else .025),p[2]+dx/length*width*side]);uv.extend([(side+1)/2,distance/12])
        if i:a=(i-1)*2;ii.extend([a,a+2,a+1,a+1,a+2,a+3])
    object_mesh(name,vv,ii,'water' if kind!='fall' else 'foam');water.append(dict(name=name,kind=kind,vertices=vv,indices=ii,uvs=uv))
for e in edges:water_strip('ThermalWater_'+e['id'],e['points'],e['width']*.94,'river')
water_strip('Spring_Headwater',[[-730,236,650],[-690,236,635],[-660,236,610],[-660,236,607]],6,'spring')
fall_points=[]
for a,b in zip([[-660,236,607],[-653,132,590]],[[-653,132,590],[-665,RIVER_Y,555]]):
    for i in range(16):t=i/16;fall_points.append([a[k]+(b[k]-a[k])*t for k in range(3)])
fall_points.append([-665,RIVER_Y,555]);water_strip('Titanic_ThermalWaterfall',fall_points,23,'fall')
box('Waterfall_CascadeLedge',-653,127,600,59,6,24,'rock')
vv=[[spring['x'],spring['waterY'],spring['z']]];uv=[.5,.5];ii=[]
for i in range(65):a=i*math.tau/64;vv.append([spring['x']+math.cos(a)*spring['rx']*.97,spring['waterY'],spring['z']+math.sin(a)*spring['rz']*.97]);uv.extend([.5+math.cos(a)*.5,.5+math.sin(a)*.5])
for i in range(64):ii.extend([0,i+2,i+1])
object_mesh('Summit_HotSpring',vv,ii,'water');water.append(dict(name='Summit_HotSpring',kind='spring',vertices=vv,indices=ii,uvs=uv))
data=dict(source='Blender',nodes=NODES,edges=edges,segments=segments,bridges=bridges,spring=spring,cliff=cliff,trail=trail,terrain=dict(x0=X0,z0=Z0,n=N,step=STEP,keys=keys,heights=[heights[k] for k in keys],cells=sorted(cells),indices=ids,colors=colors),parts=parts,materials=palette,prototypes=prototypes,models=models,decor=decor,fish=fish,monkeys=monkeys,wolfSpawn=[-708,ground(-708,640),640],waterfall=[[ -660,236,607],[-653,132,590],[-665,RIVER_Y,555]])
ecology_builder=runpy.run_path(str(ROOT/'tools/river_mountain_ecology.py'))['build_mountain_ecology']
data['vegetation']=ecology_builder(ground,trail_near,spring,ellipsoid,object_mesh,materials,collection)
patrol=trail[::5]+[trail[-1]]
for i in range(25):
    a=math.pi+i*math.tau/24;x=spring['x']+math.cos(a)*62;z=spring['z']+math.sin(a)*48
    patrol.append([x,ground(x,z),z])
patrol.extend(list(reversed(trail[::5])))
data['wolfPatrol']=patrol
data['wolfSpawn']=patrol[len(trail[::5])//3]
data['water']=water
# Terrain indices have their own buffer; geometry helpers also use ids above.
data['terrain']['indices']=[]
for c in sorted(cells):
    i=c%N;j=c//N;a=lookup[j*(N+1)+i];b=lookup[j*(N+1)+i+1];d=lookup[(j+1)*(N+1)+i];e=lookup[(j+1)*(N+1)+i+1];data['terrain']['indices'].extend([a,d,b,b,d,e])
out=ROOT/'demo/features/river/data';out.mkdir(parents=True,exist_ok=True);(out/'thermal-river.js').write_text('window.THERMAL_RIVER_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
path=ROOT/'Assets/Art/Blender/Environments/ThermalRiverRealm.blend';path.parent.mkdir(parents=True,exist_ok=True);bpy.ops.wm.save_as_mainfile(filepath=str(path))
print(json.dumps(dict(file=str(path),edges=len(edges),bridges=len(bridges),terrainVertices=len(keys),terrainCells=len(cells),fish=len(fish),plants=len(decor),monkeys=len(monkeys))))
