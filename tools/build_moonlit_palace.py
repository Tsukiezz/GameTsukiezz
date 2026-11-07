"""Author the Moonveil island palace in Blender; export the evaluated game meshes.
All design coordinates below are game Y-up metres. No downloaded model dependencies.
"""
import bpy, math, json, random
from pathlib import Path
from mathutils import Vector, Matrix
R=Path(__file__).resolve().parents[1];OUT=R/'demo/features/castle/data/moonveil-palace.js';OUT.parent.mkdir(parents=True,exist_ok=True)
ART=R/'Assets/Art/Blender/Environments/MoonveilPalace.blend';ART.parent.mkdir(parents=True,exist_ok=True)
REPORT=R/'.runtime/moonveil';REPORT.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;random.seed(73)
palette={'stone':'536575','trim':'9babb5','roof':'173c4e','slate':'254e61','gold':'c5a364','wood':'49302d','oak':'73503d','velvet':'6c263d','rug':'54263d','glass':'ffc974','blueglass':'79bfd1','iron':'263946','silver':'93acb8','leaf':'345849','flower':'9c6c9a','paper':'d9c39a','water':'254e63','dark':'182732','flame':'ffb15d'}
mats={}
for k,h in palette.items():
 m=bpy.data.materials.new(k);m.use_nodes=True;rgb=tuple(int(h[i:i+2],16)/255 for i in (0,2,4));m.diffuse_color=(*rgb,1)
 bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=(*rgb,1);bs.inputs['Roughness'].default_value=.72
 if k in ('gold','silver','iron'):bs.inputs['Metallic'].default_value=.65
 if k in ('glass','blueglass','flame'):bs.inputs['Emission Color'].default_value=(*rgb,1);bs.inputs['Emission Strength'].default_value=1.4
 if k=='stone':
  noise=m.node_tree.nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=8;bump=m.node_tree.nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.22;m.node_tree.links.new(noise.outputs['Fac'],bump.inputs['Height']);m.node_tree.links.new(bump.outputs['Normal'],bs.inputs['Normal'])
 mats[k]=m
asset=bpy.data.collections.new('Moonveil_Palace_EDITABLE');scene.collection.children.link(asset)
zone='exterior';objects=[];solids=[];floors=[];stairs=[];doors=[];rooms=[]
def cv(p):return (p[0],-p[2],p[1])
def mesh(name,v,f,mat='stone',solid=False):
 d=bpy.data.meshes.new(name);d.from_pydata([cv(p) for p in v],[],f);d.update();o=bpy.data.objects.new(name,d);asset.objects.link(o);d.materials.append(mats[mat]);o['zone']=zone;o['material']=mat;objects.append(o);return o
def box(name,x,y,z,w,h,d,mat='stone',solid=False):
 v=[(x+a*w/2,y+b*h/2,z+c*d/2) for a,b,c in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
 o=mesh(name,v,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],mat)
 if solid:solids.append(dict(name=name,x=x,z=z,w=w,d=d,y0=y-h/2,y1=y+h/2))
 return o
def cylinder(name,x,y,z,r,h,mat='stone',r2=None,n=16):
 r2=r if r2 is None else r2;v=[(x+radius*math.cos(i*math.tau/n),y+dy,z+radius*math.sin(i*math.tau/n)) for radius,dy in [(r,-h/2),(r2,h/2)] for i in range(n)]
 f=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)];return mesh(name,v,f,mat)
def beam(name,a,b,r,mat='trim'):
 va,vb=Vector(cv(a)),Vector(cv(b));direction=vb-va;side=direction.cross(Vector((0,0,1)))
 if side.length<.001:side=direction.cross(Vector((1,0,0)))
 side.normalize();other=direction.normalized().cross(side);v=[]
 for p in [va,vb]:
  for i in range(6):v.append(tuple(p+(side*math.cos(i*math.tau/6)+other*math.sin(i*math.tau/6))*r))
 # This helper already has Blender coordinates.
 return mesh(name,[(p[0],p[2],-p[1]) for p in v],[(i,(i+1)%6,(i+1)%6+6,i+6) for i in range(6)],mat)
