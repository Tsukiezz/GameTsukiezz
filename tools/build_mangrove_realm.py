"""Author a giant tidal mangrove, sunken sanctuary and articulated crocodile.
Run in Blender. Game coordinates are Y-up; Blender meshes are saved Z-up.
Only the MangroveRealm scene/collection is managed by this builder.
"""
import bpy, json, math, random
from mathutils import Vector, Matrix
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
rng = random.Random(241026)
scene = bpy.data.scenes.get('MangroveRealm') or bpy.data.scenes.new('MangroveRealm')
bpy.context.window.scene = scene
old = bpy.data.collections.get('MangroveRealmAssets')
if old:
    for o in list(old.all_objects): bpy.data.objects.remove(o, do_unlink=True)
    bpy.data.collections.remove(old)
collection = bpy.data.collections.new('MangroveRealmAssets'); scene.collection.children.link(collection)
palette = {'bark':(.19,.115,.065), 'root':(.26,.18,.095), 'leaf':(.12,.28,.13), 'leafLight':(.24,.39,.16),
 'stone':(.22,.29,.25), 'moss':(.28,.39,.18), 'gold':(.65,.43,.14), 'wood':(.34,.23,.12),
 'skin':(.19,.25,.095), 'belly':(.40,.36,.18), 'scute':(.10,.16,.065), 'mouth':(.17,.035,.025),
 'tooth':(.84,.79,.58), 'eye':(1,.50,.025), 'pupil':(.012,.017,.008), 'relic':(.28,.95,.79), 'water':(.26,.29,.12),'mud':(.20,.19,.11),'fish':(.65,.43,.15),'fin':(.29,.5,.48),'lotus':(.22,.48,.15),'pink':(.95,.43,.62)}
materials = {}
for key,rgb in palette.items():
    m=bpy.data.materials.get('Mangrove_'+key) or bpy.data.materials.new('Mangrove_'+key);m.use_nodes=True;m.diffuse_color=(*rgb,1)
    n=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');n.inputs['Base Color'].default_value=(*rgb,1);n.inputs['Roughness'].default_value=.84
    if key in ['eye','relic']:n.inputs['Emission Color'].default_value=(*rgb,1);n.inputs['Emission Strength'].default_value=1.1
    materials[key]=m
buffers={};kind='tree';joint='body'
def part(mat,vertices,faces):
    b=buffers.setdefault((kind,joint,mat),{'vertices':[],'indices':[]});off=len(b['vertices']);b['vertices']+=vertices
    for f in faces:
        for i in range(1,len(f)-1):b['indices'] += [off+f[0],off+f[i],off+f[i+1]]
def tube(points,radii,mat='bark',sides=8):
    vs=[]
    for i,p in enumerate(points):
        tangent=Vector(points[min(i+1,len(points)-1)])-Vector(points[max(0,i-1)]);tangent.normalize();a=tangent.cross(Vector((0,1,0)))
        if a.length<.01:a=tangent.cross(Vector((1,0,0)))
        a.normalize();b=tangent.cross(a).normalized()
        for j in range(sides):vs.append(list(Vector(p)+radii[i]*(math.cos(j*math.tau/sides)*a+math.sin(j*math.tau/sides)*b)))
    fs=[]
    for i in range(len(points)-1):
        for j in range(sides):a=i*sides+j;b=i*sides+(j+1)%sides;fs.append([a,b,b+sides,a+sides])
    fs += [list(reversed(range(sides))),list(range((len(points)-1)*sides,len(points)*sides))];part(mat,vs,fs)
def orb(p,s,mat,seg=12,rows=7):
    vs=[[p[0]+s[0]*math.sin(math.pi*i/rows)*math.cos(math.tau*j/seg),p[1]+s[1]*math.cos(math.pi*i/rows),p[2]+s[2]*math.sin(math.pi*i/rows)*math.sin(math.tau*j/seg)] for i in range(rows+1) for j in range(seg)]
    part(mat,vs,[[i*seg+j,i*seg+(j+1)%seg,(i+1)*seg+(j+1)%seg,(i+1)*seg+j] for i in range(rows) for j in range(seg)])
