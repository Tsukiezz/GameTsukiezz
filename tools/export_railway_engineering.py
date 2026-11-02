"""Build a separate Blender review scene from the tested browser route survey.

Shared exporter used by build_autumn_upgrade_review.py.
Standalone use requires an explicit new output path.
"""
import argparse, json, math
from pathlib import Path
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--source', type=Path)
parser.add_argument('--scene', default='RailwayJunctionsReviewed')
parser.add_argument('--prefix', default='Reviewed_')
parser.add_argument('--output', type=Path)
arguments=bpy.app.driver_namespace.get('railway_export_arguments')
if arguments is None:
    import sys
    arguments=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
source = arguments.source or ROOT/'demo/verification/autumn-upgrade/engineering.json'
if not source.is_file():
    raise RuntimeError('Run tools/tests/verify_autumn_upgrade.js to export the current scene first.')
if arguments.output is None:
    raise RuntimeError('Pass --output with a new file path, or use build_autumn_upgrade_review.py.')
if arguments.output.exists():
    raise RuntimeError('Inspect the existing output before replacing it.')
data = json.loads(source.read_text(encoding='utf-8'))
asset = (ROOT / 'demo/features/railway/data/railway-assets.js').read_text(encoding='utf-8')
templates = json.loads(asset[asset.index('{'):asset.rindex('}')+1])['models']
scene = bpy.data.scenes.new(arguments.scene)
bpy.context.window.scene = scene
materials = {}
for key, rgb in data['materials'].items():
    mat = bpy.data.materials.new('Civil_'+key)
    mat.diffuse_color = (*rgb, .22 if key == 'glass' else 1)
    materials[key] = mat
buffers = {}
section = 'Railway'

def emit(vertices, faces, material, origin=(0, 0, 0), yaw=0):
    v, f = buffers.setdefault((section,material), ([], []))
    offset = len(v)
    cs, sn = math.cos(yaw), math.sin(yaw)
    for x, y, z in vertices:
        v.append((origin[0]+x*cs+z*sn, -(origin[2]-x*sn+z*cs), origin[1]+y))
    f.extend(tuple(offset+i for i in face) for face in faces)