def arch(name,x,y,z,r,h,mat='trim',axis='x',thick=.15):
 pts=[]
 for i in range(25):
  u=-1+2*i/24;v=h*math.sqrt(max(0,1-((abs(u)+1)/2)**2))/math.sqrt(.75)
  pts.append((x+r*u,y+v,z) if axis=='x' else (x,y+v,z+r*u))
 for a,b in zip(pts,pts[1:]):beam(name,a,b,thick,mat)
def window(x,z,y=5,w=2,h=6,axis='x',blue=False):
 mat='blueglass' if blue else 'glass';r=w/2;spring=y+h*.65
 # Lancet glass, traceried frame, and small diamond tracery.
 v=[(x-r,y,z),(x+r,y,z),(x+r,spring,z),(x,spring+h*.35,z),(x-r,spring,z)] if axis=='x' else [(x,y,z-r),(x,y,z+r),(x,spring,z+r),(x,spring+h*.35,z),(x,spring,z-r)]
 mesh('Luminous lancet glass',v,[(0,1,2,3,4)],mat)
 arch('Pointed limestone archivolt',x,spring,z,r,h*.35,axis=axis,thick=.18)
 for s in [-1,0,1]:
  a=(x+s*r,y,z) if axis=='x' else (x,y,z+s*r);b=(a[0],spring,a[2]);beam('Window mullion',a,b,.085,'gold' if s==0 else 'trim')
 box('Window sill',x,y-.1,z,w+.6,.25,.5,'trim') if axis=='x' else box('Window sill',x,y-.1,z,.5,.25,w+.6,'trim')
def gable(x,z,w,d,y,rise):
 mesh('Steep slate roof',[(x-w/2,y,z-d/2),(x+w/2,y,z-d/2),(x,y+rise,z-d/2),(x-w/2,y,z+d/2),(x+w/2,y,z+d/2),(x,y+rise,z+d/2)],[(0,3,5,2),(1,2,5,4),(0,2,1),(3,4,5)],'roof')
 beam('Copper roof ridge',(x,y+rise,z-d/2),(x,y+rise,z+d/2),.18,'gold')
 for dz in range(int(-d/2)+2,int(d/2),5):
  for s in [-1,1]:beam('Standing roof seam',(x+s*w/2,y+.05,z+dz),(x,y+rise+.05,z+dz),.07,'slate')
def tower(x,z,r,height,base_y=0):
 start=len(objects)
 cylinder('Octagonal watchtower',x,height/2,z,r,height,n=16)
 for y in [1,height*.45,height-2,height]:cylinder('Tower carved cornice',x,y,z,r+.5,.55,'trim',n=16)
 cylinder('Overhanging tower crown',x,height+1,z,r+.65,2,'stone',n=16)
 cylinder('Needle slate spire',x,height+10,z,r+1,18,'roof',.12,n=16)
 cylinder('Spire gold finial',x,height+20,z,.15,3,'gold',.02,n=8)
 for a in range(0,360,90):
  rad=math.radians(a);xx=x+math.sin(rad)*(r+.04);zz=z+math.cos(rad)*(r+.04)
  window(xx,zz,height-7,1.7,5,'x' if a%180==0 else 'z')
 # Pennant and pole, with modeled folds.
 beam('Banner pole',(x,height+21,z),(x,height+26,z),.08,'gold')
 mesh('Burgundy pennant',[(x,height+25,z),(x+5,height+24.4,z+.4),(x+3.8,height+23,z),(x,height+23.2,z)],[(0,1,2,3)],'velvet')
 for o in objects[start:]:o.location.z+=base_y
 solids.append(dict(name='Solid tower',x=x,z=z,w=r*2,d=r*2,y0=base_y,y1=base_y+height))
def floor(name,x,z,w,d,y=0,mat='stone'):
 box(name,x,y-.3,z,w,.6,d,mat);floors.append(dict(name=name,x=x,z=z,w=w,d=d,y=y))