def box(p,s,mat):
    vs=[[p[0]+x*s[0]/2,p[1]+y*s[1]/2,p[2]+z*s[2]/2] for x,y,z in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
    part(mat,vs,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(3,7,6,2),(1,2,6,5),(0,4,7,3)])
def spike(a,b,r,mat='tooth'):tube([a,b],[r,.018],mat,7)
# One reusable tree: curved bole, wide prop roots, forked crown and layered leaves.
tube([(0,0,0),(.8,13,0),(-1.5,30,1),(1,48,0),(0,62,-1)],[3.6,3,2.4,1.8,.8])
root_paths=[]
for i in range(11):
    a=i*math.tau/11;dx,dz=math.cos(a),math.sin(a);r=13+(i%3)*2
    path=[[dx*1.7,16+i%4,dz*1.7],[dx*6,10,dz*6],[dx*10,-12,dz*10],[dx*r,-38,dz*r]]
    tube(path,[1.15,.95,.65,.3],'root');root_paths.append(path)
    tube([path[1],[dx*10+dz*3,3,dz*10-dx*3],[dx*(r+2)+dz*3,-1.5,dz*(r+2)-dx*3]],[.65,.4,.18],'root',6)
for i in range(8):
    a=i*math.tau/8;dx,dz=math.cos(a),math.sin(a);y=43+(i%3)*6
    tube([(0,y-8,0),(dx*10,y+3,dz*10),(dx*20,y+8,dz*20)],[1.4,.9,.3])
    for k in range(3):orb((dx*(12+k*5),y+9+(k%2)*3,dz*(12+k*5)),(10-k,4.5,9-k),'leafLight' if (i+k)%3==0 else 'leaf',10,5)
# Crocodile, about 34 m long. Separate jaw, tail and four legs animate in game.
kind='crocodile';joint='body'
orb((0,2,0),(3.3,2.1,6.8),'skin',18,10);orb((0,.9,.3),(2.8,1.2,6.2),'belly')
for z in range(-5,7,2):
    for x in [-2.1,-1.05,0,1.05,2.1]:
        orb((x,3.65,z),(.65,.6,1.05),'scute',8,4)
        if abs(x)<1.1:spike((x,4,z),(x,5.0,z-.6),.48,'scute')
joint='head';orb((0,2.5,7),(2.7,1.6,3.5),'skin');orb((0,2.1,10.7),(2.1,.85,3.7),'skin');orb((0,1.45,10.4),(1.95,.25,3.5),'mouth')
for side in [-1,1]:
    orb((side*2.15,3.6,7),(0.65,.7,1.2),'scute');orb((side*2.43,3.65,7.45),(.33,.35,.48),'eye');orb((side*2.67,3.65,7.5),(.06,.27,.16),'pupil')
    orb((side*.9,2.85,13),(.28,.17,.38),'pupil')
    for i in range(14):
        z=7+i*.48;x=side*(2.0-max(0,z-10)*.12);spike((x,1.7,z),(x,1.0-(i%3)*.15,z+.06),.18)
    tube([(side*2.2,3.5,6.5),(side*2.8,4,7.1),(side*2.2,3.95,8.5)],[.5,.4,.15],'scute')
joint='jaw';orb((0,.8,10.5),(2,.55,3.8),'skin');orb((0,1.25,10.5),(1.7,.12,3.4),'mouth')
for side in [-1,1]:
    for i in range(13):
        z=7.2+i*.48;x=side*(1.85-max(0,z-10)*.12);spike((x,1.25,z),(x,1.95+(i%2)*.18,z),.15)
