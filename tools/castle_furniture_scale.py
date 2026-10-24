"""Furniture measured against the 0.65 m playable hero, not full-size humans."""
SCALE=.525  # 1.5 times the previous hero-sized furniture.
ENLARGE=1.5

def resize(p,anchor,factor):
    old=p['position'][:]
    p['position']=[a+(v-a)*factor for a,v in zip(anchor,old)]
    p['size']=[v*factor for v in p['size']]
    if p.get('vertices'):p['vertices']=[[v*factor for v in vertex] for vertex in p['vertices']]
    obj=bpy.data.objects.get(p.get('blenderObject',''))
    if obj:
        x,y,z=p['position'];obj.location=(x,-z,y)
        obj.scale=tuple(v*factor for v in obj.scale)
    p['heroScale']=factor

# Whole assemblies retain the relation between seats, legs, plates and colliders.
original_manifest=list(furnishing_manifest)
for p in parts:
    index=p.get('assembly')
    if index is not None and index<len(original_manifest):
        item=original_manifest[index]
        resize(p,[item['x'],item['floor'],item['z']],SCALE)
for item in furnishing_manifest:
    item['width']*=SCALE;item['depth']*=SCALE;item['heroScale']=SCALE

# Independent exhibits and fixtures predate the assembly manifest.
exhibits=[(p['name'],p['position'][:],p['size'][:]) for p in parts
          if p['name'] in ['armory-display-volume','dragon-table-base-volume']]
for p in parts:
    if p.get('heroScale'):continue
    name=p['name'];anchor=None;factor=SCALE
    if name.startswith(('armor-','armory-','dragon-')):
        kind='armory-display-volume' if name.startswith(('armor-','armory-')) else 'dragon-table-base-volume'
        choices=[(pos,size) for n,pos,size in exhibits if n==kind and pos[1]-size[1]/2<=p['position'][1]+.01 and p['position'][1]-(pos[1]-size[1]/2)<4.1]
        if choices:
            pos,size=min(choices,key=lambda v:sum((a-b)**2 for a,b in zip(v[0],p['position'])))
            anchor=[pos[0],pos[1]-size[1]/2,pos[2]];factor=.375
    elif name.startswith('room-library-'):
        x=min([8,11,14,17],key=lambda x:abs(x-p['position'][0]));anchor=[x,13,20.75]
    elif name.startswith('room-vault-'):
        z=min([-18.5,-15],key=lambda z:abs(z-p['position'][2]));anchor=[16,1,z]
    elif name in ['prison-cell-bed','prison-bedroll']:anchor=[-4.5,-5,10]
    elif name=='prison-bench':anchor=[-4.3,-5,16.5]
    elif name.startswith(('furniture-portrait-','furniture-mirror-','room-detail-torch','room-detail-frame','room-detail-painting')):
        x,y,z=p['position'];floor=max(f for f in [-5,1,6,9.5,13,20] if f<y)
        rooms=[r for r in room_result['rooms'] if r['floor']==floor and not r.get('corridor') and r['minX']-.1<=x<=r['maxX']+.1]
        r=min(rooms,key=lambda r:abs(r['maxZ']-z)) if rooms else None
        anchor=[x,floor,r['maxZ']-.24 if r else z]
    if anchor:resize(p,anchor,factor)

def overlaps(a,b,pad=.18):
    return a[0]<b[1]+pad and a[1]>b[0]-pad and a[2]<b[3]+pad and a[3]>b[2]-pad

def free_position(room,w,d):
    floor=room['floor']
    # A perimeter grid fills the room rather than piling props at one corner.
    candidates=[]
    for z in [room['minZ']+1.1,room['maxZ']-1.1,room['minZ']+2.5,room['maxZ']-2.5]:
        x=room['minX']+1.15
        while x<room['maxX']-1:
            candidates.append((x,z));x+=1.25
    for x,z in candidates:
        rect=(x-w/2,x+w/2,z-d/2,z+d/2)
        if rect[0]<=room['minX']+.4 or rect[1]>=room['maxX']-.4 or rect[2]<=room['minZ']+.4 or rect[3]>=room['maxZ']-.4:continue
        if any(c['floor']==floor and overlaps(rect,(c['minX'],c['maxX'],c['minZ'],c['maxZ']),.15) for c in room_result['door_clearances']):continue
        if any(p['bottom']<=floor<=p['top'] and overlaps(rect,(p['x']-p['width']/2,p['x']+p['width']/2,p['z']-.9,p['z']+p['depth']),.7) for p in compact['stair_plans']):continue
        blocked=False
        for p in parts:
            if not p['solid'] or p.get('surface'):continue
            px,py,pz=p['position'];pw,ph,pd=p['size']
            if py-ph/2>=floor+.65 or py+ph/2<=floor+.02:continue
            if overlaps(rect,(px-pw/2,px+pw/2,pz-pd/2,pz+pd/2),.22):blocked=True;break
        if not blocked:return x,z
    return None