def wallx(x,z,w,y=0,h=14,door=False):
 if door:
  for s in [-1,1]:box('Door pier',x+s*(w/4+1.6),y+h/2,z,(w-6.4)/2,h,.8,solid=True)
  box('Door lintel',x,y+11,z,6.4,6,.8,solid=True);arch('Door pointed arch',x,y+5,z,3.2,3,thick=.22)
 else:box('Stone partition',x,y+h/2,z,w,h,.8,solid=True)
def partition_z(x,z,d,y=0):
 if d==68:
  for a,b in [(-42,-29),(-23,6),(12,26)]:box('Gallery doorway pier',x,y+7,(a+b)/2,.8,14,b-a,solid=True)
  for center in [-26,9]:box('Gallery doorway lintel',x,y+11,center,.8,6,6,solid=True);arch('Gallery arch',x,y+5,center,3,3,axis='z',thick=.2)
  return
 # One central six-metre opening connects each wing room to the gallery.
 for s in [-1,1]:box('Gallery doorway pier',x,y+7,z+s*(d/4+1.5),.8,14,(d-6)/2,solid=True)
 box('Gallery doorway lintel',x,y+11,z,.8,6,6,solid=True);arch('Gallery arch',x,y+5,z,3,3,axis='z',thick=.2)
def rug(x,z,w,d,y=0):
 box('Burgundy runner',x,y+.025,z,w,.05,d,'rug')
 for s in [-1,1]:box('Runner woven gold border',x+s*(w/2-.12),y+.057,z,.09,.015,d-.2,'gold')
def chair(x,z,y=0,royal=False):
 for a in [-.55,.55]:
  for b in [-.55,.55]:cylinder('Carved chair leg',x+a,y+.65,z+b,.1,1.3,'oak',n=8)
 box('Seat cushion',x,y+1.3,z,1.5,.3,1.5,'velvet');box('Carved high chair back',x,y+2.3,z-.65,1.5,2,.2,'oak');box('Upholstered chair back',x,y+2.3,z-.48,1.15,1.55,.13,'velvet')
 for s in [-1,1]:cylinder('Chair back finial',x+s*.7,y+3.4,z-.65,.12,.5,'gold',0,n=8)
def table(x,z,w=5,d=3,y=0):
 box('Polished oak tabletop',x,y+1.8,z,w,.28,d,'oak',solid=True)
 for a in [-1,1]:
  for b in [-1,1]:box('Turned table leg',x+a*(w/2-.4),y+.85,z+b*(d/2-.4),.25,1.7,.25,'wood')
def candle(x,z,y=2):
 cylinder('Brass candlestick',x,y+.1,z,.2,.2,'gold',n=8);cylinder('Ivory candle',x,y+.45,z,.09,.65,'paper',n=8);cylinder('Candle flame',x,y+.84,z,.09,.22,'flame',0,n=8)
def shelf(x,z,w=7,y=0):
 for a in [-1,1]:box('Library carved upright',x+a*w/2,y+2.8,z,.25,5.6,1.5,'wood',solid=True)
 for yy in [0,1.4,2.8,4.2,5.6]:box('Oak bookshelf',x,y+yy,z,w,.18,1.5,'oak')
 for row in range(4):
  xx=-w/2+.3
  while xx<w/2-.25:
   bw=random.uniform(.16,.37);bh=random.uniform(.65,1.1);box('Leather bound library volume',x+xx,y+row*1.4+.15+bh/2,z+.08,bw,bh,1.05,random.choice(['velvet','roof','oak','leaf','paper']));box('Book spine gilding',x+xx,y+row*1.4+.35,z+.62,bw*.8,.05,.02,'gold');xx+=bw+.05