joint='tail';tube([(0,2,-5),(0,1.8,-10),(1,1.3,-15),(3,1,-20)],[2.5,1.8,.9,.06],'skin',12)
for i in range(9):
    z=-6-i*1.4;x=max(0,(-z-10)*.22)
    for side in [-1,1]:spike((x+side*.65,3-i*.17,z),(x+side*.65,4.5-i*.22,z-.55),max(.12,.5-i*.04),'scute')
for side in [-1,1]:
    for front,z in [('front',4),('rear',-4)]:
        joint=front+str(side);tube([(side*2.4,1.7,z),(side*4.7,.7,z-1),(side*4.5,.1,z+1)],[1,.7,.45],'skin');orb((side*4.5,.15,z+1),(1,.3,1.3),'skin')
        for i in range(4):spike((side*4.5+(i-1.5)*.4,.2,z+1.6),(side*4.5+(i-1.5)*.45,.05,z+2.5),.13)
# Sanctuary, drowned pillars, entrance arch and a walkable pier through the forest.
kind='architecture';joint='body';cx,cz=70,-825
decks=[];pillars=[]
def deck(x,z,w,d,y=2.8):
    box((x,y-.23,z),(w,.46,d),'wood');decks.append(dict(x=x,z=z,w=w,d=d,y=y))
    for side in [-1,1]:
        for zz in [z-d/2+1,z+d/2-1]:tube([(x+side*(w/2-.3),-10,zz),(x+side*(w/2-.3),y+.8,zz)],[.28,.22],'wood',6)
for z in []:  # No bridge across the basin: swim now, boats in a future update.
    deck(70,z,5.8,4.05)
    # Separate planks make the surface read as a wooden walkway up close.
    for dz in [-1.5,-.5,.5,1.5]:box((70,2.82,z+dz),(5.7,.12,.83),'root')
deck(70,-886,29,28)
part('stone',[[67,.65,-860],[73,.65,-860],[67,2.8,-872],[73,2.8,-872]],[(0,1,2),(1,3,2)])
for i in range(12):
    if i==3:continue  # The northern doorway must remain clear of the pier.
    a=i*math.tau/12;x=70+math.cos(a)*21;z=-886+math.sin(a)*21;h=15+(i%4)*4
    tube([(x,-9,z),(x,h,z)],[1.8,1.4],'stone',10);box((x,3.2,z),(4,1.5,4),'moss');box((x,h,z),(4.2,1.1,4.2),'gold');pillars.append(dict(x=x,z=z,r=1.8,minY=-9,maxY=h+.55))
    for y in [6,10,14]:
        # Carved triangular tidal glyphs and mineral tide lines.
        tube([(x-.7,y,z-1.5),(x,y+1,z-1.7),(x+.7,y,z-1.5),(x-.7,y,z-1.5)],[.1]*4,'gold',5)
    if i%2==0:
        tube([(x-4,-7,z+3),(x-2,3,z+2),(x+1,7,z),(x-1,12,z-1.5)],[.7,.65,.48,.18],'root')
    if i%3!=0:
        b=(i+1)*math.tau/12;tube([(x,h-.7,z),(70+math.cos(a+.26)*21,h+2,-886+math.sin(a+.26)*21),(70+math.cos(b)*21,15+((i+1)%4)*4-.7,-886+math.sin(b)*21)],[1.1,1.1,1.1],'stone')
for side in [-1,1]:
    x=70+side*13;tube([(x,-8,-735),(x,31,-735)],[2.3,1.5],'stone');box((x,15,-735),(4.8,1,4.8),'gold');pillars.append(dict(x=x,z=-735,r=2.3,minY=-8,maxY=31))
tube([(57,28,-735),(63,38,-735),(70,42,-735),(77,38,-735),(83,28,-735)],[1.8]*5,'stone',10)
for i in range(5):box((70,3+i*.22,-886),(6-i*.7,.3,6-i*.7),'stone')
for i in range(20):
    a=i*2.39996;r=29+i%5*3;box((70+math.cos(a)*r,-.3+i%3*.4,-886+math.sin(a)*r),(2.5+i%4,2.2,2.8),'moss' if i%3==0 else 'stone')
