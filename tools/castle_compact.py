"""Compact return stairs, clear room doors and an interactive prison asset set."""
import math

def discard(predicate):
    removed=[p for p in parts if predicate(p)]
    for p in removed:
        obj=bpy.data.objects.get(p.get('blenderObject',''))
        if obj:bpy.data.objects.remove(obj,do_unlink=True)
    parts[:]=[p for p in parts if not predicate(p)]

discard(lambda p:p['name'].startswith(('landing-','mezzanine-','upper-stairwell-','floor-seal-',
    'edge-guard-','crypt-tread-','crypt-rail-','archive-')))
stair_plans=[]
for side in [-1,1]:
    box('room-attic-front-seal',side*18.8,22.55,-20.5,1.7,5.1,1.5)
def u_stair(name,x,z,bottom,top,width=1.7):
    count=math.ceil((top-bottom)/.18/2)
    run=max(.28*count,2.8)
    gap=.3;landing=1.25;left=x-(width+gap)/2;right=x+(width+gap)/2
    mid=(bottom+top)/2;rise=(top-bottom)/(2*count);step_run=run/count
    flights=[]
    for lane,cx,direction,low in [(0,left,1,bottom),(1,right,-1,mid)]:
        start=z if direction==1 else z+run
        end=z+run if direction==1 else z
        flights.append(dict(name=name+'-'+str(lane),x=cx,z0=start,z1=end,bottom=low,top=low+rise*count,count=count,width=width))
        for i in range(count):
            y=low+(i+1)*rise;cz=start+direction*(i+.5)*step_run
            box(name+'-tread-'+str(lane)+'-'+str(i),cx,y-.11,cz,width,.22,step_run+.002,surface=True)
            box('compact-nosing',cx,y+.012,cz-direction*step_run/2,width,.024,.045,'gold',solid=False)
            for side in [-1,1]:
                box('compact-handrail',cx+side*(width/2+.04),y+.38,cz,.09,.12,step_run+.02,'gold')
                if i%3==0:box('compact-baluster',cx+side*(width/2+.04),y+.19,cz,.1,.38,.1,'steel',solid=False)
    full_width=width*2+gap
    box(name+'-landing',x,mid-.12,z+run+landing/2,full_width,.24,landing+.04,surface=True)
    for xx in [x-full_width/2-.04,x+full_width/2+.04]:
        box('compact-landing-rail',xx,mid+.25,z+run+landing/2,.1,.5,landing,'gold')
    box('compact-landing-rail',x,mid+.25,z+run+landing,full_width,.5,.1,'gold')
    plan=dict(name=name,x=x,z=z,width=full_width,depth=run+landing,bottom=bottom,top=top,flights=flights,
              hole=dict(minX=right-width/2-.12,maxX=right+width/2+.12,minZ=z-.12,maxZ=z+run+.12))
    stair_plans.append(plan)
    return plan

for bottom,top,x,z in [(1,6,-15.5,-18.4),(6,9.5,15.5,7),
                       (9.5,13,-15.5,-9),(13,20,15.5,-18.4)]:
    u_stair('compact-stair-'+str(bottom),x,z,bottom,top)
crypt_stair=u_stair('compact-crypt',-12.2,0,-5,1,width=1.65)

# Mark both arrival and departure rooms before relocating any furniture.
for room in room_result['rooms']:
    room['stairRoom']=any(room['floor'] in [p['bottom'],p['top']] and
        room['minX']<p['x']<room['maxX'] and room['minZ']<p['z']<room['maxZ']
        for p in stair_plans)