def bed(x,z,y=0):
 box('Royal four poster bed base',x,y+.7,z,4,1.4,6,'wood',solid=True);box('Linen mattress',x,y+1.5,z,3.8,.5,5.7,'paper');box('Burgundy embroidered cover',x,y+1.8,z+1,3.9,.12,3.6,'velvet')
 for a in [-1,1]:
  for b in [-1,1]:cylinder('Carved canopy post',x+a*2,y+2.8,z+b*3,.12,5.6,'oak',n=12);cylinder('Canopy post finial',x+a*2,y+5.9,z+b*3,.22,.6,'gold',0)
 box('Canopy carved crown',x,y+5.7,z,4.6,.35,6.6,'wood')
 for a in [-1,1]:box('Hanging silk drape',x+a*1.9,y+3.5,z-2.7,.45,4.2,.3,'velvet');box('Silk pillow',x+a*.85,y+1.85,z-1.9,1.4,.32,.8,'paper')
 table(x+5,z-2,2,2,y);candle(x+5,z-2,y+2);box('Wardrobe cabinet',x-6,y+2.4,z,3,4.8,1.8,'wood',solid=True)
 for a in [-1,1]:box('Wardrobe recessed door',x-6+a*.7,y+2.4,z+.95,1.25,4.2,.12,'oak');cylinder('Wardrobe knob',x-6+a*.2,y+2.1,z+1.08,.08,.18,'gold',n=8)
 box('Gilded mirror frame',x+6,y+2.7,z+4,2.4,4.8,.25,'gold');box('Moonlit mirror',x+6,y+2.7,z+4.15,2.1,4.5,.05,'silver');chair(x-4,z+5,y);rug(x,z+3,8,10,y)
def chandelier(x,z,y=10):
 beam('Chandelier chain',(x,y+4,z),(x,y,z),.065,'iron')
 for i in range(12):
  a=i*math.tau/12;b=(i+1)*math.tau/12;beam('Forged chandelier ring',(x+2*math.cos(a),y,z+2*math.sin(a)),(x+2*math.cos(b),y,z+2*math.sin(b)),.095,'gold')
  if i%2==0:candle(x+2*math.cos(a),z+2*math.sin(a),y)
def room(name,x,z,w,d,y=0):
 global zone
 zone=name;rooms.append(dict(name=name,x=x,z=z,w=w,d=d,y=y));floor(name+' floor',x,z,w,d,y);rug(x,z,5,d-4,y)
 # Tall ribbed vaults across each room.
 for zz in [z-d*.32,z+d*.32]:arch('Ribbed Gothic vault',x,y+10,zz,w/2-1,3,thick=.18);beam('Vault wall pilaster',(x-w/2+1,y,zz),(x-w/2+1,y+10,zz),.24);beam('Vault wall pilaster',(x+w/2-1,y,zz),(x+w/2-1,y+10,zz),.24)
 chandelier(x,z,y+9)
 # Portraits, sconces and a carved chest provide human-scale detail.
 box('Portrait gilded frame',x+6,y+5,z-d/2+.55,3,4,.25,'gold');box('Portrait burgundy canvas',x+6,y+5,z-d/2+.7,2.7,3.7,.05,'velvet')
 cylinder('Portrait cameo',x+6,y+5.4,z-d/2+.78,.55,1,'paper',.35,n=12)
 box('Travel chest',x+w/2-4,y+.7,z+d/2-3,3,1.4,1.8,'wood',solid=True)
 for s in [-1,1]:box('Chest iron band',x+w/2-4+s*.95,y+.8,z+d/2-2.06,.18,1.4,.1,'gold')

# Massive island fortification: only the south gate interrupts its four walls.
floor('Courtyard',0,0,140,124)
for s in [-1,1]:
 box('East west curtain wall',s*69,8,0,2.8,16,124,solid=True)
 box('South gate curtain wall',s*38,8,61,62,16,2.8,solid=True)
box('Northern curtain wall',0,8,-61,140,16,2.8,solid=True)
for zz in [-61,61]:
 for x in range(-66,68,4):
  if zz==61 and abs(x)<9:continue
  box('Crenellated parapet',x,17,zz,2,2,3,'trim')
for xx in [-69,69]:
 for z in range(-58,61,4):box('Crenellated parapet',xx,17,z,3,2,2,'trim')
for s in [-1,1]:
 for z in [-40,-20,0,20,40]:
  box('Curtain wall buttress',s*70.8,7,z,2.2,14,3.5,'trim')
  window(s*70.1,z+7,5,1.1,4,'z',True)
 for x in [s*28,s*47]:
  box('Front wall buttress',x,7,62.5,2.2,14,2,'trim');window(x+s*7,62.5,5,1.4,5)
 for y in [2,12.5]:box('Curtain moulded string course',s*38,y,62.6,61,.3,.5,'trim')
