"""Room-specific castle details, sharing the exact Blender/browser geometry."""
themes=[]
def theme(floor,name,kind):
    room=next(r for r in room_result['rooms'] if r['floor']==floor and r['name']==name)
    room['theme']=kind
    themes.append(dict(floor=floor,room=name,kind=kind))

theme(13,'Thư viện cổ','ancient-library')
for x in [8,11,14,17]:
    box('room-library-case',x,14.35,20.75,2.65,2.7,.65,'wood')
    for y in [.2,.85,1.5,2.15]:
        box('room-library-shelf',x,13+y,20.35,2.65,.09,.55,'gold',solid=False)
        for i in range(10):
            box('room-library-book',x-1.1+i*.24,13+y+.24,20.24,.16,.35+(i%3)*.05,.32,
                ['red','wood','gold','steel'][i%4],solid=False)
    for dx in [-1.25,1.25]:box('room-library-upright',x+dx,14.4,20.35,.12,2.8,.55,'gold',solid=False)

theme(9.5,'Bảo tàng giáp','armor-museum')
for x in [-17,-12]:
    for z in [8,14,19]:knight(x,z,base=9.5)
# Heraldic shields on the rear wall; no stand or collision in the aisle.
for x in [-17,-12,-7.5]:
    box('room-museum-banner',x,11.1,21.32,1.2,2.1,.08,'red',solid=False)
    box('room-museum-cross',x,11.1,21.24,.13,1.4,.05,'gold',solid=False)
    box('room-museum-cross',x,11.35,21.2,.8,.13,.05,'gold',solid=False)

theme(13,'Phòng ngủ của vua','royal-bedroom')
for x in [-17,-10]:
    box('room-royal-tapestry',x,15.25,-24.5,1.8,3.8,.1,'red',solid=False)
    for dx in [-.95,.95]:box('room-royal-tapestry-border',x+dx,15.25,-24.4,.1,3.8,.1,'gold',solid=False)
    box('room-royal-crest',x,15.7,-24.35,.9,.65,.08,'gold',solid=False)
    for dx in [-.36,0,.36]:box('room-royal-crown-point',x+dx,16.12,-24.35,.13,.3,.09,'gold',solid=False)

theme(1,'Hầm kho vàng','gold-vault')
for z in [-18.5,-15]:
    box('room-vault-rack',16,1.4,z,2.2,.8,1.5,'wood')
    parts[-1]['furniture']=True
    for level in range(3):
        for ix in range(4-level):
            for iz in range(3):
                box('room-vault-ingot',15.2+ix*.48+level*.24,1.88+level*.18,z-.5+iz*.43,.43,.16,.36,'gold',solid=False)
    box('room-vault-lock',16,1.5,z-.77,.2,.25,.06,'steel',solid=False)

# Recessed panels and repeated cornices visually distinguish masonry rooms
# from the bare floor plates. Decoration stays above walking height.
for r in room_result['rooms']:
    if r.get('corridor') or r['floor']<1:continue
    floor=r['floor'];x=(r['minX']+r['maxX'])/2
    z=r['maxZ']-.22
    box('room-wall-cornice',x,floor+2.65,z,r['maxX']-r['minX']-.6,.13,.12,'gold',solid=False)
    for dx in [-1.2,1.2]:
        box('room-heraldic-panel',x+dx,floor+1.65,z-.02,.65,.95,.08,'red',solid=False)
        box('room-heraldic-mark',x+dx,floor+1.65,z-.08,.1,.6,.04,'gold',solid=False)


# Wall decorations must not inherit a movable chair/table assembly.
for p in parts:
    if p['name'] not in ['furniture-portrait-frame','furniture-mirror-frame']:continue
    x,y,z=p['position'];floor=min([1,6,9.5,13,20],key=lambda f:abs(y-f-1.8))
    candidates=[r for r in room_result['rooms'] if r['floor']==floor and not r.get('corridor') and r['minX']<=x<=r['maxX']]
    if not candidates:continue
    r=min(candidates,key=lambda r:abs(max(r['minZ'],min(z,r['maxZ']))-z))
    prefix='furniture-portrait-' if 'portrait' in p['name'] else 'furniture-mirror-'
    target_x=r['minX']+2 if 'mirror' in p['name'] else r['maxX']-2
    dx=target_x-x
    dz=r['maxZ']-.24-z
    for art in parts:
        if art['name'].startswith(prefix) and abs(art['position'][0]-x)<.02 and abs(art['position'][2]-z)<.25 and abs(art['position'][1]-y)<.6:
            art['position'][0]+=dx;art['position'][2]+=dz;art['wallMounted']=True;art.pop('assembly',None)
            obj=bpy.data.objects.get(art.get('blenderObject',''))
            if obj:obj.location.x+=dx;obj.location.y-=dz