# Tall opaque screens conceal flights from the public doorway, with open
# approaches around both ends. No invisible door or interaction is required.
hidden_stairs=[]
for p in stair_plans:
    if p['bottom']<1:continue
    floor=p['bottom'];height={1:4.55,6:3.05,9.5:3.05,13:6.55}[floor]
    x=p['x']+(-2.7 if p['x']>0 else 2.7)
    z=p['z']+p['depth']/2;depth=p['depth']+1
    box('room-secret-screen',x,floor+height/2,z,.32,height,depth,'wood')
    face=x+(-.19 if x>0 else .19)
    for y in [.2,.95,1.7,2.45]:
        box('room-secret-shelf',face,floor+y,z,.28,.1,depth-.2,'gold',solid=False)
        for i in range(int((depth-.4)/.27)):
            box('room-secret-book',face,floor+y+.25,z-depth/2+.3+i*.27,.24,.4,.19,
                ['red','steel','wood','gold'][i%4],solid=False)
    room=next(r for r in room_result['rooms'] if r['floor']==floor and r['minX']<p['x']<r['maxX'] and r['minZ']<p['z']<r['maxZ'])
    room['hiddenStair']=p['name']
    hidden_stairs.append(dict(stair=p['name'],floor=floor,room=room['name'],
                              screen=[x,z],approach=[x,p['z']-.95]))

# Every floor plate is explicitly cut around its incoming flight only.
for floor in [1,6,9.5,13,20]:
    edge=18.4 if floor==1 else 19.6
    south=-20.4 if floor==1 else -19.75 if floor==20 else -26
    north=20.4 if floor==1 else 21.6
    incoming=next(p for p in stair_plans if p['top']==floor)
    h=incoming['hole'];a,b=h['minX'],h['maxX'];c,d=h['minZ'],h['maxZ']
    for label,x0,x1,z0,z1 in [('west',-edge,a,south,north),('east',b,edge,south,north),
                              ('south',a,b,south,c),('north',a,b,d,north)]:
        if x1>x0 and z1>z0:
            box('compact-floor-'+str(floor)+'-'+label,(x0+x1)/2,floor-.2,(z0+z1)/2,x1-x0,.4,z1-z0,surface=True)
    # Guard the upper hole perimeter; a single break at the return-flight exit.
    for xx in [a,b]:box('compact-hole-rail',xx,floor+.24,(c+d)/2,.1,.48,d-c,'gold')
    box('compact-hole-rail',(a+b)/2,floor+.24,d,b-a,.48,.1,'gold')

# Relocate each complete furniture assembly, never just its collision volume.
furniture_moves=[]
placed=[]
def overlaps(a,b,pad=.12):
    return a[0]<b[1]+pad and a[1]>b[0]-pad and a[2]<b[3]+pad and a[3]>b[2]-pad
for index,item in enumerate(furnishing_manifest):
    floor=item['floor'];w=item['width'];d=item['depth']
    candidates=[(item['x'],item['z'])]
    available=[r for r in room_result['rooms'] if r['floor']==floor and not r.get('corridor') and not r.get('stairRoom') and not r.get('prison')]
    # Keep balcony chairs in place unless their own footprint blocks the door.
    balcony=(floor in [13,20] and item['z']<(-26 if floor==13 else -20))
    for room in available:
        for x in [room['minX']+w/2+.65,(room['minX']+room['maxX'])/2,room['maxX']-w/2-.65]:
            z=room['minZ']+d/2+.65
            while z<=room['maxZ']-d/2-.65:
                candidates.append((x,z));z+=1
    chosen=None
    for x,z in candidates:
        rect=(x-w/2,x+w/2,z-d/2,z+d/2)
        if not balcony and not any(rect[0]>r['minX']+.4 and rect[1]<r['maxX']-.4 and rect[2]>r['minZ']+.4 and rect[3]<r['maxZ']-.4 for r in available):continue
        if any(c['floor']==floor and overlaps(rect,(c['minX'],c['maxX'],c['minZ'],c['maxZ'])) for c in room_result['door_clearances']):continue
        if any(y==floor and overlaps(rect,r,.35) for y,r in placed):continue
        themed={1:[(14.7,17.6,-19.6,-13)],9.5:[(-18.5,-10,6,21)],13:[(6.5,18.5,19.6,21.5)]}.get(floor,[])
        if any(overlaps(rect,r,.2) for r in themed):continue
        # Legacy monuments/bed and the eastern library fixtures stay in place.
        obstacles={1:[(-10,-6,-17.2,-14.8),(-8.3,-3.7,-1.5,1.5),(-9.5,-3.5,5.5,10.5),(2.5,9.5,8.5,15.5)],
                   6:[(-9.3,-6.7,-15.3,-12.7),(6.7,9.3,-15.3,-12.7)],
                   13:[(-5.5,5.5,14,22),(12,15,-6,-2),(17,19,-14,1)],20:[(-4,4,-4,4)]}.get(floor,[])
        if any(overlaps(rect,r,.3) for r in obstacles):continue
        chosen=(x,z,rect);break
    if chosen is None:raise RuntimeError('No clear furniture location: '+str(item))
    x,z,rect=chosen;dx=x-item['x'];dz=z-item['z']
    for part in parts:
        if part.get('assembly')==index:
            part['position'][0]+=dx;part['position'][2]+=dz
            obj=bpy.data.objects.get(part.get('blenderObject',''))
            if obj:obj.location.x+=dx;obj.location.y-=dz
    if dx or dz:furniture_moves.append(dict(kind=item['kind'],floor=floor,fromPosition=[item['x'],item['z']],toPosition=[x,z]))
    item.update(x=x,z=z);placed.append((floor,rect))

