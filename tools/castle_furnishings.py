"""Blender furniture library; executed by build_castle_extension.py.

References and room choices: docs/CASTLE_INTERIORS.md. Every assembly has one
simple walkable footprint, with legs and relief kept out of collision tests.
"""
furnishing_manifest = []

def item(kind,x,z,base,w,d,h):
    furnishing_manifest.append(dict(kind=kind,x=x,z=z,floor=base,width=w,depth=d))
    box('furniture-volume',x,base+h/2,z,w,h,d,'dark')
    parts[-1].update(collisionOnly=True,furniture=True)
    parts[-1]['assembly']=len(furnishing_manifest)-1
    bpy.context.object.hide_render=True
    bpy.context.object.hide_set(True)

def detail(name,x,y,z,w,h,d,mat='wood'):
    box('furniture-'+name,x,y,z,w,h,d,mat,solid=False)
    parts[-1]['assembly']=len(furnishing_manifest)-1

_sculpt_furniture=sculpt
def sculpt(*args,**kwargs):
    _sculpt_furniture(*args,**kwargs)
    parts[-1]['assembly']=len(furnishing_manifest)-1

def chair(x,z,floor):
    item('carved chair',x,z,floor,.8,.85,1.25)
    detail('seat',x,floor+.5,z,.8,.16,.8,'red')
    detail('chair-back',x,floor+.95,z+.35,.8,.8,.12,'wood')
    detail('chair-crest',x,floor+1.38,z+.35,.82,.1,.16,'gold')
    for dx in [-.29,.29]:
        for dz in [-.29,.29]: detail('leg',x+dx,floor+.23,z+dz,.09,.46,.09)

def table(x,z,floor,length=5):
    item('banquet table',x,z,floor,2.2,length,1)
    detail('tabletop',x,floor+.9,z,2.2,.2,length)
    detail('table-runner',x,floor+1.012,z,.72,.024,length-.2,'red')
    for dx in [-.88,.88]:
        for dz in [-length/2+.3,length/2-.3]:
            detail('table-leg',x+dx,floor+.4,z+dz,.15,.8,.15,'gold')
    for dz in [-1.5,0,1.5]:
        for dx in [-.7,.7]:
            sculpt('furniture-plate',x+dx,floor+1.04,z+dz,.48,.04,.48,'steel')
            sculpt('furniture-goblet',x+dx,floor+1.17,z+dz+.3,.12,.23,.12,'gold')
    for dz in [-1.4,1.4]:
        detail('candlestick',x,floor+1.22,z+dz,.08,.4,.08,'gold')
        sculpt('furniture-candle',x,floor+1.48,z+dz,.06,.17,.06,'glow','cone')

def cabinet(x,z,floor,width=2.4):
    item('library bookcase',x,z,floor,width,.65,2.3)
    detail('cabinet-back',x,floor+1.15,z+.25,width,2.3,.15)
    for dx in [-width/2,width/2]: detail('cabinet-side',x+dx,floor+1.15,z,.12,2.3,.65,'gold')
    for y in [.16,.8,1.45,2.1]:
        detail('shelf',x,floor+y,z,width,.09,.65)
        for i in range(7):
            detail('book',x-width*.39+i*width*.13,floor+y+.25,z-.12,.17,.42,.28,
                   ['red','steel','gold'][i%3])

def chest(x,z,floor):
    item('banded oak chest',x,z,floor,1.5,.9,.85)
    detail('chest',x,floor+.4,z,1.5,.8,.9)
    for dx in [-.5,.5]: detail('chest-band',x+dx,floor+.82,z,.1,.06,.94,'gold')
    detail('chest-lock',x,floor+.5,z-.46,.16,.2,.05,'gold')

def sofa(x,z,floor):
    item('gilt upholstered settee',x,z,floor,3,1.25,1.3)
    detail('sofa-seat',x,floor+.48,z,3,.32,1.2,'red')
    detail('sofa-back',x,floor+.95,z+.48,3,.75,.2,'red')
    for dx in [-1.45,1.45]: detail('sofa-arm',x+dx,floor+.7,z,.16,.5,1.3,'gold')
    for dx in [-1.2,1.2]:
        for dz in [-.4,.4]: detail('sofa-foot',x+dx,floor+.16,z+dz,.12,.32,.12,'gold')