def box(cx, cy, cz, w, h, d, material, origin=(0, 0, 0), yaw=0, pitch=0):
    vertices = [(cx+x*w/2, cy+y*h/2, cz+z*d/2)
                for x,y,z in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
    if pitch:
        cp,sp=math.cos(pitch),math.sin(pitch)
        vertices=[(x,y*cp-z*sp,y*sp+z*cp) for x,y,z in vertices]
    emit(vertices, [(0,3,2,1),(4,5,6,7),(0,1,5,4),(3,7,6,2),(0,4,7,3),(1,2,6,5)], material, origin, yaw)

for path_index, path in enumerate(data['paths']):
    section=f'Track_{path_index:02d}'
    for i in range(0, len(path)-1, 2):
        a, b = Vector(path[i]), Vector(path[min(i+2, len(path)-1)])
        delta = b-a
        yaw = math.atan2(delta.x, delta.z)
        pitch=-math.atan2(delta.y,math.hypot(delta.x,delta.z))
        center = (a+b)/2
        for side in [-1, 1]:
            x = center.x+side*2.15*math.cos(yaw)
            z = center.z-side*2.15*math.sin(yaw)
            box(0,0,0,.18,.32,delta.length+.05,'steel',origin=(x,center.y,z),yaw=yaw,pitch=pitch)
        box(0,0,0,6,.35,.55,'wood',origin=(center.x,center.y-.28,center.z),yaw=yaw,pitch=pitch)
        if not data.get('bridgeSections') and i % 4 == 0 and data.get('bridgeFlags',[])[path_index][i]:
            box(0,0,0,7,.8,8,'stone',origin=(center.x,center.y-.7,center.z),yaw=yaw)
for span in data.get('bridgeSections',[]):
    section=f"Track_{span['pathIndex']:02d}"
    pitch,yaw=span['pitch'],span['yaw'];cp,sp,cy,sy=math.cos(pitch),math.sin(pitch),math.cos(yaw),math.sin(yaw)
    px,py,pz=span['position']
    for part in templates['bridge']:
        if not span['guards'] and part['name'].startswith(('BridgeGuard','BridgePost')):continue
        vertices=[]
        for x,y,z in part['vertices']:
            x*=span['widthScale'];yy=y*cp-z*sp;zz=y*sp+z*cp
            vertices.append((px+x*cy+zz*sy,py+yy,pz-x*sy+zz*cy))
        ids=part['indices'];emit(vertices,[ids[i:i+3] for i in range(0,len(ids),3)],part['material'])
for x,y,z in data.get('junctionDeckCells',[]):
    hub=min(data['junctions'],key=lambda j:(j['center'][0]-x)**2+(j['center'][2]-z)**2)
    section='Junction_'+hub['id']
    box(x,y,z,2.5,.8,2.5,'stone')
section='Bridge_Piers'
for pier in data['pillars']:
    x,y,z = pier['position']
    box(x,y,z,1.3,pier['height'],1.3,'stone')
for station in data['stations']:
    section='Station_'+station['name']
    origin, yaw = station['position'], station['yaw']
    for part in templates['station']:
        ids=part['indices']
        emit(part['vertices'], [ids[i:i+3] for i in range(0,len(ids),3)], part['material'], origin, yaw)
    box(14,.65,0,40,.14,96,'stone',origin,yaw)
    for kind in ['surfaces','solids']:
        for b in station['access'][kind]:
            box((b['minX']+b['maxX'])/2,(b['minY']+b['maxY'])/2,(b['minZ']+b['maxZ'])/2,
                b['maxX']-b['minX'],b['maxY']-b['minY'],b['maxZ']-b['minZ'],
                'stone' if kind=='surfaces' else 'gold', origin,yaw)
    ramp=station['access'].get('rampVertices',[])
    ids=station['access'].get('rampIndices',[])
    if ramp:
        emit([ramp[i:i+3] for i in range(0,len(ramp),3)],[ids[i:i+3] for i in range(0,len(ids),3)],'stone',origin,yaw)
for surface in data.get('groundSurfaces',[]):
    section='Ground_'+surface['name']
    mat=bpy.data.materials.new(section)
    mat.diffuse_color=(*surface.get('color',[.24,.29,.34]),1)
    materials[section]=mat
    verts=surface['vertices'];ids=surface['indices']
    emit([verts[i:i+3] for i in range(0,len(verts),3)],[ids[i:i+3] for i in range(0,len(ids),3)],section)
for train in data.get('trains',[]):
    for key,rgb in [('body',train['color']),('roof',train['roof']),('trim',train['trim'])]:
        name=train['id']+'_'+key;mat=bpy.data.materials.new(name);mat.diffuse_color=(*rgb,1);materials[name]=mat
    for car_index,car in enumerate(train['vehicles']):
        section=train['id']+('_Locomotive' if car_index==0 else '_Coach_'+str(car_index))
        parts=list(templates['engine' if car_index==0 else 'coach'])
        if car_index==0:
            parts += [dict(p,vertices=[(v[0],v[1]+1.9,v[2]-4) for v in p['vertices']]) for p in templates['driver']]
        cp,sp=math.cos(car['pitch']),math.sin(car['pitch'])
        for part in parts:
            material={'red':train['id']+'_body','roof':train['id']+'_roof','gold':train['id']+'_trim'}.get(part['material'],part['material'])
            verts=[(x,y*cp-z*sp,y*sp+z*cp) for x,y,z in part['vertices']];ids=part['indices']
            emit(verts,[ids[i:i+3] for i in range(0,len(ids),3)],material,car['position'],car['yaw'])
sections={}
for (label,material),(vertices,faces) in buffers.items():
    sections.setdefault(label,[]).extend(vertices)
roots={}
for label,vertices in sections.items():
    anchor=Vector(tuple((min(v[i] for v in vertices)+max(v[i] for v in vertices))/2 for i in range(3)))
    collection=bpy.data.collections.new(arguments.prefix+label);scene.collection.children.link(collection)
    root=bpy.data.objects.new(arguments.prefix+label,None);root.location=anchor;root.empty_display_size=3;root['railway_section']=label;collection.objects.link(root)
    roots[label]=(root,collection,anchor)
for (label,material),(vertices,faces) in buffers.items():
    root,collection,anchor=roots[label]
    mesh=bpy.data.meshes.new(label+'_'+material)
    mesh.from_pydata([Vector(v)-anchor for v in vertices],[],faces)
    mesh.materials.append(materials[material])
    obj=bpy.data.objects.new(arguments.prefix+label+'_'+material,mesh)
    collection.objects.link(obj);obj.parent=root
review_root=next((root for label,(root,_,_) in roots.items() if label.startswith('Junction_')),next(iter(roots.values()))[0])
camera_data=bpy.data.cameras.new('Junction_Review');camera=bpy.data.objects.new('Junction_Review',camera_data);scene.collection.objects.link(camera)
camera.location=review_root.location+Vector((115,-115,100));camera.rotation_euler=(review_root.location-camera.location).to_track_quat('-Z','Y').to_euler();camera_data.clip_end=5000;scene.camera=camera
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':
            area.spaces.active.clip_end=5000
            area.spaces.active.shading.color_type='MATERIAL'
            area.spaces.active.region_3d.view_location=review_root.location
            area.spaces.active.region_3d.view_distance=190
scene['source']='Browser-tested route, piers, stations and stair collision boxes; Y-up to Z-up.'
scene['note']='Review snapshot; live terrain-aware route is computed by railway-clearance.js.'
scene['service_lines']=json.dumps(data.get('services',[]))
output=arguments.output
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(output))
print('Railway engineering scene saved:', output)