# Solid bars, one moving gate and a physically reachable control pedestal.
for a,b in [(8,12.2),(13.8,18)]:
    box('prison-fixed-volume',-7.8,-2.3,(a+b)/2,.16,5.4,b-a,'steel')
    parts[-1]['collisionOnly']=True
    bpy.data.objects[parts[-1]['blenderObject']].hide_render=True
    bpy.data.objects[parts[-1]['blenderObject']].hide_set(True)
    z=a
    while z<=b:
        box('prison-fixed-bar',-7.8,-2.3,z,.1,5.4,.1,'steel',solid=False);z+=.34
for z in [12.25,12.55,12.85,13.15,13.45,13.75]:
    box('prison-moving-bar',-7.8,-3.3,z,.1,3.4,.1,'steel',solid=False)
for y in [-4.85,-1.7]:box('prison-moving-crossbar',-7.8,y,13,.14,.14,1.65,'steel',solid=False)
box('prison-cell-bed',-4.5,-4.65,10,1.05,.7,2.4,'wood')
parts[-1]['furniture']=True
box('prison-bedroll',-4.5,-4.22,10,1,.15,2.3,'red',solid=False)
box('prison-bench',-4.3,-4.7,16.5,.9,.6,1.6,'wood')
parts[-1]['furniture']=True
box('prison-control-pedestal',-9.05,-4.48,10.2,.45,1.04,.45,'stone')
box('prison-control-button',-9.05,-3.9,10.2,.34,.12,.34,'glow',solid=False)
box('prison-emergency-button',-3.58,-3.85,13,.13,.3,.3,'glow',solid=False)
prison=dict(gate=dict(x=-7.8,z=13,width=.18,depth=1.65,bottom=-5,top=-1.55),
            control=[-9.05,-5,10.2],emergency=[-4.1,-5,13])

for name in ['CompactStaircases','Prison']:
    collection=bpy.data.collections.new(name);bpy.context.scene.collection.children.link(collection)
    for obj in list(bpy.context.scene.objects):
        selected=(obj.name.startswith('compact-') and not obj.name.startswith('compact-floor-')) if name=='CompactStaircases' else obj.name.startswith('prison-')
        if selected:
            for old in list(obj.users_collection):old.objects.unlink(obj)
            collection.objects.link(obj)
architecture=bpy.data.collections.get('Architecture')
for obj in list(bpy.context.scene.objects):
    if obj.name.startswith(('compact-floor-','room-attic-front-seal')):
        for old in list(obj.users_collection):old.objects.unlink(obj)
        architecture.objects.link(obj)