def bed(x,z,floor):
    item('four-poster state bed',x,z,floor,3,4.2,.75)
    detail('bed-base',x,floor+.3,z,3,.6,4.2)
    detail('mattress',x,floor+.68,z,2.8,.25,4,'red')
    detail('blanket',x,floor+.82,z-.5,2.85,.08,2.5,'red')
    for dx in [-.7,.7]: detail('pillow',x+dx,floor+.87,z+1.25,1.1,.22,.65,'gold')
    for dx in [-1.4,1.4]:
        for dz in [-2,2]: detail('bed-post',x+dx,floor+1.35,z+dz,.12,2.7,.12,'gold')
    detail('canopy',x,floor+2.72,z,3.2,.12,4.4,'red')
    detail('headboard',x,floor+1.35,z+2,3,1.4,.15)

def portrait(x,z,floor):
    start=len(parts)
    detail('portrait-frame',x,floor+1.8,z,1.5,1.9,.15,'gold')
    detail('portrait-canvas',x,floor+1.8,z-.09,1.22,1.6,.05,'red')
    sculpt('furniture-portrait-head',x,floor+2.05,z-.14,.45,.55,.04,'gold')
    sculpt('furniture-portrait-bust',x,floor+1.5,z-.14,.85,.65,.04,'dark')
    for part in parts[start:]:part.pop('assembly',None)

def mirror(x,z,floor):
    start=len(parts)
    detail('mirror-frame',x,floor+1.5,z,1.6,2.4,.18,'gold')
    detail('mirror-glass',x,floor+1.5,z-.11,1.35,2.15,.04,'steel')

    for part in parts[start:]:part.pop('assembly',None)

# Hampton Court-style dining hall: paired tables, cloth runners, goblets and
# heraldic wall hangings; the entrance carpet remains a wide clear route.
for x in [-9,12]:
    table(x,-9,6)
    for dx in [-2.6,2.6]:
        for z in [-10.5,-7.5]: chair(x+dx,z,6)
for x in [-17,17]:
    cabinet(x,2,6)
    chest(x,8,6)
for x in [-12,12]:
    knight(x,-22,base=6)
    portrait(x,-24.4,6)

# The expanded intermediate floor becomes a populated reception gallery.
for x in [-12,12]:
    table(x,-9,9.5)
    for dx in [-2.6,2.6]:
        for z in [-10.5,-7.5]: chair(x+dx,z,9.5)
    sofa(x,2,9.5)
    cabinet(x,-23.5,9.5)
    mirror(x,-24.5,9.5)
    chest(x,19,9.5)
for x in [-4,4]: portrait(x,-24.5,9.5)

# Versailles-inspired bedroom and sitting areas on the throne floor, with
# bookcases in the eastern wing and Windsor-inspired armor displays.
bed(-14,-18,13)
chest(-17,-8,13)
cabinet(-17,3,13)
sofa(-12,-5,13)
sofa(-12,8,13)
for x in [9,13,17]:
    cabinet(x,-23.5,13)
    portrait(x,-24.5,13)
knight(-17,8,base=13)
knight(8,-22,base=13)
dragon_sword_table(4,-15,base=13)
for x in [-17,17]: mirror(x,-24.5,13)

# Attic: a study, spare bedding, reading chairs, storage and relic displays.
bed(-12,-13,20)
for x in [-15,-11,-7]: cabinet(x,19.5,20)
for x,z in [(8,-15),(11,-15),(8,-11),(11,-11),(-17,7),(-17,10)]: chest(x,z,20)
sofa(-12,7,20)
for x,z in [(7,-2),(10,-2),(-8,-2)]: chair(x,z,20)
dragon_sword_table(8.5,8,base=20)
knight(-15,13,base=20)
for x in [-9,9]: portrait(x,-19.8,20)

# Small balcony seating leaves the central door and its approach open.
for floor,z,xs in [(13,-28.5,[-5,5]),(20,-23.5,[-3.8,3.8])]:
    for x in xs: chair(x,z,floor)

# The lower levels already contain the authored armory and secret relic room.
# Additional storage stays against the edges, away from the stairs.
for x,z in [(-6,18),(16,-18)]: chest(x,z,1)
cabinet(-5,-3,-5,width=1.4)