kind='relic';joint='body'
part('relic',[[-.8,0,0],[.6,.2,-.2],[.9,1.4,.1],[.1,2.2,0],[-.55,1.25,.3],[0,.9,-.45]],[(0,1,5),(1,2,5),(2,3,5),(3,4,5),(4,0,5),(0,4,3),(0,3,2),(0,2,1)])
for i in range(3):box((0,.5+i*.35,.18),(.6,.065,.08),'gold')
# Blender aquatic prototypes, used by the instanced living ecosystem.
kind='fish';joint='body';orb((0,0,0),(.25,.38,.8),'fish',10,6)
part('fin',[[0,0,-.6],[0,.6,-1.2],[0,-.6,-1.2],[0,.3,.2],[0,.85,-.2],[0,0,-.4]],[(0,1,2),(3,4,5)])
for side in [-1,1]:orb((side*.2,.12,.45),(.08,.09,.09),'pupil',6,4)
kind='turtle';orb((0,.35,0),(1,.45,1.3),'scute');orb((0,.2,1.4),(.35,.3,.5),'skin')
for side in [-1,1]:
    for z in [-.8,.8]:orb((side*.95,0,z),(.65,.12,.35),'skin',8,4)
kind='crab';orb((0,.22,0),(.6,.25,.45),'root',10,5)
for side in [-1,1]:
    for z in [-.3,0,.3]:tube([(side*.4,.15,z),(side*.9,.3,z-.15),(side*1.1,0,z-.3)],[.075,.05,.025],'root',5)
    orb((side*.7,.4,.6),(.25,.15,.3),'gold',8,4)
kind='lotus';segments=28
pad=[[0,.06,0]]+[[math.cos(.22+i*(math.tau-.44)/segments),.025*math.sin(i*.8),math.sin(.22+i*(math.tau-.44)/segments)] for i in range(segments+1)]
part('lotus',pad,[(0,i,i+1) for i in range(1,segments+1)])
for a in range(8):tube([[0,.07,0],[math.cos(a*math.tau/8)*.85,.06,math.sin(a*math.tau/8)*.85]],[.018,.006],'leafLight',4)
kind='lotusFlower'
for i in range(9):
    a=i*math.tau/9;orb((math.cos(a)*.22,.16,math.sin(a)*.22),(.17,.25,.33),'pink',8,5)
orb((0,.3,0),(.15,.12,.15),'gold',8,5)
# Terrain: exactly the same exported triangles used for runtime height interpolation.
def load_data(path):
    s=(ROOT/path).read_text(encoding='utf-8');return json.loads(s[s.index('{'):].strip().rstrip(';'))
realm=load_data('demo/features/world/data/expanded-realm.js');river=load_data('demo/features/river/data/thermal-river.js');rt=river['terrain'];rh=dict(zip(rt['keys'],rt['heights']));rc=set(rt['cells'])
def interpolate(x,z,x0,z0,step,n,values):
    u=(x-x0)/step;v=(z-z0)/step;i=math.floor(u);j=math.floor(v);fx=u-i;fz=v-j;a=values[j*(n+1)+i];b=values[j*(n+1)+i+1];c=values[(j+1)*(n+1)+i];d=values[(j+1)*(n+1)+i+1]
    return a+(b-a)*fx+(c-a)*fz if fx+fz<=1 else d+(c-d)*(1-fx)+(b-d)*(1-fz)
def original(x,z):
    i=math.floor((x-rt['x0'])/rt['step']);j=math.floor((z-rt['z0'])/rt['step'])
    if 0<=i<rt['n'] and 0<=j<rt['n'] and j*rt['n']+i in rc:return interpolate(x,z,rt['x0'],rt['z0'],rt['step'],rt['n'],rh)
    return interpolate(x,z,-realm['size']/2,-realm['size']/2,realm['size']/realm['segments'],realm['segments'],realm['heights'])
