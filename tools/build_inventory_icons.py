"""Blender-authored cartoon inventory items; run with blender -b --python this_file."""
from pathlib import Path
import bpy, math, json
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'demo/features/inventory/assets/blender';OUT.mkdir(parents=True,exist_ok=True)
SOURCE=ROOT/'Assets/Art/Blender/Inventory/InventoryItemStudio.blend';SOURCE.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='BLENDER_WORKBENCH'
scene.render.resolution_x=256;scene.render.resolution_y=256;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.film_transparent=True
scene.display.shading.light='STUDIO';scene.display.shading.color_type='MATERIAL'
scene.display.shading.show_shadows=True;scene.display.shading.show_cavity=True
scene.display.shading.cavity_type='BOTH';scene.display.shading.show_specular_highlight=True
scene.display.shading.show_object_outline=True;scene.display.shading.object_outline_color=(.06,.08,.11)
scene.world.color=(.25,.25,.25)
palette={}
for name,hexcode in {'wood':'885337','bark':'54362b','cut':'edbd7d','gold':'ffc954','darkgold':'bb791f','mint':'71e9b6','teal':'167b7e','red':'d85f55','meat':'b85336','bone':'fff2d6','iron':'a8c5d6','dark':'293c54','purple':'a486e6','blue':'63cafa','green':'84dc63','paper':'efd49c','black':'263044','cream':'ffe3a1','silver':'ddeaf3'}.items():
    color=tuple(int(hexcode[i:i+2],16)/255 for i in (0,2,4))
    mat=bpy.data.materials.new(name);mat.diffuse_color=(*color,1);mat.use_nodes=True
    node=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED');node.inputs['Base Color'].default_value=(*color,1);node.inputs['Roughness'].default_value=.5
    palette[name]=mat

current=None
def finish(obj,name,color,loc,scale=(1,1,1),rot=(0,0,0)):
    obj.name=current.name+'_'+name;obj.parent=current;obj.location=loc;obj.scale=scale;obj.rotation_euler=rot;obj.data.materials.append(palette[color])
    return obj
def box(name,color,loc,size,rot=(0,0,0)):
    bpy.ops.mesh.primitive_cube_add(size=1);o=finish(bpy.context.object,name,color,loc,size,rot)
    bevel=o.modifiers.new('Soft cartoon edges','BEVEL');bevel.width=.07;bevel.segments=3;o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL');return o
def sphere(name,color,loc,scale=(1,1,1)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,radius=1);o=finish(bpy.context.object,name,color,loc,scale)
    for p in o.data.polygons:p.use_smooth=True
    return o
