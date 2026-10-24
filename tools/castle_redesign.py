"""Final art pass executed inside Blender by the castle builder."""
import math

# Remove the narrow tunnel that concealed most of the old gate's two leaves.
removed=[p for p in parts if p['name'] in {'gate-throat-wall','gate-upper-closure'}]
parts[:]=[p for p in parts if p not in removed]
for obj in list(bpy.data.objects):
    if obj.name.split('.')[0] in {'gate-throat-wall','gate-upper-closure'}:
        bpy.data.objects.remove(obj,do_unlink=True)
# Portico jambs align to the existing seven-metre doorway. A recessed arch
# frames the doors while the full panel face remains visible from the bridge.
for side in [-1,1]:
    box('portal-jamb',side*3.75,8.9,-26.65,.5,5.8,.65)
    box('portal-pilaster',side*4.1,8.9,-27,.24,5.8,.26,'gold',solid=False)
    box('portal-base',side*3.75,6.2,-26.65,.8,.4,.9,'gold')
    box('portal-lantern-bracket',side*4.2,9.3,-27.1,.4,.12,.5,'gold',solid=False)
    sculpt('portal-lantern',side*4.2,9.65,-27.2,.35,.65,.35,'glow')
box('portal-lintel',0,11.65,-26.65,8,.3,.65,'gold')
for i in range(17):
    a=i*math.pi/16
    sculpt('portal-arch-stone',3.75*math.cos(a),11.8+1.1*math.sin(a),-26.65,
           .38,.32,.55,'stone')
# Silver-white moon seal and contrasting oak planks make both leaves readable.
for side in [-1,1]:
    for dx in [-1.3,-.65,0,.65,1.3]:
        box('gate-oak-plank',side*1.75+dx,8.75,-26.215,.035,5.1,.025,'gold',solid=False)
    sculpt('gate-moon-emblem',side*1.75,9.9,-26.36,.9,.9,.08,'steel')
    sculpt('gate-moon-emblem-inset',side*1.75+.19,10.04,-26.42,.68,.68,.06,'wood')

# Enclose the attic stair in the north-east library archive. The entrance is
# offset behind a screen; the corridor and both landings stay unobstructed.
box('archive-stair-screen',13.35,16.2,7.1,.32,6.4,11.2)
box('archive-stair-north',16.1,16.2,14.6,5.8,6.4,.32)
box('archive-entry-screen',16.2,14.2,-.25,4.5,2.4,.5,'wood')
for shelf in [13.35,14,14.7,15.4]:
    box('archive-bookcase-trim',13.13,shelf,6.5,.12,.09,9.4,'gold',solid=False)
    for z in range(3,11):
        box('archive-spines',13.08,shelf+.2,z,.18,.33,.4,'red',solid=False)

# Give basement props a single outline and reduce collision snags from their
# layered plinths. Keep a full metre of walking space next to partition doors.
for p in parts:
    if p['name']=='armory-plinth':
        p['furniture']=True

# A hand-modelled moon unicorn. The browser receives the exact exported meshes.
for key,color in {'pearl':(.86,.9,.97),'lilac':(.42,.18,.65),'aqua':(.12,.8,.85)}.items():
    mat=bpy.data.materials.new('Unicorn_'+key);mat.use_nodes=True
    shader=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    shader.inputs['Base Color'].default_value=(*color,1)
    shader.inputs['Roughness'].default_value=.32
    shader.inputs['Metallic'].default_value=.15
    materials[key]=mat
ux,uz,base=3,-18,6
def horse(name,x,y,z,w,h,d,mat='pearl',kind='sphere'):
    sculpt('unicorn-'+name,ux+x,base+y,uz+z,w,h,d,mat,kind)
horse('body',0,1.15,0,.92,.92,1.65)
horse('chest',0,1.26,-.55,.76,1.03,.7)
horse('neck',0,1.78,-.66,.55,1.18,.65)
horse('head',0,2.22,-.94,.55,.66,.78)
horse('muzzle',0,2.02,-1.36,.44,.35,.46)
horse('nose',0,2.04,-1.56,.32,.18,.06,'lilac')
for side in [-1,1]:
    horse('ear',side*.21,2.65,-.75,.17,.48,.22,'pearl','cone')
    horse('inner-ear',side*.21,2.67,-.84,.08,.29,.035,'lilac','cone')
    horse('eye',side*.27,2.26,-1.08,.06,.12,.13,'dark')
    horse('eye-glint',side*.3,2.29,-1.1,.025,.04,.04,'glow')
    for z in [-.56,.57]:
        horse('upper-leg',side*.29,.75,z,.22,.72,.25)
        horse('shin',side*.29,.36,z,.16,.52,.18)
        horse('gold-hoof',side*.29,.1,z-.025,.24,.2,.28,'gold')
horse('horn',0,2.9,-1.02,.19,.82,.19,'gold','cone')
for i in range(18):
    a=i*.95;r=.095*(1-i/21)
    horse('horn-spiral',r*math.cos(a),2.54+i*.035,-1.02+r*math.sin(a),.055,.055,.055,'aqua')
for i in range(9):
    horse('mane',0,2.4-i*.115,-.57+i*.04,.3,.24,.35,'lilac' if i%2 else 'aqua')
for i in range(7):
    horse('tail',.07*math.sin(i*.6),1.42-i*.14,.86+i*.06,.24,.3,.27,'lilac' if i%2 else 'aqua')
horse('forehead-gem',0,2.43,-1.26,.12,.19,.06,'aqua')
box('unicorn-collar',ux,base+1.61,uz-.75,.61,.1,.58,'gold',solid=False)

# Save the character as an independently reusable Blender collection.
unicorn_collection=bpy.data.collections.new('LunarUnicorn')
bpy.context.scene.collection.children.link(unicorn_collection)
for obj in list(bpy.context.scene.objects):
    if obj.name.startswith('unicorn-'):
        for collection in list(obj.users_collection): collection.objects.unlink(obj)
        unicorn_collection.objects.link(obj)
character_path=ROOT/'Assets/Art/Blender/Characters/LunarUnicorn.blend'
bpy.data.libraries.write(str(character_path),{unicorn_collection})

# Separate named collections make the authored source pleasant to edit.
for name,prefixes in [('Architecture',('room-','crypt-','floor-','landing-','mezzanine-','portal-','archive-')),
                      ('RoyalGate',('gate-',)),('Furnishings',('furniture-','armor-','armory-','dragon-'))]:
    collection=bpy.data.collections.new(name);bpy.context.scene.collection.children.link(collection)
    for obj in list(bpy.context.scene.objects):
        if obj.name.startswith(prefixes):
            for previous in list(obj.users_collection):previous.objects.unlink(obj)
            collection.objects.link(obj)
