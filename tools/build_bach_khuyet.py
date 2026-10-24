"""Editable Blender mountain and articulated space sabertooth; shared web geometry."""
import bpy, math, json, random
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'demo/features/mountain/data';OUT.mkdir(parents=True,exist_ok=True)
name='BachKhuyet';old=bpy.data.collections.get(name)
if old:
    for o in list(old.all_objects):bpy.data.objects.remove(o,do_unlink=True)
    bpy.data.collections.remove(old)
collection=bpy.data.collections.new(name);bpy.context.scene.collection.children.link(collection)
rng=random.Random(240106)
palette={'rock':(.28,.32,.38),'snow':(.72,.83,.88),'trail':(.39,.32,.24),'grass':(.22,.39,.30),'crystal':(.28,.78,.91),'gold':(.8,.59,.19),'fur':(.27,.22,.43),'stripe':(.035,.045,.09),'ivory':(.83,.85,.75),'eye':(.25,.95,.9),'mouth':(.12,.025,.07)}
mats={}
for k,rgb in palette.items():
    m=bpy.data.materials.new('BachKhuyet_'+k);m.use_nodes=True;m.diffuse_color=(*rgb,1)
    shader=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');shader.inputs['Base Color'].default_value=(*rgb,1);shader.inputs['Roughness'].default_value=.83
    if k in ('eye','crystal'):shader.inputs['Emission Color'].default_value=(*rgb,1);shader.inputs['Emission Strength'].default_value=.55
    mats[k]=m
def mesh(name,vs,ids,material):
    data=bpy.data.meshes.new(name);data.from_pydata([(x,-z,y) for x,y,z in vs],[],[ids[i:i+3] for i in range(0,len(ids),3)]);data.update()
    obj=bpy.data.objects.new(name,data);collection.objects.link(obj);data.materials.append(mats[material]);return obj
# The old terrain is sampled at the perimeter, eliminating floating edges.
raw=(ROOT/'demo/features/world/data/expanded-realm.js').read_text(encoding='utf-8');realm=json.loads(raw[raw.index('{'):raw.rfind('}')+1])
def base(x,z):
    n=realm['segments'];u=(x+realm['size']/2)/realm['size']*n;v=(z+realm['size']/2)/realm['size']*n;i=int(u);j=int(v);fx=u-i;fz=v-j;hs=realm['heights'];a=hs[j*(n+1)+i];b=hs[j*(n+1)+i+1];c=hs[(j+1)*(n+1)+i];d=hs[(j+1)*(n+1)+i+1]
    return a+(b-a)*fx+(c-a)*fz if fx+fz<=1 else d+(c-d)*(1-fx)+(b-d)*(1-fz)
CX,CZ=610,610;N=200;STEP=3;X0=310;Z0=310
trail=[]
entry=base(CX,CZ+269)
for i in range(641):
    t=i/640;r=269*(1-t);angle=math.pi/2+t*math.tau*2.35
    trail.append([CX+r*math.cos(angle),entry+(202-entry)*t,CZ+r*math.sin(angle)])
def nearest(x,z):
    best=(1e20,0)
    for i,(a,b) in enumerate(zip(trail,trail[1:])):
        dx=b[0]-a[0];dz=b[2]-a[2];t=max(0,min(1,((x-a[0])*dx+(z-a[2])*dz)/(dx*dx+dz*dz)));d=(x-a[0]-t*dx)**2+(z-a[2]-t*dz)**2
        if d<best[0]:best=(d,a[1]+(b[1]-a[1])*t)
    return math.sqrt(best[0]),best[1]
heights=[];vertices=[];colors=[];indices=[]
for j in range(N+1):
    for i in range(N+1):
        x=X0+i*STEP;z=Z0+j*STEP;r=math.hypot(x-CX,z-CZ);floor=base(x,z);edge=max(0,min(1,(300-r)/35));mount=max(0,1-r/275)**1.1*(202-base(CX,CZ))
        # Rugged subordinate ridges; the summit remains the dominant peak.
        for ox,oz,h in [(-175,-115,82),(175,-90,102),(-175,110,66),(140,165,72),(40,-208,86)]:mount=max(mount,max(0,1-math.hypot(x-CX-ox,z-CZ-oz)/98)*h)
        y=floor+edge*(mount+(math.sin(x*.13)*math.cos(z*.11)*3.8+math.sin(x*.32+z*.2)*1.1)*min(1,mount/20))
        distance,pathY=nearest(x,z)
        if distance<13:
            blend=max(0,min(1,(13-distance)/6));blend=blend*blend*(3-2*blend);y=y*(1-blend)+pathY*blend
        heights.append(round(y,4));vertices.append([x,y,z]);key='trail' if distance<6.5 else 'snow' if y>155 else 'rock';rgb=palette[key];shade=.90+rng.random()*.18;colors.extend([round(c*shade,4) for c in rgb])