def cylinder(name,color,loc,r=.5,depth=1,rot=(0,0,0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=r,depth=depth);return finish(bpy.context.object,name,color,loc,rot=rot)
def ring(name,color,loc,r=.7,t=.12,rot=(0,0,0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=r,minor_radius=t,major_segments=32,minor_segments=10);return finish(bpy.context.object,name,color,loc,rot=rot)
def crystal(name,color,loc,size=(.45,.45,1)):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1);return finish(bpy.context.object,name,color,loc,size)
models={}
for kind in ['wood','minerals','gold_coin','meat','uranium','iron','rubber','silicon','cookie','flashlight','ancient_fragment','exit_map','magic_bean','boat','scrap']:
    current=bpy.data.objects.new('Item_'+kind,None);scene.collection.objects.link(current);models[kind]=current
    if kind=='wood':
        for i,(x,z) in enumerate([(-.4,.4),(.4,.4),(0,1.05)]):
            cylinder('log','wood',(x,0,z),.42,1.65,(math.pi/2,0,.12))
            cylinder('endgrain','cut',(x,-.84,z),.36,.04,(math.pi/2,0,0));ring('growth_ring','wood',(x,-.87,z),.22,.025,(math.pi/2,0,0))
        box('binding','teal',(0,0,.69),(1.65,.22,1.5))
    elif kind=='minerals':
        for i,(x,col) in enumerate([(-.6,'blue'),(0,'gold'),(.6,'purple')]):crystal('mineral',col,(x,0,.65+(i%2)*.3),(.55,.6,.9))
        sphere('bedrock','dark',(0,0,.22),(.95,.65,.25))
    elif kind=='gold_coin':
        for z in [.2,.37,.54]:cylinder('coin','gold',(0,0,z),.85,.17);ring('rim','darkgold',(0,0,z+.09),.72,.035)
        star=crystal('moon_gem','blue',(0,-.1,.69),(.3,.3,.18))
    elif kind=='meat':
        sphere('roasted_drumstick','meat',(-.15,0,.8),(.75,.55,.8));sphere('glaze','red',(-.35,-.38,1.05),(.35,.1,.25))
        cylinder('bone','bone',(.5,0,.48),.16,.85,(0,math.pi/2,0))
        for y in [-.17,.17]:sphere('bone_knuckle','bone',(.94,y,.48),(.21,.2,.22))
    elif kind=='uranium':
        cylinder('containment','dark',(0,0,.7),.64,1.25)
        for z in [.17,1.24]:ring('band','gold',(0,0,z),.64,.09)
        box('label','gold',(0,-.64,.72),(.72,.08,.68));sphere('core','green',(0,-.72,.72),(.2,.05,.2))
        for a in [0,2.094,4.189]:crystal('hazard','black',(.22*math.sin(a),-.73,.72+.22*math.cos(a)),(.13,.03,.15))
    elif kind=='iron':
        for x,z in [(-.36,.28),(.36,.28),(0,.68)]:box('iron_ingot','iron',(x,0,z),(.7,1.3,.38))
        box('shine','silver',(0,-.1,.9),(.4,.7,.04))
    elif kind=='rubber':
        ring('rubber_tire','black',(0,0,.83),.65,.28,(math.pi/2,0,0))
        for i in range(12):
            a=i*math.tau/12;box('tread','dark',(.83*math.sin(a),0,.83+.83*math.cos(a)),(.17,.56,.12),(0,a,0))
    elif kind=='silicon':
        box('wafer','teal',(0,0,.6),(1.25,1.2,.2));box('chip','black',(0,0,.8),(.85,.8,.22))
        for x in [-.5,-.25,0,.25,.5]:
            for sign in [-1,1]:box('gold_pin','gold',(x,sign*.72,.6),(.1,.32,.08))
        crystal('silicon_core','blue',(0,0,1),(.35,.35,.25))
    elif kind=='cookie':
        cylinder('cookie','cut',(0,0,.42),.9,.3)
        for x,y in [(-.35,-.4),(.3,-.3),(.4,.3),(-.4,.25),(0,.05)]:sphere('chocolate_chip','bark',(x,y,.6),(.13,.13,.07))
    elif kind=='flashlight':
        cylinder('grip','teal',(0,0,.65),.31,1.1);cylinder('lamp_head','gold',(0,0,1.25),.51,.4)
        cylinder('glass','cream',(0,0,1.47),.43,.06);box('switch','red',(0,-.32,.85),(.18,.08,.25))
        ring('base','dark',(0,0,.16),.32,.07)
    elif kind=='ancient_fragment':
        crystal('relic','mint',(0,0,.95),(.64,.4,.95))
        for z in [.55,1.1]:ring('gold_seal','gold',(0,0,z),.46,.07)
        sphere('pedestal','teal',(0,0,.15),(.7,.5,.15))
    elif kind=='exit_map':
        box('parchment','paper',(0,0,.45),(1.5,1.2,.08),(0,.1,0))
        for x in [-.76,.76]:cylinder('scroll_end','cut',(x,0,.5),.14,1.35,(math.pi/2,0,0))
        for x,y in [(-.45,-.3),(-.1,-.1),(.15,.1),(.4,.28)]:sphere('route','teal',(x,y,.52),(.05,.05,.025))
        for a in [-.7,.7]:box('destination','red',(.4,.3,.55),(.38,.07,.04),(0,0,a))
    elif kind=='magic_bean':
        sphere('seed','mint',(0,0,.6),(.55,.4,.6));cylinder('stem','green',(0,0,1.2),.065,.65)
        sphere('left_leaf','green',(-.3,0,1.43),(.4,.12,.18));sphere('right_leaf','mint',(.27,0,1.6),(.35,.12,.15))
        ring('magic_aura','gold',(0,0,.2),.75,.035)
    elif kind=='boat':
        sphere('wooden_hull','wood',(0,0,.4),(1,.55,.32));box('rim','cut',(0,0,.58),(1.5,.7,.12))
        box('inside','dark',(0,0,.66),(1.25,.5,.05));cylinder('mast','wood',(0,0,1.1),.055,1)
        box('sail','cream',(.33,0,1.23),(.58,.045,.75));box('paddle','gold',(-.5,-.5,.7),(.08,1.5,.07),(0,0,-.6))
    elif kind=='scrap':
        ring('gear','iron',(0,0,.45),.62,.18)
        for i in range(10):
            a=i*math.tau/10;box('gear_tooth','iron',(.8*math.sin(a),.8*math.cos(a),.45),(.3,.3,.3),(0,0,-a))
        box('salvage_plate','teal',(.25,.1,.2),(1,.6,.15),(0,0,.5))
    current.rotation_euler.z=-.16;current.keyframe_insert(data_path='rotation_euler',frame=1)
    current.rotation_euler.z=math.tau-.16;current.keyframe_insert(data_path='rotation_euler',frame=121)
    current.rotation_euler.z=-.16

bpy.ops.object.camera_add(location=(3,-5,3.7));camera=bpy.context.object;camera.name='InventoryIconCamera'
camera.rotation_euler=(Vector((0,0,.8))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=3;scene.camera=camera
scene.frame_set(1)
for kind,root in models.items():
    for other in models.values():
        for obj in other.children:obj.hide_render=other!=root
    scene.render.filepath=str(OUT/(kind+'.png'));bpy.ops.render.render(write_still=True)
    print('ICON_READY',kind,flush=True)
for i,root in enumerate(models.values()):
    for obj in root.children:obj.hide_render=False
    root.location=((i%5)*3.3,(i//5)*3.3,0)
scene.frame_end=120
camera.location=(9,-13,16);camera.rotation_euler=(Vector((6.6,3.3,.6))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=19
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE))
(OUT/'manifest.json').write_text(json.dumps({'source':str(SOURCE.relative_to(ROOT)).replace('\\','/'),'generator':'Blender '+bpy.app.version_string,'style':'cartoon 3D, transparent background','animatedSourceFrames':[1,121],'icons':list(models)},indent=2),encoding='utf8')
print('INVENTORY_STUDIO_COMPLETE',len(models),flush=True)