for x,z,h,r in [(-65,57,28,6),(65,57,32,6),(-65,-57,39,7),(65,-57,43,7),(-13,59,26,4),(13,59,26,4)]:tower(x,z,r,h)
# Single operable portcullis exported separately, raising into the gatehouse.
zone='gate';box('Gate lintel',0,14,61,18,8,5,'stone');arch('Monumental gate arch',0,7,63,7,5,thick=.55)
zone='door';box('Oak portcullis',0,4,61,13,8,.6,'wood')
for x in range(-6,7):box('Forged portcullis bar',x,4,61.4,.12,8.4,.18,'iron')
for y in [1,3,5,7]:box('Gate iron strap',0,y,61.45,13,.16,.2,'iron')
zone='exterior';doors.append(dict(id='main',x=0,z=61,y=0,w=13,h=8))
# Stone viaduct: one continuous deck and Gothic side arches, not a second route.
floor('Only bridge',0,141,10,160,0,'trim')
for s in [-1,1]:
 box('Bridge stone balustrade',s*5.3,1,141,.6,2,160,'stone',solid=True)
 for z in range(72,218,18):
  box('Viaduct pier',s*4,-7,z,1.5,14,3.4,'stone');arch('Viaduct supporting arch',s*4,-5,z+9,8,4,axis='z',thick=.65)
  cylinder('Bridge lantern pedestal',s*5.3,1.6,z,.45,1.2,'trim');cylinder('Bridge lantern',s*5.3,2.6,z,.25,.8,'glass')
# Palace main envelope. Wings flank the long central throne hall.
zone='palace'
for s in [-1,1]:
 for z in [-38,-28,-18,-8,2,12,22]:
  box('Buttressed outer gallery',s*49,13,z,2,26,2,solid=True)
  for y in [0,14]:
   if y==14 and z==-38:continue
   window(s*49.1,z+4,y+3,3,7,'z',True)
 box('Outer wall lower sill',s*49,1.5,-8,1.5,3,70,solid=True)
 for center,depth in [(-40,6),(-1,56)]:box('Upper floor sill',s*49,15.5,center,1.5,3,depth,solid=True)
 arch('Upper gallery doorway',s*49.8,20,-33,3.8,4,axis='z',thick=.2)
 for y in [12,26]:box('Lancet window upper masonry',s*49,y,-8,1.5,4,70,solid=True)
 for x in [s*30]:
  gable(x,-8,39,76,28,13)
  for z in [-32,-8,16]:
   box('Dormer stone face',x,31,z,5,5,3,'stone');window(x,z+1.55,29,2.4,4);gable(x,z,6,5,33,4)
wallx(0,-43,100,h=28)
for s in [-1,1]:wallx(s*30,26,38,h=28)
for x in [-40,-28,-18,18,28,40]:
 for y in [3,17]:window(x,26.5,y,2.5,8)
wallx(0,26,24,h=28,door=True)
gable(0,-6,28,68,29,17)
for x,z,h,r in [(-49,-42,45,5),(49,-42,49,5),(-49,25,36,4),(49,25,37,4),(0,-41,64,5),(-13,25,46,3),(13,25,49,3)]:tower(x,z,r,h-28,28) if x==0 else tower(x,z,r,h)
# Facade rose window, radial gold tracery and heraldic balcony.
window(0,27,14,8,13)
for i in range(16):
 a=i*math.tau/16;beam('Rose window tracery',(0,22,27.2),(3.8*math.cos(a),22+3.8*math.sin(a),27.2),.08,'gold')
