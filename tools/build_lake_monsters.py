"""Author articulated lake bosses in Blender; export the same meshes for Three.js."""
import bpy,math,json,random,re,hashlib
from mathutils import Vector
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
name='MercuryLakeMonsters';old=bpy.data.collections.get(name)
if old:
    for o in list(old.all_objects):bpy.data.objects.remove(o,do_unlink=True)
    bpy.data.collections.remove(old)
collection=bpy.data.collections.new(name);bpy.context.scene.collection.children.link(collection)
palette={'nessSkin':(.17,.30,.25),'crocSkin':(.23,.25,.34),'plate':(.10,.14,.20),
         'belly':(.31,.29,.25),'bone':(.65,.62,.45),'mouth':(.10,.015,.045),
         'gum':(.29,.045,.07),'eye':(1,.32,.025),'pupil':(.008,.008,.012),
         'cosmic':(.48,.13,.72),'rune':(.12,.55,.53)}
materials={}
for key,rgb in palette.items():
    mat=bpy.data.materials.new('LakeBoss_'+key);mat.diffuse_color=(*rgb,1);mat.use_nodes=True
    bsdf=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bsdf.inputs['Base Color'].default_value=(*rgb,1);bsdf.inputs['Roughness'].default_value=.7
    if key in ['eye','cosmic','rune']:bsdf.inputs['Emission Color'].default_value=(*rgb,1);bsdf.inputs['Emission Strength'].default_value=.8
    materials[key]=mat
buffers={};joint='body'
def meshpart(material,vertices,faces):
    b=buffers.setdefault((joint,material),{'vertices':[],'indices':[]});offset=len(b['vertices']);b['vertices']+=vertices
    for face in faces:
        for i in range(1,len(face)-1):b['indices'] += [offset+face[0],offset+face[i],offset+face[i+1]]
def ellipsoid(center,size,material,segments=14,rows=9):
    vertices=[]
    for i in range(rows+1):
        theta=math.pi*i/rows
        for j in range(segments):
            a=j*math.tau/segments
            vertices.append([center[0]+math.sin(theta)*math.cos(a)*size[0],center[1]+math.cos(theta)*size[1],center[2]+math.sin(theta)*math.sin(a)*size[2]])
    faces=[]
    for i in range(rows):
        for j in range(segments):a=i*segments+j;b=i*segments+(j+1)%segments;faces.append([a,b,b+segments,a+segments])
    meshpart(material,vertices,faces)
def tube(points,radii,material,segments=10):
    vertices=[]
    for i,p in enumerate(points):
        tangent=(Vector(points[min(i+1,len(points)-1)])-Vector(points[max(0,i-1)])).normalized()
        axis=tangent.cross(Vector((0,1,0)))
        if axis.length<.01:axis=tangent.cross(Vector((1,0,0)))
        axis.normalize();other=tangent.cross(axis).normalized()
        for j in range(segments):
            a=j*math.tau/segments;vertices.append(list(Vector(p)+radii[i]*(axis*math.cos(a)+other*math.sin(a))))
    faces=[]
    for i in range(len(points)-1):
        for j in range(segments):a=i*segments+j;b=i*segments+(j+1)%segments;faces.append([a,b,b+segments,a+segments])
    faces += [list(reversed(range(segments))),list(range((len(points)-1)*segments,len(points)*segments))]
    meshpart(material,vertices,faces)
