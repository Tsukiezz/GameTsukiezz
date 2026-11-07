"""Blender source and runtime meshes for the living world, including arena art.

Run: E:\\blender.exe --background --python tools/build_creature_studio.py
Game coordinates use +Y up, +Z forward. Regenerates this studio and its runtime data.
"""
from pathlib import Path
import bpy, json, math, random
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[1]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
palette={'cream':'e9dbbc','white':'eee9df','dark':'253342','eye':'192431','shine':'fff9e9','rose':'d79ca4','gold':'dab46c','brown':'9e7253','hoof':'47474c','green':'639e79','blue':'77b8cc','red':'b96365'}
def rgb(value):
    value=palette.get(value,value).lstrip('#');return tuple(int(value[i:i+2],16)/255 for i in (0,2,4))
materials={}
def mat(color):
    color=palette.get(color,color)
    if color not in materials:
        m=bpy.data.materials.new('Creature_'+color);m.diffuse_color=(*rgb(color),1);m.use_nodes=True;p=next((n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None) or m.node_tree.nodes.new('ShaderNodeBsdfPrincipled');output=next((n for n in m.node_tree.nodes if n.type=='OUTPUT_MATERIAL'),None) or m.node_tree.nodes.new('ShaderNodeOutputMaterial');m.node_tree.links.new(p.outputs[0],output.inputs['Surface']);p.inputs['Base Color'].default_value=m.diffuse_color;p.inputs['Roughness'].default_value=.72;materials[color]=m
    return materials[color]
def V(p):return Vector((p[0],-p[2],p[1]))
current=None;objects=[];joints={};models={}
def add(name,p,s,color,joint='body',cube=False):
    if cube:
        bpy.ops.mesh.primitive_cube_add(size=2,location=V(p));o=bpy.context.object;o.scale=(s[0],s[2],s[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);b=o.modifiers.new('Soft tailored edges','BEVEL');b.width=min(s)*.28;b.segments=2;bpy.ops.object.modifier_apply(modifier=b.name)
    else:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,radius=1,location=V(p));o=bpy.context.object;o.scale=(s[0],s[2],s[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.name=current+'_'+name;o.data.materials.append(mat(color));o['joint']=joint
    for f in o.data.polygons:f.use_smooth=True
    objects.append(o);return o
def rod(name,a,b,r,color,tip=None,joint='body'):
    delta=V(b)-V(a);bpy.ops.mesh.primitive_cone_add(vertices=9,radius1=r,radius2=r if tip is None else tip,depth=delta.length,location=(V(a)+V(b))/2);o=bpy.context.object;o.rotation_euler=delta.to_track_quat('Z','Y').to_euler();o.name=current+'_'+name;o.data.materials.append(mat(color));o['joint']=joint
    for f in o.data.polygons:f.use_smooth=True
    objects.append(o);return o
def eye(x,y,z,r=.055):
    # Front-facing eyes have a pale socket, glossy pupil, and separate catchlight.
    for side in [-1,1]:
        add('EyeSocket',(side*x,y,z),(r*1.35,r*1.45,r*.56),'cream');add('Iris',(side*x,y,z+r*.42),(r,r*1.14,r*.5),'eye');add('Catchlight',(side*x-r*.24,y+r*.32,z+r*.85),(r*.28,r*.3,r*.16),'shine')
def leg(x,y,z,r,coat,index,hoof=True):
    key='leg'+str(index);joints[key]=[x,y,z];rod('UpperLeg',(x,y,z),(x,.2,z+.035),r,coat,tip=r*.75,joint=key);add('Paw',(x,.13,z+.065),(r*1.28,.13,r*1.6),'hoof' if hoof else coat,key)
def export_model(kind):
    bins={}
    for o in objects:
        o.update_tag();o.data.calc_loop_triangles();normal=o.matrix_world.to_3x3().inverted().transposed();joint=o['joint'];b=bins.setdefault(joint,{'p':[],'n':[],'c':[],'i':[]});offset=len(b['p'])//3;color=rgb(o.data.materials[0].name.removeprefix('Creature_'))
        for v in o.data.vertices:
            p=o.matrix_world@v.co;n=(normal@v.normal).normalized();b['p'].extend(round(q,5) for q in (p.x,p.z,-p.y));b['n'].extend(round(q,5) for q in (n.x,n.z,-n.y));b['c'].extend(round(q,4) for q in color)
        for t in o.data.loop_triangles:b['i'].extend(offset+i for i in t.vertices)
    models[kind]={'joints':dict(joints),'parts':bins,'triangles':sum(len(b['i'])//3 for b in bins.values())}
    collection=bpy.data.collections.new('Creature_'+kind);bpy.context.scene.collection.children.link(collection)
    for o in objects:
        for c in list(o.users_collection):c.objects.unlink(o)
        collection.objects.link(o)
    return collection
def mammal(kind):
    small={'rabbit':(.45,'dfd9cc'),'pig':(.65,'d8a1a3'),'horse':(1.35,'997052'),'cat':(.6,'8998a4'),'dog':(.8,'b99670'),'goat':(1.35,'ddd2bb'),'doe':(1.9,'bc9872'),'deer':(2.25,'a77e59'),'bull':(2.65,'695b50'),'buffalo':(2.5,'535e65'),'elephant':(3.2,'8c9a9f'),'polar_bear':(2.2,'e9e7db'),'wolf':(1.4,'788c9c'),'arena_beast':(4.6,'5b687d')}
    H,coat=small[kind];s=H/2;large=kind in ['elephant','buffalo','bull','polar_bear','arena_beast'];fat=kind in ['pig','polar_bear','elephant'];bodyY=H*.47;length=H*(.61 if large else .48);width=H*(.3 if fat else .23)
    add('Body',(0,bodyY,0),(width,H*.27,length),coat);add('Belly',(0,bodyY-.05,length*.22),(width*.86,H*.24,length*.65),'cream' if not large else coat)
    headY=H*.72 if kind not in ['horse','deer','doe','goat'] else H*.78;headZ=length*.82
    if kind in ['horse','deer','doe','goat']:add('Neck',(0,H*.63,length*.55),(H*.16,H*.28,H*.17),coat)
    add('Head',(0,headY,headZ),(H*.24,H*.23,H*.26),coat);add('Muzzle',(0,headY-H*.09,headZ+H*.18),(H*.18,H*.13,H*.15),'rose' if kind=='pig' else 'cream');add('Nose',(0,headY-H*.06,headZ+H*.31),(H*.065,H*.045,H*.025),'rose' if kind=='rabbit' else 'dark')
    eye(H*.12,headY+H*.035,headZ+H*.225,H*.042)
    for side in [-1,1]:
        earY=headY+H*.19;earH=H*(.25 if kind=='rabbit' else .095);ear=add('Ear',(side*H*.18,earY+earH*.55,headZ-H*.015),(H*.085,earH,H*.07),coat);ear.rotation_euler.y=side*.18;add('EarInner',(side*H*.18,earY+earH*.55,headZ+H*.052),(H*.048,earH*.68,H*.012),'rose')
        for z in [-length*.6,length*.55]:leg(side*width*.75,bodyY-H*.08,z,H*(.085 if large else .06),coat,len(joints)-1,kind not in ['cat','dog','wolf','arena_beast','polar_bear','rabbit'])
        if kind in ['buffalo','bull','goat','deer']:
            start=(side*H*.16,headY+H*.17,headZ);mid=(side*H*.38,headY+H*.26,headZ-H*.08);end=(side*H*.43,headY+H*.43,headZ+H*.02);rod('Horn',start,mid,H*.038,'cream',H*.025);rod('HornTip',mid,end,H*.025,'cream',.003)
            if kind=='deer':
                for i in range(3):rod('AntlerBranch',(side*H*(.23+i*.06),headY+H*(.23+i*.06),headZ),(side*H*(.27+i*.12),headY+H*(.39+i*.06),headZ+H*.12),H*.017,'brown',.002)
        if kind=='elephant':
            add('LargeEar',(side*H*.33,headY,headZ-H*.02),(H*.2,H*.28,H*.06),coat);add('EarFold',(side*H*.34,headY,headZ+H*.033),(H*.13,H*.21,H*.015),'b39c9c');rod('Tusk',(side*H*.12,headY-H*.08,headZ+H*.16),(side*H*.16,headY-H*.17,headZ+H*.48),H*.035,'cream',.002)
        if kind in ['doe','deer']:
            for i in range(5):add('CoatSpot',(side*width*.92,bodyY+H*.1+(i%2)*H*.07,(i-2)*length*.24),(H*.035,H*.025,H*.04),'cream')
    if kind=='elephant':
        for i in range(9):add('Trunk',(math.sin(i*.32)*H*.025,headY-H*.08-i*H*.063,headZ+H*.24+i*H*.026),(H*(.085-i*.004),H*.065,H*.08),coat)
    if kind in ['cat','dog','wolf','arena_beast']:
        for i in range(4):add('Tail',(H*.05*math.sin(i*.5),bodyY+i*H*.07,-length-i*H*.09),(H*.075,H*.085,H*.14),coat)
    else:add('Tail',(0,bodyY,-length),(H*.065,H*.095,H*.11),coat)
    if kind in ['horse','bull','arena_beast']:
        for i in range(7):add('Mane',(0,headY-H*.12+i*H*.055,headZ-H*.16),(H*.14,H*.09,H*.12),'dark' if kind!='arena_beast' else 'blue')
    if kind=='arena_beast':
        for side in [-1,1]:rod('Fang',(side*H*.09,headY-H*.08,headZ+H*.3),(side*H*.09,headY-H*.18,headZ+H*.31),H*.025,'cream',.002)
def bird(kind):
    penguin=kind=='penguin';coat='263b50' if penguin else 'f2e6c9';h=1.55 if penguin else .95
    add('Body',(0,h*.43,0),(h*.29,h*.39,h*.29),coat);add('Bib',(0,h*.42,h*.23),(h*.22,h*.29,h*.08),'white');add('Head',(0,h*.82,h*.035),(h*.25,h*.22,h*.24),coat);eye(h*.095,h*.85,h*.245,h*.038)
    add('Beak',(0,h*.76,h*.31),(h*.08,h*.055,h*.16),'gold')
    for side in [-1,1]:
        key='leg'+str(len(joints)-1);joints[key]=[side*h*.15,h*.08,0];add('Feet',(side*h*.15,h*.06,h*.08),(h*.13,h*.055,h*.19),'gold',key)
        add('Wing',(side*h*.29,h*.45,-h*.01),(h*.09,h*.25,h*.21),coat)
        if not penguin:
            for i in range(3):add('TailFeather',(side*h*.06,h*(.42+i*.09),-h*(.28+i*.045)),(h*.08,h*.16,h*.11),'brown')
    if not penguin:
        for i in range(3):add('Comb',(0,h*(1.015+i%2*.035),h*(.1-i*.12)),(h*.07,h*.09,h*.08),'red')
def frog():
    add('Back',(0,.18,0),(.27,.18,.32),'green');add('Face',(0,.23,.2),(.27,.14,.2),'8bb78b');add('Belly',(0,.14,.08),(.2,.1,.22),'cream');eye(.16,.36,.31,.065)
    for side in [-1,1]:
        add('Thigh',(side*.26,.12,-.15),(.15,.13,.17),'green')
        for z in [-.15,.2]:rod('Leg',(side*.16,.14,z),(side*.3,.04,z+.15),.04,'green');add('Toes',(side*.3,.03,z+.18),(.12,.025,.09),'8bb78b')
def butterfly():
    add('Body',(0,.1,0),(.045,.06,.3),'dark')
    for side in [-1,1]:
        key='leg'+str(len(joints)-1);joints[key]=[0,.1,0]
        for i in range(2):
            add('Wing',(side*(.28-i*.05),.1,(i-.5)*.42),(.32-i*.06,.035,.31-i*.05),'d99a74' if i==0 else '849ed3',key)
            for j in range(3):add('WingSpot',(side*(.23+j*.07),.135,(i-.5)*.42),(.033,.008,.04),'cream',key)
        rod('Antenna',(side*.02,.12,.25),(side*.14,.3,.39),.012,'dark')
def benthic(kind):
    snail='snail' in kind;crab='crab' in kind;ice='ice' in kind or 'moon' in kind;coat='8cbbca' if ice else 'bf7864' if crab else 'd9a17d'
    if snail:
        add('Foot',(0,.1,0),(.34,.1,.53),'9ba787');add('Head',(0,.19,.4),(.19,.17,.21),'b5c0a0');add('Shell',(0,.36,-.08),(.36,.37,.33),'bdd0cf' if ice else 'b28a60')
        for i in range(22):
            a=i*.6;r=.22*(1-i/28);add('ShellSpiral',(.0+math.cos(a)*r,.37+math.sin(a)*r,.253),(.037,.037,.025),'cream' if ice else '866347')
        for side in [-1,1]:rod('EyeStalk',(side*.09,.23,.49),(side*.15,.48,.53),.028,'b5c0a0');add('Eye',(side*.15,.49,.53),(.035,.04,.035),'eye')
    elif crab:
        add('Carapace',(0,.3,0),(.52,.26,.4),coat);add('ShellInset',(0,.49,-.02),(.35,.055,.28),'d99678' if not ice else 'b3d7d7');eye(.16,.58,.28,.05)
        for side in [-1,1]:
            for i in range(4):
                a=(side*.38,.24,(i-1.5)*.16);b=(side*.68,.24,(i-1.5)*.22);end=(side*.82,.04,(i-1.5)*.29);rod('Leg',a,b,.045,coat);rod('LegTip',b,end,.035,coat,.009)
            rod('ClawArm',(side*.4,.3,.24),(side*.7,.4,.54),.08,coat);add('Pincer',(side*.77,.42,.63),(.17,.15,.2),coat);rod('PincerFinger',(side*.73,.46,.73),(side*.66,.48,.9),.065,'cream',.014);rod('PincerFinger',(side*.85,.45,.75),(side*.82,.48,.9),.07,coat,.014)
    else:
        for i in range(7):add('ArmourSegment',(0,.22+math.sin(i*.35)*.09,(i-3)*.14),(.17-i*.012,.18-i*.01,.14),coat)
        for side in [-1,1]:
            add('Eye',(side*.14,.44,.37),(.045,.05,.045),'eye')
            for i in range(5):rod('WalkingLeg',(side*.1,.2,(i-2)*.14),(side*.28,.025,(i-2)*.17+.07),.017,'cream')
            for i in range(3):rod('Feelers',(side*.06,.28,.45),(side*(.24+i*.11),.23+i*.04,.88+i*.12),.013,coat,.003)
            add('TailFan',(side*.13,.14,-.6),(.17,.035,.17),'rose')
def fish(kind):
    colors=['98bed0','d9a963','659cc8','c184a5','b6d5d9','78ab93'];coat=colors[int(kind[-1])];add('FishBody',(0,0,0),(.9,.8,1.3),coat);add('FishBelly',(0,-.35,.15),(.7,.45,.92),'cream');eye(.43,.16,1.08,.18)
    add('Mouth',(0,-.17,1.29),(.16,.08,.035),'rose');add('Tail',(0,0,-1.45),(.1,.82,.7),coat)
    for side in [-1,1]:add('SideFin',(side*.75,-.12,-.05),(.46,.08,.51),'d5c49a')
    add('DorsalFin',(0,.78,-.2),(.08,.46,.55),coat)
    for i in range(3):add('Gills',(.84,.03,.38-i*.17),(.045,.34,.045),'597c8e')
def monster(kind):
    if kind in ['wolf','moon_rabbit']:
        mammal('wolf' if kind=='wolf' else 'rabbit')
        if kind=='moon_rabbit':
            for side in [-1,1]:add('CursedCrystal',(side*.18,.42,-.05),(.055,.18,.06),'b06bd4')
        return
    robot=kind=='robot';coat='7498aa' if robot else '8e6b58';add('Torso',(0,.7,0),(.36,.44,.25),coat,cube=robot);add('Head',(0,1.32,.04),(.32,.3,.3),coat,cube=robot);eye(.115,1.36,.305,.055)
    for side in [-1,1]:
        leg(side*.2,.46,0,.1,coat,len(joints)-1);rod('Arm',(side*.31,.98,0),(side*.52,.56,.04),.105,coat);add('Glove',(side*.52,.56,.04),(.13,.13,.13),'dark')
    if robot:
        add('Faceplate',(0,1.33,.31),(.27,.18,.035),'dark',cube=True);add('Visor',(0,1.38,.35),(.2,.045,.02),'blue',cube=True);add('Core',(0,.75,.25),(.13,.13,.04),'blue');rod('Antenna',(0,1.6,0),(0,1.9,0),.025,'gold');add('AntennaTip',(0,1.9,0),(.06,.06,.06),'blue')
    else:
        add('Beard',(0,1.13,.29),(.24,.24,.12),'cream');add('Hat',(0,1.65,0),(.37,.21,.33),'red');add('Nose',(0,1.3,.4),(.1,.09,.08),'rose')
def spectator():
    add('Coat',(0,.62,0),(.3,.42,.2),'7775a7',cube=True);add('Head',(0,1.18,.03),(.3,.29,.28),'c3c2b4');eye(.105,1.2,.28,.045)
    for side in [-1,1]:
        leg(side*.16,.3,0,.075,'dark',len(joints)-1,False);rod('CheeringArm',(side*.25,.82,0),(side*.45,1.45,.05),.075,'7775a7');add('Hand',(side*.45,1.45,.05),(.09,.09,.09),'cream')
    add('Cap',(0,1.48,0),(.32,.1,.29),'gold')

exec((ROOT/'tools/creature_design_v2.py').read_text(encoding='utf8'))
exec((ROOT/'tools/arena_concept_shapes.py').read_text(encoding='utf8'))
exec((ROOT/'tools/forest_reference_shapes.py').read_text(encoding='utf8'))
species=['frog','rabbit','pig','horse','bull','goat','doe','deer','dog','cat','butterfly','elephant','chicken','buffalo','penguin','polar_bear']+[f'fish_{i}' for i in range(6)]+['river_shrimp','river_glass_shrimp','river_crab','river_moon_crab','river_snail','river_ice_snail','wolf','dwarf','robot','moon_rabbit','arena_beast','spectator']+extra_species
collections=[]
species += [kind for kind in FOREST_REFERENCE_KINDS if kind not in species]
for kind in species:
    current=kind;objects=[];joints={'body':[0,0,0]}
    if kind in FOREST_REFERENCE_KINDS:build_forest_reference(kind);ground_arena_concept()
    elif kind in ARENA_CONCEPT_KINDS:build_arena_concept(kind);ground_arena_concept()
    elif kind in ['spinosaurus','trex']:dinosaur(kind)
    elif kind=='zeus':zeus()
    elif kind in extra_species and kind!='dark_horse':legacy(kind)
    elif kind in ['frog']:frog()
    elif kind in ['chicken','penguin']:bird(kind)
    elif kind=='butterfly':butterfly()
    elif kind.startswith('river_'):benthic(kind)
    elif kind.startswith('fish_'):fish(kind)
    elif kind in ['dwarf','robot','moon_rabbit','wolf']:monster(kind)
    elif kind=='spectator':spectator()
    else:mammal(kind)
    bpy.context.view_layer.update();collections.append(export_model(kind))
    if kind in ARENA_CONCEPT_KINDS:tag_arena_concept(models[kind],kind)
    if kind in FOREST_REFERENCE_KINDS:tag_forest_reference(models[kind],kind)
out=ROOT/'demo/features/creatures/data/creature-studio.js';out.parent.mkdir(parents=True,exist_ok=True);out.write_text('window.CREATURE_STUDIO_DATA='+json.dumps({'source':'Blender','version':5,'forestSpiritKinds':FOREST_REFERENCE_KINDS[1:],'models':models},separators=(',',':'))+';\n',encoding='utf8')
# A separate display scene arranges normalized specimens for visual review.
for i,collection in enumerate(collections):
    vertices=[o.matrix_world@v.co for o in collection.objects for v in o.data.vertices];low=Vector(tuple(min(p[k] for p in vertices) for k in range(3)));high=Vector(tuple(max(p[k] for p in vertices) for k in range(3)));scale=2.5/max(high-low);offset=Vector(((i%8-3.5)*3.8,(i//8-3)*4.3,0))
    for o in collection.objects:o.location=(o.location-Vector(((low.x+high.x)/2,(low.y+high.y)/2,low.z)))*scale+offset;o.scale*=scale
    bpy.ops.object.text_add(location=offset+Vector((-1.4,-1.7,.03)));label=bpy.context.object;label.data.body=species[i];label.data.size=.25;label.data.materials.append(mat('cream'))
bpy.ops.mesh.primitive_plane_add(size=60,location=(0,0,-.05));bpy.context.object.data.materials.append(mat('2b3a48'))
world=bpy.context.scene.world;world.use_nodes=True;background=next((n for n in world.node_tree.nodes if n.type=='BACKGROUND'),None) or world.node_tree.nodes.new('ShaderNodeBackground');output=next((n for n in world.node_tree.nodes if n.type=='OUTPUT_WORLD'),None) or world.node_tree.nodes.new('ShaderNodeOutputWorld');world.node_tree.links.new(background.outputs[0],output.inputs['Surface']);background.inputs[0].default_value=(.15,.2,.27,1);background.inputs[1].default_value=.6
for p,energy,size in [((4,-7,18),1800,12),((-10,4,12),1400,10)]:bpy.ops.object.light_add(type='AREA',location=p);bpy.context.object.data.energy=energy;bpy.context.object.data.shape='DISK';bpy.context.object.data.size=size;bpy.context.object.rotation_euler=(Vector((0,0,0))-bpy.context.object.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(12,-24,46));camera=bpy.context.object;camera.rotation_euler=(Vector((0,0,0))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=50;bpy.context.scene.camera=camera
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=16;scene.render.resolution_x=1600;scene.render.resolution_y=1200;scene.render.resolution_percentage=100
blend=ROOT/'Assets/Art/Blender/Creatures/LunarCreatureStudio.blend';blend.parent.mkdir(parents=True,exist_ok=True);bpy.ops.wm.save_as_mainfile(filepath=str(blend));preview=ROOT/'demo/verification/creature-arena/creature-studio.png';preview.parent.mkdir(parents=True,exist_ok=True);scene.render.filepath=str(preview);bpy.ops.render.render(write_still=True)
print(json.dumps({'models':len(models),'triangles':sum(m['triangles'] for m in models.values()),'runtime_bytes':out.stat().st_size,'blend':str(blend)}))