def prop(name,x,y,z,w,h,d,mat='wood'):
    box('room-mini-'+name,x,y,z,w,h,d,mat,solid=False)
    resize(parts[-1],mini_anchor,ENLARGE)

for room in room_result['rooms']:
    if room.get('corridor'):continue
    floor=room['floor'];library=room.get('theme') in ['ancient-library','library']
    bedroom=any(word in room['name'] for word in ['ngủ','hoàng hậu','trú ẩn'])
    kinds=['bookcase','bookcase','desk','chair','chair','chest','bench','cabinet'] if library else ['table','chair','chair','cabinet','chest','bench','chair','table']
    if bedroom:kinds=['bed','bedside','chair','chest','cabinet','bench','table','chair']
    if room.get('prison'):kinds=['bedside','chest','bench','table']
    room['newFurniture']=[]
    for kind in kinds:
        w,d,h={'chair':(.38,.4,.58),'table':(.9,.65,.4),'desk':(.85,.55,.4),
            'bookcase':(.85,.28,.85),'cabinet':(.65,.3,.7),'chest':(.55,.35,.3),
            'bench':(.8,.35,.3),'bed':(.7,1.35,.3),'bedside':(.35,.35,.32)}[kind]
        place=free_position(room,w*ENLARGE,d*ENLARGE)
        if not place:continue
        x,z=place
        mini_anchor=[x,floor,z]
        box('furniture-volume',x,floor+h/2,z,w,h,d,'dark')
        parts[-1].update(collisionOnly=True,furniture=True,heroScale=1)
        resize(parts[-1],mini_anchor,ENLARGE)
        obj=bpy.data.objects[parts[-1]['blenderObject']];obj.hide_render=True;obj.hide_set(True)
        furnishing_manifest.append(dict(kind=kind,x=x,z=z,floor=floor,width=w*ENLARGE,depth=d*ENLARGE,room=room['name'],heroScale=ENLARGE))
        room['newFurniture'].append(kind)
        if kind in ['table','desk','bedside','bench','chair']:
            top=.23 if kind=='chair' else h-.04
            prop(kind+'-top',x,floor+top,z,w,.08,d,'red' if kind in ['chair','bench'] else 'wood')
            for dx in [-w*.36,w*.36]:
                for dz in [-d*.33,d*.33]:prop('leg',x+dx,floor+top/2,z+dz,.045,top,.045,'gold')
            if kind=='chair':prop('chair-back',x,floor+.4,z+d*.42,w,.36,.055,'wood')
            if kind in ['table','desk']:
                prop('table-runner',x,floor+h+.01,z,w*.3,.02,d*.95,'red')
                for dx in [-.23,.23]:
                    prop('plate',x+dx,floor+h+.04,z,.15,.02,.15,'steel')
                    prop('cup',x+dx,floor+h+.09,z+.12,.055,.1,.055,'gold')
        elif kind in ['bookcase','cabinet']:
            prop(kind+'-back',x,floor+h/2,z+d*.42,w,h,.04)
            for dx in [-w*.47,w*.47]:prop('case-side',x+dx,floor+h/2,z,.04,h,d,'gold')
            for y in [.04,h*.36,h*.67,h-.04]:
                prop('shelf',x,floor+y,z,w,.035,d)
                if y<h-.1:
                    for i in range(5):prop('book',x-w*.33+i*w*.16,floor+y+.09,z-.03,.07,.15,.15,['red','steel','gold'][i%3])
        elif kind=='bed':
            prop('bed-base',x,floor+.13,z,w,.26,d)
            prop('bed-quilt',x,floor+.29,z,w*.96,.09,d*.95,'red')
            prop('pillow',x,floor+.36,z+d*.32,w*.7,.1,d*.2,'gold')
            prop('headboard',x,floor+.3,z+d*.48,w,.6,.06,'wood')
        else:
            prop('chest',x,floor+h/2,z,w,h,d,'wood')
            for dx in [-w*.3,w*.3]:prop('chest-band',x+dx,floor+h+.012,z,.04,.025,d,'gold')
            prop('lock',x,floor+h*.6,z-d*.51,.07,.08,.025,'gold')
    if len(room['newFurniture'])<4:raise RuntimeError('Room too crowded: '+room['name'])