for j in range(N):
    for i in range(N):a=j*(N+1)+i;indices.extend([a,a+N+1,a+1,a+1,a+N+1,a+N+2])
terrain=mesh('BachKhuyet_Massif_202m',vertices,indices,'rock')
attr=terrain.data.color_attributes.new(name='MountainColors',type='FLOAT_COLOR',domain='POINT')
for i in range(len(vertices)):attr.data[i].color=(*colors[i*3:i*3+3],1)
mat=bpy.data.materials.new('BachKhuyet_TerrainVertexColors');mat.use_nodes=True
node=mat.node_tree.nodes.new('ShaderNodeVertexColor');node.layer_name='MountainColors'
shader=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED');mat.node_tree.links.new(node.outputs['Color'],shader.inputs['Base Color']);shader.inputs['Roughness'].default_value=.95
terrain.data.materials.clear();terrain.data.materials.append(mat)
# Render and physics interpolate identical triangles, including the trail.
def ground(x,z):
    u=(x-X0)/STEP;v=(z-Z0)/STEP;i=max(0,min(N-1,int(u)));j=max(0,min(N-1,int(v)));fx=u-i;fz=v-j;a=heights[j*(N+1)+i];b=heights[j*(N+1)+i+1];c=heights[(j+1)*(N+1)+i];d=heights[(j+1)*(N+1)+i+1]
    return a+(b-a)*fx+(c-a)*fz if fx+fz<=1 else d+(c-d)*(1-fx)+(b-d)*(1-fz)
def ellipsoid(c,s,segments=10,rows=6):
    vs=[];ids=[]
    for i in range(rows+1):
        t=math.pi*i/rows
        for j in range(segments):a=math.tau*j/segments;vs.append([c[0]+math.sin(t)*math.cos(a)*s[0],c[1]+math.cos(t)*s[1],c[2]+math.sin(t)*math.sin(a)*s[2]])
    for i in range(rows):
        for j in range(segments):a=i*segments+j;b=i*segments+(j+1)%segments;ids.extend([a,a+segments,b,b,a+segments,b+segments])
    return vs,[v for k in range(0,len(ids),3) for v in (ids[k],ids[k+2],ids[k+1])]
def cone(c,r,h):
    vs=[[c[0]+math.cos(i*math.tau/6)*r,c[1],c[2]+math.sin(i*math.tau/6)*r] for i in range(6)]+[[c[0],c[1]+h,c[2]]];ids=[]
    for i in range(6):ids.extend([i,(i+1)%6,6])
    ids.extend([0,2,1,0,3,2,0,4,3,0,5,4]);return vs,([v for k in range(0,len(ids),3) for v in (ids[k],ids[k+2],ids[k+1])] if h>0 else ids)
prototypes={}
for k,shape in [('rock',ellipsoid((0,.45,0),(1.1,.8,.9),7,4)),('grass',cone((0,0,0),.28,1.4)),('crystal',cone((0,0,0),.55,3.3)),('gold',cone((0,0,0),.7,1.6))]:prototypes[k]={'vertices':shape[0],'indices':shape[1]}
gv=[];gi=[]
for blade in range(5):
    a=blade*math.tau/5;offset=len(gv)
    for x,y,z in [(-.16,0,0),(.16,0,0),(-.1,.7,.13),(.1,.7,.13),(0,1.3,.42)]:gv.append([x*math.cos(a)+z*math.sin(a),y,-x*math.sin(a)+z*math.cos(a)])
    for tri in [(0,2,1),(1,2,3),(2,4,3)]:gi.extend([offset+i for i in tri]);gi.extend([offset+i for i in reversed(tri)])
prototypes['grass']={'vertices':gv,'indices':gi}
placements=[];ores=[]
for i in range(850):
    x=rng.uniform(330,890);z=rng.uniform(330,890);d,_=nearest(x,z);y=ground(x,z)
    if math.hypot(x-CX,z-CZ)>275 or d<10 or y<base(x,z)+2:continue
    k='rock' if i%3==0 or y>155 else 'grass';s=rng.uniform(.8,3.2) if k=='rock' else rng.uniform(.5,1.5);placements.append(dict(kind=k,x=x,y=y,z=z,scale=s,yaw=rng.random()*math.tau))
for i,index in enumerate(range(70,605,48)):
    p=trail[index];b=trail[index+1];dx=b[0]-p[0];dz=b[2]-p[2];length=math.hypot(dx,dz);x=p[0]-dz/length*9;z=p[2]+dx/length*9;y=ground(x,z);k='gold' if i%3==0 else 'crystal';placements.append(dict(kind=k,x=x,y=y,z=z,scale=1,yaw=i));ores.append(dict(id='ore-'+str(i),kind=k,x=x,y=y,z=z))