bounds=dict(x0=-190,z0=-970,nx=104,nz=62,step=5);vs=[];hs=[];fs=[]
def profile(x,z):
    q=math.hypot((x-70)/230,(z+825)/125);base=original(x,z)
    if q>=1:return base
    blend=min(1,(1-q)/.18);blend=blend*blend*(3-2*blend);bed=-36-7*(1-q)+2*math.sin(x*.04)*math.cos(z*.035)
    return base*(1-blend)+bed*blend
for j in range(63):
    for i in range(105):
        x=-190+i*5;z=-970+j*5;h=profile(x,z);hs.append(round(h,5));vs.append([x,h,z])
for j in range(62):
    for i in range(104):a=j*105+i;fs.extend([(a,a+105,a+1),(a+1,a+105,a+106)])
kind='terrain';part('mud',vs,fs)
trees=[]
for i in range(92):
    a=i*2.39996;r=math.sqrt((i+.5)/92)*.88;x=70+math.cos(a)*215*r;z=-825+math.sin(a)*112*r
    if abs(x-70)<24 or math.hypot(x-70,z+886)<42 or math.hypot(x-135,z+815)<28:continue
    bridge_clear=False
    for bridge in river['bridges']:
        dx=x-bridge['x'];dz=z-bridge['z'];u=dx*bridge['nx']+dz*bridge['nz'];v=-dx*bridge['nz']+dz*bridge['nx']
        if abs(u)<bridge['half']+bridge['run']+28 and abs(v)<28:bridge_clear=True;break
    if bridge_clear:continue
    trees.append(dict(x=round(x,3),z=round(z,3),y=-8,scale=round(.68+rng.random()*.6,3),yaw=round(rng.random()*math.tau,4)))
# Consolidate by material and joint for a small number of runtime draw calls.
models={};objects={};convert=lambda p:(p[0],-p[2],p[1])
for (k,j,m),b in buffers.items():
    model=models.setdefault(k,[]);model.append(dict(joint=j,material=m,vertices=[[round(v,5) for v in p] for p in b['vertices']],indices=b['indices']))
    mesh=bpy.data.meshes.new('Mangrove_'+k+'_'+m);mesh.from_pydata([convert(p) for p in b['vertices']],[],[b['indices'][i:i+3] for i in range(0,len(b['indices']),3)]);mesh.materials.append(materials[m]);mesh.update()
    o=bpy.data.objects.new('Mangrove_'+k+'_'+j+'_'+m,mesh);collection.objects.link(o);objects.setdefault(k,[]).append(o)
for proto in objects['tree']:
    proto.hide_render=True;proto.hide_set(True)
    for i,p in enumerate(trees):
        o=bpy.data.objects.new('GiantMangrove_%02d_%s'%(i,proto.data.materials[0].name),proto.data);collection.objects.link(o);o.location=convert([p['x'],p['y'],p['z']]);o.scale=(p['scale'],)*3;o.rotation_euler.z=p['yaw']