box('Entrance balcony cornice',0,13,28,17,.6,5,'trim')
for s in [-1,1]:box('Heraldic burgundy banner',s*9,18,27.1,2.5,8,.12,'velvet');box('Banner gold crest',s*9,18.4,27.2,.8,1.5,.06,'gold')
# Rooms and open, connected corridors. Upstairs has independent real floor slabs.
room('Grand throne hall',0,-8,23,68);rug(0,-8,6,62)
for s in [-1,1]:
 for z in [-30,-10,10]:
  cylinder('Great hall clustered column',s*10,6,z,.7,12,'trim');arch('Cross hall pointed vault',0,12,z,10,7,thick=.3)
 floor('Throne dais',0,-35,12,10,.6,'trim')
for y,z,w in [(.15,-29,10),(.3,-30,10),(.45,-31,10)]:floor('Throne steps',0,z,w,1,y)
chair(0,-36,.6,True);box('Throne carved aureole',0,4,-37,4.4,6,.4,'gold');box('Throne velvet inset',0,4,-36.7,3.7,5.3,.2,'velvet')
for s in [-1,1]:cylinder('Throne crown spire',s*2,7,-37,.22,3,'gold',0)
chandelier(0,-15,18);chandelier(0,8,18)
for s in [-1,1]:
 partition_z(s*12,-8,68)
 # The middle doorway and end openings all connect to the central hall.
 # Each wing has two rooms; a broad doorway connects them.
 wallx(s*30,-8,36,door=True)
 for y in [0,14]:
  partition_z(s*12,-8,68,y) if y else None
  floor('Upper wing gallery' if y else 'Wing floor',s*30,-8,36,68,y)
  if y:wallx(s*30,-8,36,y,door=True)
room('Moonlit library',-30,9,34,32);shelf(-39,23,13);shelf(-23,23,12);shelf(-39,-5,13)
for z in [2,13]:shelf(-45,z,4)
table(-29,9,9,5);chair(-29,13);chair(-33,13);candle(-30,9);candle(-26,9)
for i in range(9):box('Stacked manuscripts',-28,2.1+i*.12,9,1.6,.12,1.1,'paper')
cylinder('Armillary sphere pedestal',-19,1,-2,.6,2,'wood');cylinder('Celestial globe',-19,2.4,-2,1.1,1.7,'gold',.4)
room('Royal bedchamber',-30,-26,34,32);bed(-29,-28)
room('Banquet hall',30,9,34,32);table(30,9,7,18)
for x in [25,35]:
 for z in [2,7,12,17]:chair(x,z)
for z in [3,9,15]:candle(30,z);cylinder('Banquet silver platter',30,2.02,z+1,.65,.06,'silver')
box('Grand fireplace',43,3,1,7,6,2,'trim',solid=True);box('Fireplace dark opening',43,1.5,2.1,4,3,.15,'dark');box('Warm embers',43,.3,2.3,3,.1,1,'flame')
room('Royal baths',30,-26,34,32)
for x in [22,38]:
 box('Marble bath pedestal',x,.4,-26,8,.8,12,'trim',solid=True)
 for s in [-1,1]:box('Marble bathtub side',x+s*3.8,1.3,-26,.4,1.8,12,'trim');box('Marble bathtub end',x,1.3,-26+s*5.8,8,1.8,.4,'trim')
 box('Steaming blue bath water',x,1.6,-26,7.2,.08,11.2,'blueglass');table(x,-16,3,2);box('Folded bath linen',x,2.1,-16,2,.3,1,'paper')
room('Royal guest suite',-30,-26,34,32,14);bed(-29,-28,14)
room('Astronomer study',-30,9,34,32,14);table(-30,9,9,5,14);shelf(-30,23,24,14);chair(-30,13,14)
room('Council chamber',30,9,34,32,14);table(30,9,8,14,14)
for x in [24,36]:
 for z in [4,10,16]:chair(x,z,14)
room('Royal dressing chamber',30,-26,34,32,14);bed(29,-28,14)
# Exterior stairs run along both side galleries, rise 14m in 70m with landings.
zone='stairs'
for s in [-1,1]:
 for i in range(56):
  z=40-i*1.25;y=(i+1)*.25;box('Walkable stair tread',s*56,y/2,z,7,y,1.25,'trim');floors.append(dict(name='Stair tread',x=s*56,z=z,w=7,d=1.25,y=y))
 stairs.append(dict(x=s*56,z0=-29.4,z1=40.6,y0=14,y1=0,w=7))
 floor('Upper stair landing',s*56,-32,9,6,14);floor('Upper doorway connection',s*48,-32,10,5,14)
 for z in range(-28,42,4):
  y=(40-z)*.2;beam('Stone stair baluster',(s*60,y,z),(s*60,y+1.3,z),.12,'trim')
 beam('Continuous stair handrail',(s*60,1.3,41),(s*60,15.3,-29),.16,'gold')