def spike(base,tip,radius,material='bone'):tube([base,tip],[radius,.025],material,7)
def plate(center,size,material='plate'):ellipsoid(center,size,material,10,5)
models=[]
for kind in ['ness','space_croc']:
    buffers.clear();joint='body'
    if kind=='ness':
        joints=dict(body=dict(parent=None,pivot=[0,0,0]),neck=dict(parent='body',pivot=[0,3,7]),
                    head=dict(parent='neck',pivot=[0,34,14]),jaw=dict(parent='head',pivot=[0,33.5,16]),
                    tail=dict(parent='body',pivot=[0,0,-10]),finL=dict(parent='body',pivot=[-7,-1,1]),finR=dict(parent='body',pivot=[7,-1,1]))
        ellipsoid([0,0,-1],[8,6,14],'nessSkin');ellipsoid([0,-2,0],[6,3.5,12],'belly')
        for z in [-10,-5,0,5,9]:
            for x in [-4,0,4]:plate([x,4.8,z],[2.6,1.1,3.2])
            spike([0,5,z],[0,10,z-2],1.4,'plate')
        joint='tail';tube([[0,0,-10],[1,-1,-19],[4,-2,-28],[8,-1,-36]],[5.6,4,2,.1],'nessSkin')
        for z in [-15,-21,-27]:spike([1,2,z],[1,6,z-2],1,'plate')
        for side,label in [(-1,'finL'),(1,'finR')]:
            joint=label;tube([[side*6,-1,1],[side*13,-2,-3],[side*20,-3,-9]],[2.7,2,.08],'nessSkin')
            for i in range(3):spike([side*18,-2.6,-8-i*.7],[side*21,-2.6,-10-i*.7],.3)
        joint='neck';tube([[0,3,7],[0,11,10],[-2,20,12],[-1,28,12],[0,34,14]],[4,3.6,2.8,2.2,2.2],'nessSkin',14)
        tube([[0,4,10],[0,12,13],[-1.9,21,14.5],[-.9,29,14.3],[0,33,16]],[2.3,2,1.6,1.2,1.1],'belly',10)
        for y in [9,14,19,24,29]:
            spike([0,y,8],[0,y+2,3.2],1,'plate');plate([0,y,13.7],[.75,.2,.25],'rune')
        joint='head';ellipsoid([0,35.5,16.5],[3.9,3,7.3],'nessSkin');ellipsoid([0,34.1,20],[3.4,.7,5.3],'mouth')
        for side in [-1,1]:
            ellipsoid([side*3.35,36.5,15.3],[.75,.78,.85],'eye');ellipsoid([side*3.8,36.5,15.5],[.13,.61,.25],'pupil')
            plate([side*3.2,37.3,15.2],[1.2,.7,2.2]);spike([side*2.5,37,12.5],[side*4.1,43,8],1.1)
            for i in range(11):
                z=16+i*.65;x=side*(3.1-(z-16)*.12)
                spike([x,34.7,z],[x,32.7-(i%2)*.5,z+.15],.35)
        joint='jaw';ellipsoid([0,32.9,20],[3.3,.9,5.8],'nessSkin');ellipsoid([0,33.45,20],[2.7,.3,5.1],'gum')
        for side in [-1,1]:
            for i in range(10):
                z=16+i*.7;x=side*(2.9-(z-16)*.1);spike([x,33.5,z],[x,35+(i%2)*.4,z],.28)
        spec=dict(id='ness',name='Loch Ness — Kẻ Nuốt Trăng',maxHealth=10000,spawn=[-72,-34],speed=7.3,detect=145,reach=40,damage=38,windup=1.2,side=-1,radius=8)
    else:
        joints=dict(body=dict(parent=None,pivot=[0,0,0]),head=dict(parent='body',pivot=[0,1,13]),jaw=dict(parent='head',pivot=[0,.3,14]),
                    tail=dict(parent='body',pivot=[0,-1,-15]),finL=dict(parent='body',pivot=[-7,-1,0]),finR=dict(parent='body',pivot=[7,-1,0]))
        ellipsoid([0,0,-2],[8.5,5.5,17],'crocSkin');ellipsoid([0,-2.5,-2],[7,2.7,15],'belly')
        for z in [-14,-8,-2,4,10]:
            for x in [-5,0,5]:
                plate([x,4.6,z],[2.8,1.5,3.6]);spike([x,5.3,z],[x,9-(abs(x)*.3),z-2],1.3,'plate')
            plate([0,6.2,z],[.35,.17,1.1],'cosmic')
        joint='tail';tube([[0,-1,-15],[0,-2,-26],[-3,-2,-37],[-7,-1,-46]],[6,4.2,2.1,.05],'crocSkin',12)
        for i,z in enumerate([-20,-26,-32,-38]):spike([-i*.8,2-i*.3,z],[-i*.8,6-i*.5,z-1.5],1,'plate')
        for side,label in [(-1,'finL'),(1,'finR')]:
            joint=label
            for z in [-11,7]:
                tube([[side*6,-1,z],[side*12,-1.8,z-2],[side*14,-2,z+2]],[2.4,1.6,.9],'crocSkin')
                for i in range(3):spike([side*14,-1.8,z+i],[side*17,-1.5,z+i+1.4],.55)
        joint='head';ellipsoid([0,2.4,20],[7,3.4,12],'crocSkin');ellipsoid([0,2.2,29],[5.6,2.2,8],'crocSkin')
        ellipsoid([0,.6,25],[5.7,.8,11],'mouth')
        for side in [-1,1]:
            plate([side*4.6,5.1,15],[2,1.4,3.7]);ellipsoid([side*5.5,5.1,17],[1,.85,1.05],'eye')
            ellipsoid([side*6.1,5.1,17.3],[.12,.7,.45],'pupil');plate([side*2.5,3.5,33],[1,.7,1.6])
            spike([side*5.2,5.8,14],[side*6.6,10,10],1.5,'cosmic')
            for i in range(16):
                z=15+i*1.25;x=side*(5.8-max(0,z-26)*.15)
                spike([x,1.4,z],[x,-1-(i%3)*.5,z+.2],.5)
        joint='jaw';ellipsoid([0,-.6,25],[6.2,1.35,12.2],'crocSkin');ellipsoid([0,.5,25],[5.4,.3,11],'gum')
        for side in [-1,1]:
            for i in range(15):
                z=16+i*1.25;x=side*(5.6-max(0,z-26)*.14);spike([x,.4,z],[x,2.7+(i%3)*.4,z],.45)
        spec=dict(id='space_croc',name='Cá Sấu Không Gian — Hàm Hư Không',maxHealth=7000,spawn=[75,30],speed=8.4,detect=125,reach=46,damage=28,windup=.95,side=1,radius=8.5)
    if kind=='space_croc':
        # The enormous muzzle and fangs must break the mercury surface instead
        # of being hidden entirely beneath an opaque liquid when idle.
        for key in ['head','jaw']:joints[key]['pivot'][1]+=3
        for (bone,material),buffer in buffers.items():
            if bone in ['head','jaw']:
                for vertex in buffer['vertices']:vertex[1]+=3
    pieces=[]
    offset=Vector((spec['spawn'][0]-370,430-spec['spawn'][1],-2))
    rig=bpy.data.objects.new(kind+'_Rig',None);collection.objects.link(rig);rig.location=offset;rig['maxHealth']=spec['maxHealth']
    bones={}
    for key,definition in joints.items():
        bone=bpy.data.objects.new(kind+'_'+key+'_Pivot',None);collection.objects.link(bone)
        parent=definition['parent'];bone.parent=bones[parent] if parent else rig
        point=Vector(definition['pivot'])-Vector(joints[parent]['pivot'] if parent else [0,0,0])
        bone.location=(point.x,-point.z,point.y);bone.empty_display_type='ARROWS';bone.empty_display_size=1.2;bones[key]=bone
    for (bone,material),b in buffers.items():
        pieces.append(dict(joint=bone,material=material,**b))
        px,py,pz=joints[bone]['pivot']
        mesh=bpy.data.meshes.new(kind+'_'+bone+'_'+material);vs=[(x-px,-z+pz,y-py) for x,y,z in b['vertices']];ids=b['indices']
        mesh.from_pydata(vs,[],[ids[i:i+3] for i in range(0,len(ids),3)]);mesh.update();mesh.materials.append(materials[material])
        obj=bpy.data.objects.new(kind+'_'+bone+'_'+material,mesh);collection.objects.link(obj);obj.parent=bones[bone];obj['monster']=kind;obj['joint']=bone;obj['maxHealth']=spec['maxHealth']
    models.append(dict(**spec,joints=joints,pieces=pieces))