for i,p in enumerate(placements):
    proto=prototypes[p['kind']];o=mesh('BK_'+p['kind']+'_'+str(i),proto['vertices'],proto['indices'],p['kind']) if not any(q.name=='BK_'+p['kind']+'_prototype' for q in collection.objects) else None
    if o:o.name='BK_'+p['kind']+'_prototype'
    else:
        src=collection.objects.get('BK_'+p['kind']+'_prototype');o=bpy.data.objects.new('BK_'+p['kind']+'_'+str(i),src.data);collection.objects.link(o)
    o.location=(p['x'],-p['z'],p['y']);o.scale=(p['scale'],)*3;o.rotation_euler.z=-p['yaw']
# Tiger: head, jaw, four gait joints, long tail, deep stripes and two sabers.
parts=[];joints={'body':[0,1.65,0],'head':[0,2.1,1.6],'jaw':[0,1.9,2.0],'tail':[0,1.6,-1.7], 'legFL':[-.65,1.4,1.1],'legFR':[.65,1.4,1.1],'legBL':[-.65,1.4,-1.1],'legBR':[.65,1.4,-1.1]}
def tigerpart(label,joint,c,s,mat='fur',shape=None):
    vs,ids=shape or ellipsoid(c,s);parts.append(dict(name=label,joint=joint,material=mat,vertices=vs,indices=ids));o=mesh('SpaceSabertooth_'+label,vs,ids,mat);o.location=(CX,-CZ,215)
tigerpart('muscular_torso','body',(0,1.7,0),(.86,.85,1.95));tigerpart('shoulders','body',(0,2,1), (1,1.05,1));tigerpart('skull','head',(0,2.35,1.9),(.87,.85,.93));tigerpart('muzzle','head',(0,2.02,2.65),(.68,.43,.5),'ivory');tigerpart('open_mouth','head',(0,1.85,2.65),(.55,.15,.44),'mouth');tigerpart('lower_jaw','jaw',(0,1.61,2.5),(.58,.23,.65))
for side in [-1,1]:
    tigerpart('ear'+str(side),'head',(side*.65,3.04,1.7),(.28,.4,.23),'stripe');tigerpart('eye'+str(side),'head',(side*.71,2.55,2.45),(.18,.15,.13),'eye')
    tigerpart('saber'+str(side),'head',None,None,'ivory',cone((side*.46,1.95,2.83),.18,-1.23))
    for k,z in enumerate([-1.3,-.6,.1,.8,1.3]):
        vs=[];ids=[];f=math.sqrt(1-(z/1.98)**2)
        for row in range(10):
            a=-1.1+row/9*2.65
            for dz in [-.095,.095]:vs.append([side*.89*f*math.cos(a),1.7+.88*f*math.sin(a),z+dz])
        for row in range(9):
            a=row*2
            for tri in [(a,a+1,a+2),(a+1,a+3,a+2)]:ids.extend(tri);ids.extend(reversed(tri))
        tigerpart('stripe'+str(side)+str(k),'body',None,None,'stripe',(vs,ids))
for j,p in joints.items():
    if j.startswith('leg'):tigerpart(j,j,(p[0],.85,p[2]),(.32,.83,.36));tigerpart(j+'paw',j,(p[0],.18,p[2]+.13),(.4,.22,.55),'stripe')
for i in range(6):tigerpart('tail'+str(i),'tail',(math.sin(i*.5)*.4,1.8+i*.14,-1.8-i*.47),(.22-i*.025,.22-i*.025,.4),'fur' if i%2==0 else 'stripe')
root=bpy.data.objects.new('SpaceSabertooth_Character',None);collection.objects.link(root);root.location=(CX,-CZ,215)
bpy.context.view_layer.update()
for key,pivot in joints.items():
    joint=bpy.data.objects.new('SpaceSabertooth_Joint_'+key,None);collection.objects.link(joint);joint.parent=root;joint.location=(pivot[0],-pivot[2],pivot[1]);joint.empty_display_size=.35
    bpy.context.view_layer.update()
    for part in parts:
        if part['joint']!=key:continue
        obj=bpy.data.objects['SpaceSabertooth_'+part['name']];world=obj.matrix_world.copy();obj.parent=joint;obj.matrix_world=world
data=dict(source='Blender',name='Núi Bạch Khuyết',terrain=dict(x0=X0,z0=Z0,n=N,step=STEP,heights=heights,colors=colors),trail=[[round(x,4),round(ground(x,z),4),round(z,4)] for x,_,z in trail],prototypes=prototypes,placements=placements,ores=ores,materials=palette,tiger=dict(joints=joints,pieces=parts))
(OUT/'bach-khuyet.js').write_text('window.BACH_KHUYET_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
path=ROOT/'Assets/Art/Blender/Environments/BachKhuyet.blend';path.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(path))
print(json.dumps({'file':str(path),'vertices':len(vertices),'trailPoints':len(trail),'decorations':len(placements),'ores':len(ores),'tigerParts':len(parts)}))