# Real door openings into the upstairs rooms from both stair landings.
# Window wall is discontinuous at the northern end, leaving the landing passage.
zone='garden'
rooms.append(dict(name='Royal rose gardens',x=0,z=44,w=124,d=24,y=0))
for x in [-35,35]:
 for z in [39,51]:
  box('Raised garden limestone planter',x,.4,z,21,.8,7,'trim',solid=True);box('Rose garden soil',x,.83,z,20,.05,6,'dark')
  for i in range(16):
   xx=x+random.uniform(-9,9);zz=z+random.uniform(-2.5,2.5);cylinder('Clipped garden rose bush',xx,1.3,zz,.65,1.1,'leaf',.35,n=8);cylinder('Pale purple rose',xx,1.95,zz,.2,.25,'flower',0,n=6)
for x in [-30,30]:
 cylinder('Garden fountain basin',x,.35,31,3.5,.7,'trim');cylinder('Fountain water',x,.72,31,3.1,.05,'blueglass');cylinder('Fountain stem',x,1.5,31,.3,2,'gold');cylinder('Fountain upper bowl',x,2.5,31,1.3,.3,'trim',.7)
# Prison annex behind the palace, reached around either side, not through walls.
zone='prison';floor('Prison floor',0,-53,90,14)
rooms.append(dict(name='Northern prison and cells',x=0,z=-53,w=90,d=14,y=0));rooms.append(dict(name='Vaulted corridors',x=0,z=-45,w=110,d=4,y=0))
box('Prison back wall',0,3.5,-59,90,7,1,'stone',solid=True)
for x in [-36,-18,0,18,36]:
 box('Prison cell side',x-8,3.5,-53,.6,7,12,'stone',solid=True)
 for dx in [-7,-5,-3,3,5,7]:box('Prison iron bars',x+dx,2.5,-47,.1,5,.1,'iron',solid=True)
 box('Prison cell iron lintel',x,5,-47,16,.2,.25,'iron')
 box('Straw prison bed',x,0.5,-55,3,1,5,'oak',solid=True);cylinder('Prison bucket',x+5,.6,-55,.5,1.2,'iron',.6,n=10)
 # Five open cells are explorable from the rear gallery.
floor('Rear prison corridor',0,-45,100,4)
# Exactly two human sentries, sculpted plate armour with visors, tabards, shields.
for s in [-1,1]:
 zone='guard'+str(s);x=s*8.5;z=65
 for a in [-1,1]:
  box('Armoured boot',x+a*.3,.23,z+.1,.48,.46,.85,'iron',solid=False);cylinder('Greave',x+a*.3,.85,z,.23,1,'silver',.18,n=10)
 cylinder('Knight breastplate',x,1.85,z,.65,1.25,'silver',.48,n=10);box('Burgundy royal tabard',x,1.55,z+.47,.62,1.5,.08,'velvet');box('Golden heraldic cross',x,1.85,z+.53,.38,.09,.02,'gold');box('Golden heraldic cross',x,1.85,z+.53,.09,.5,.02,'gold')
 cylinder('Knight helmet',x,2.9,z,.39,.7,'silver',.31,n=12);box('Dark visor slit',x,2.95,z+.34,.54,.08,.08,'dark');beam('Helmet crest',(x,3.3,z-.3),(x,3.65,z+.3),.15,'velvet')
 for a in [-1,1]:cylinder('Knight pauldron',x+a*.7,2.3,z,.32,.5,'silver',.23,n=10);beam('Articulated arm',(x+a*.7,2.1,z),(x+a*.8,1.4,z+.1),.18,'silver')
 box('Heater shield',x-s*.85,1.35,z+.4,.9,1.4,.17,'roof');box('Shield gilt insignia',x-s*.85,1.35,z+.5,.1,.8,.04,'gold');beam('Sentry halberd shaft',(x+s*.95,0,z),(x+s*.95,3.8,z),.06,'oak');cylinder('Halberd spearhead',x+s*.95,4,z,.17,.6,'silver',0,n=6)