for o in objects['crocodile']:o.location=convert([135,-.2,-815])
for o in objects['relic']:o.location=convert([70,4.3,-886])
# Opaque brackish water is an actual authored basin, not a blue river reskin.
mesh=bpy.data.meshes.new('BrackishWater');wv=[convert([70+229*math.cos(i*math.tau/96),1.2,-825+124*math.sin(i*math.tau/96)]) for i in range(96)];mesh.from_pydata(wv,[],[tuple(range(96))]);mesh.materials.append(materials['water']);o=bpy.data.objects.new('OpaqueSaltwaterBasin',mesh);collection.objects.link(o)
data=dict(source='Blender',version=1,center=[70,-825],rx=230,rz=125,waterY=1.2,bounds=bounds,heights=hs,models=models,materials=palette,trees=trees,rootPaths=root_paths,decks=decks,pillars=pillars,entry=[70,original(70,-665),-665],treasure=[70,4.3,-886],crocodile=dict(maxHealth=10000,spawn=[135,-.2,-815],pivots={'body':[0,0,0],'head':[0,2.5,5],'jaw':[0,1.2,7],'tail':[0,2,-5],'front-1':[-2.4,1.7,4],'front1':[2.4,1.7,4],'rear-1':[-2.4,1.7,-4],'rear1':[2.4,1.7,-4]}))
out=ROOT/'demo/features/mangrove/data/mangrove-assets.js';out.parent.mkdir(parents=True,exist_ok=True);out.write_text('const MANGROVE_ASSETS='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf-8')
world=bpy.data.worlds.new('MangroveAtmosphere');scene.world=world;world.use_nodes=True;background=next(n for n in world.node_tree.nodes if n.type=='BACKGROUND');background.inputs[0].default_value=(.12,.18,.22,1);background.inputs[1].default_value=.6
light=bpy.data.lights.new('MangroveMoon','SUN');light.energy=2.5;lo=bpy.data.objects.new('MangroveMoon',light);collection.objects.link(lo);lo.rotation_euler=(.4,-.5,-.4)
camera=bpy.data.cameras.new('MangroveOverview');co=bpy.data.objects.new('MangroveOverview',camera);collection.objects.link(co);co.location=convert([355,230,-535]);target=Vector(convert([70,15,-825]));co.rotation_euler=(target-co.location).to_track_quat('-Z','Y').to_euler();camera.lens=35;camera.clip_end=3000;scene.camera=co
scene.render.resolution_x=1400;scene.render.resolution_y=900;scene.render.resolution_percentage=100
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':area.spaces.active.region_3d.view_perspective='CAMERA';area.spaces.active.clip_end=4000
dest=ROOT/'Assets/Art/Blender/Environments/MangroveRealm.blend';dest.parent.mkdir(parents=True,exist_ok=True);bpy.context.view_layer.update()
# An isolated, editable character library is convenient for later sculpting/rigging.
studio=bpy.data.scenes.get('SwampCrocodileStudio')
if studio:bpy.data.scenes.remove(studio)
studio=bpy.data.scenes.new('SwampCrocodileStudio');studio.world=world
for source in objects['crocodile']:
    o=source.copy();o.location=(0,0,0);studio.collection.objects.link(o)
    if '_jaw_' in o.name:
        pivot=Vector(convert([0,1.2,7]));o.matrix_world=Matrix.Translation(pivot)@Matrix.Rotation(.24,4,'X')@Matrix.Translation(-pivot)
studio_camera=bpy.data.cameras.new('SwampCrocodileCamera');studio_camera.lens=45;studio_camera.clip_end=500
studio_eye=bpy.data.objects.new('SwampCrocodileCamera',studio_camera);studio.collection.objects.link(studio_eye);studio_eye.location=(27,-36,24);studio_eye.rotation_euler=(Vector((0,1,2))-studio_eye.location).to_track_quat('-Z','Y').to_euler();studio.camera=studio_eye
studio_light=bpy.data.objects.new('SwampCrocodileSun',light.copy());studio.collection.objects.link(studio_light);studio_light.rotation_euler=(.3,-.5,-.4)
studio.render.resolution_x=1200;studio.render.resolution_y=800;studio.render.resolution_percentage=100
character=ROOT/'Assets/Art/Blender/Characters/SwampCrocodile.blend'
# Blender 5.2.1 crashes in libraries.write({scene}); save a scene-focused copy instead.
bpy.context.window.scene=studio;bpy.context.view_layer.update();bpy.ops.wm.save_as_mainfile(filepath=str(character),copy=True)
bpy.context.window.scene=scene
bpy.ops.wm.save_as_mainfile(filepath=str(dest))
print(json.dumps({'file':str(dest),'trees':len(trees),'models':list(models),'crocodileHP':10000,'export':str(out)}))
