"""Function-specific furnishings. Runs after room layout and relocation."""
import math

for room in room_result['rooms']:
    if room['name']=='Phòng trà' and room['floor']==9.5:
        room['name']='Phòng khiêu vũ';room['theme']='ballroom'
        themes.append(dict(floor=room['floor'],room=room['name'],kind='ballroom'))
        for c in room_result['door_clearances']:
            if c['floor']==9.5 and c['room']=='Phòng trà':c['room']=room['name']

def decoration(name,x,y,z,w,h,d,mat='wood'):
    box('room-detail-'+name,x,y,z,w,h,d,mat,solid=False)
    parts[-1]['wallMounted']=name.startswith(('torch','painting','frame'))

def footprint(room,w,d,h):
    floor=room['floor']
    # Reserve the entire doorway apron and every compact stair envelope.
    for x in [room['minX']+w/2+.65,room['maxX']-w/2-.65]:
        for z in [room['maxZ']-d/2-.8,room['minZ']+d/2+.8]:
            rect=(x-w/2,x+w/2,z-d/2,z+d/2)
            def hit(a,b,pad=.3):return a[0]<b[1]+pad and a[1]>b[0]-pad and a[2]<b[3]+pad and a[3]>b[2]-pad
            if any(c['floor']==floor and hit(rect,(c['minX'],c['maxX'],c['minZ'],c['maxZ']),.15) for c in room_result['door_clearances']):continue
            if any(p['bottom']<=floor<=p['top'] and hit(rect,(p['x']-p['width']/2,p['x']+p['width']/2,p['z']-.9,p['z']+p['depth']),.7) for p in compact['stair_plans']):continue
            blocked=False
            for p in parts:
                if not p['solid'] or p.get('surface'):continue
                px,py,pz=p['position'];pw,ph,pd=p['size']
                if py-ph/2>=floor+.65 or py+ph/2<=floor+.02:continue
                if hit(rect,(px-pw/2,px+pw/2,pz-pd/2,pz+pd/2)):
                    blocked=True;break
            if not blocked:
                box('furniture-volume',x,floor+h/2,z,w,h,d,'dark')
                parts[-1].update(collisionOnly=True,furniture=True,assembly=len(furnishing_manifest))
                obj=bpy.data.objects[parts[-1]['blenderObject']];obj.hide_render=True;obj.hide_set(True)
                furnishing_manifest.append(dict(kind=room.get('theme','room')+' furnishing',x=x,z=z,floor=floor,width=w,depth=d))
                return x,z
    return None

for room in room_result['rooms']:
    if room.get('corridor') or room.get('prison') or room['floor']<1:continue
    floor=room['floor'];cx=(room['minX']+room['maxX'])/2;z=room['maxZ']-.25
    # All frames attach to a real wall, above the walking capsule.
    decoration('frame',cx,floor+1.65,z,1.7,1.15,.12,'gold')
    decoration('painting-sky',cx,floor+1.65,z-.08,1.48,.95,.035,'steel')
    decoration('painting-hills',cx,floor+1.45,z-.11,1.42,.4,.025,'dark')
    decoration('painting-moon',cx+.35,floor+1.85,z-.13,.2,.2,.025,'gold')
    for dx in [-2.15,2.15]:
        x=cx+dx
        decoration('torch-bracket',x,floor+1.7,z-.12,.15,.12,.3,'steel')
        decoration('torch-handle',x,floor+1.9,z-.3,.09,.5,.09,'wood')
        decoration('torch-cup',x,floor+2.15,z-.3,.25,.18,.25,'gold')
        decoration('torch-flame',x,floor+2.4,z-.3,.16,.38,.16,'glow')
    name=room['name']
    library=any(s in name for s in ['Thư viện','sách','đọc','nghiên cứu'])
    dining=any(s in name for s in ['ăn','tiệc','khách','khiêu vũ'])
    room.setdefault('theme','library' if library else 'dining' if dining else 'furnished-room')
    if not any(t['floor']==floor and t['room']==name for t in themes):themes.append(dict(floor=floor,room=name,kind=room['theme']))
    furniture_start=len(parts)
    place=footprint(room,2.2,.8,2.3 if library else .95)
    if not place:continue
    x,z0=place
    if library:
        decoration('bookcase-back',x,floor+1.15,z0+.3,2.2,2.3,.12)
        for dx in [-1.05,1.05]:decoration('bookcase-post',x+dx,floor+1.15,z0,.12,2.3,.8,'gold')
        for y in [.15,.85,1.55,2.25]:
            decoration('bookshelf',x,floor+y,z0,2.2,.09,.75)
            if y<2:
                for i in range(9):decoration('book',x-.85+i*.21,floor+y+.27,z0-.12,.16,.42,.3,['red','gold','steel'][i%3])
    else:
        decoration('console-top',x,floor+.85,z0,2.2,.18,.8)
        for dx in [-.9,.9]:
            for dz in [-.25,.25]:decoration('console-leg',x+dx,floor+.4,z0+dz,.12,.8,.12,'gold')
        if dining:
            for dx in [-.6,0,.6]:
                decoration('plate',x+dx,floor+.96,z0,.4,.035,.35,'steel')
                decoration('goblet',x+dx,floor+1.07,z0+.2,.12,.22,.12,'gold')
        else:
            decoration('keepsake-chest',x,floor+1.1,z0,.65,.35,.4,'red')
            decoration('chest-lock',x,floor+1.1,z0-.22,.12,.14,.05,'gold')
    for p in parts[furniture_start:]:p['assembly']=len(furnishing_manifest)-1
    if room.get('theme')=='ballroom':
        # Keep the middle open for dancing; only a thin inlaid floor medallion.
        for i in range(28):
            a=i*math.pi*2/28
            decoration('ballroom-inlay',cx+math.cos(a)*2.2,floor+.012,(room['minZ']+room['maxZ'])/2+math.sin(a)*2.2,.2,.02,.2,'gold')

remove_names={'furniture-portrait-head','furniture-portrait-bust','room-detail-painting-hills','room-detail-painting-moon'}
for p in list(parts):
    if p['name'] in remove_names:
        obj=bpy.data.objects.get(p.get('blenderObject',''))
        if obj:bpy.data.objects.remove(obj,do_unlink=True)
        parts.remove(p)