# Export all evaluated triangles, retaining sectors for culling and moving gate.
bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get();bins={}
for o in objects:
 ev=o.evaluated_get(deps);g=ev.to_mesh();g.calc_loop_triangles();mat=o['material'];key=(o['zone'],mat);b=bins.setdefault(key,dict(positions=[],normals=[],indices=[],lookup={}))
 for tri in g.loop_triangles:
  for li in tri.loops:
   p=o.matrix_world@g.vertices[g.loops[li].vertex_index].co;n=(o.matrix_world.to_3x3().inverted().transposed()@g.corner_normals[li].vector).normalized();v=tuple(round(q,4) for q in (p.x,p.z,-p.y));nn=tuple(round(q,4) for q in (n.x,n.z,-n.y));k=v+nn
   if k not in b['lookup']:b['lookup'][k]=len(b['positions'])//3;b['positions'].extend(v);b['normals'].extend(nn)
   b['indices'].append(b['lookup'][k])
 ev.to_mesh_clear()
parts=[]
for (sector,mat),b in bins.items():del b['lookup'];parts.append(dict(sector=sector,material=mat,**b))
data=dict(source=str(ART.relative_to(R)).replace('\\','/'),center=[0,8,450],upperDoorZ=-32,waterY=1.2,lakeRadius=185,islandRadius=105,channel=[[170,450],[225,420],[264,378]],palette=palette,parts=parts,solids=solids,floors=floors,stairs=stairs,doors=doors,rooms=rooms,triangles=sum(len(p['indices'])//3 for p in parts),sourceObjects=len(objects))
OUT.write_text('window.MOONVEIL_PALACE_DATA='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8')
(REPORT/'design.json').write_text(json.dumps({k:v for k,v in data.items() if k not in ['parts','floors','solids']},indent=2),encoding='utf8')
# Preview studio stays separate from exported, editable palace collection.
studio=bpy.data.collections.new('Preview_Only');scene.collection.children.link(studio)
def preview(o):
 for c in list(o.users_collection):c.objects.unlink(o)
 studio.objects.link(o);return o
bpy.ops.mesh.primitive_plane_add(size=1200,location=(0,0,-7));o=preview(bpy.context.object);o.data.materials.append(mats['water'])
bpy.ops.mesh.primitive_cone_add(vertices=64,radius1=104,radius2=94,depth=10,location=(0,0,-5));o=preview(bpy.context.object);o.data.materials.append(mats['dark'])
bpy.ops.object.camera_add(location=(188,-265,150));camera=preview(bpy.context.object);camera.rotation_euler=(Vector((0,0,21))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=280;scene.camera=camera
for p,power,size,color in [((70,-100,160),220000,110,(.6,.78,1)),((-100,-40,80),180000,90,(.52,.7,1)),((30,90,110),250000,100,(.95,.63,.35))]:
 bpy.ops.object.light_add(type='AREA',location=p);l=preview(bpy.context.object);l.data.energy=power;l.data.shape='DISK';l.data.size=size;l.data.color=color;l.rotation_euler=(Vector((0,0,15))-l.location).to_track_quat('-Z','Y').to_euler()
scene.world.color=(.12,.17,.23);scene.render.engine='CYCLES';scene.cycles.samples=20;scene.cycles.use_denoising=True;scene.render.resolution_x=1400;scene.render.resolution_y=1000;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='AgX'
scene.render.filepath=str(REPORT/'blender-exterior.png');bpy.ops.wm.save_as_mainfile(filepath=str(ART));bpy.ops.render.render(write_still=True)
print('MOONVEIL_READY',len(objects),'objects',data['triangles'],'triangles',len(parts),'draw groups',flush=True)