camera_data=bpy.data.cameras.new('LakeBossPreview');camera=bpy.data.objects.new('LakeBossPreview',camera_data);collection.objects.link(camera)
camera.location=(-255,350,63);camera.rotation_euler=(Vector((-370,430,11))-camera.location).to_track_quat('-Z','Y').to_euler();camera_data.lens=28;bpy.context.scene.camera=camera
sun_data=bpy.data.lights.new('LakeBossMoonlight','SUN');sun_data.energy=2;sun=bpy.data.objects.new('LakeBossMoonlight',sun_data);collection.objects.link(sun);sun.rotation_euler=(.6,-.4,.2)
bpy.context.scene.unit_settings.system='METRIC'
out=ROOT/'demo/features/lake/data/lake-monsters.js';out.write_text('window.LAKE_MONSTER_DATA='+json.dumps(dict(source='Blender',version=1,materials=palette,models=models),ensure_ascii=False)+';\n',encoding='utf-8')
blend=ROOT/'Assets/Art/Blender/Characters/MercuryLakeMonsters.blend';bpy.ops.wm.save_as_mainfile(filepath=str(blend))
page=ROOT/'demo/index.html';html=page.read_text(encoding='utf-8')
for asset in ['features/lake/data/lake-monsters.js','features/lake/lake-monsters.js']:
    digest=hashlib.sha256((ROOT/'demo'/asset).read_bytes()).hexdigest()[:12]
    html=re.sub(r'src="'+re.escape(asset)+r'(?:\?[^"\s]*)?"','src="'+asset+'?v='+digest+'"',html)
page.write_text(html,encoding='utf-8')
print('LAKE_MONSTERS_EXPORTED',[(m['id'],m['maxHealth'],len(m['pieces'])) for m in models])
