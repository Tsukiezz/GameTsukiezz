"""Species-specific Blender forms, loaded by build_creature_studio.py."""
old_mammal=mammal
def fin(name,points,color):
    mesh=bpy.data.meshes.new(name);mesh.from_pydata([V(p) for p in points],[],[tuple(range(len(points)))]);mesh.materials.append(mat(color));o=bpy.data.objects.new(current+'_'+name,mesh);bpy.context.collection.objects.link(o);o['joint']='body';objects.append(o)
    solid=o.modifiers.new('Fin thickness','SOLIDIFY');solid.thickness=.025;bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.modifier_apply(modifier=solid.name);o.select_set(False)

def mammal(kind):
    if kind in ['dark_horse','unicorn','reindeer','speed_wolf','sabertooth']:
        source={'dark_horse':'horse','unicorn':'horse','reindeer':'deer','speed_wolf':'wolf','sabertooth':'cat'}[kind];mammal(source)
        if kind=='dark_horse':
            for o in objects:
                if any(s in o.name for s in ['Body','Head','Neck','Leg','Ear','Tail']):o.data.materials.clear();o.data.materials.append(mat('242333'))
            for i in range(8):add('FlamingMane',(0,1.12+i*.11,.3-i*.04),(.14,.22,.13),'9871d2')
            for s in [-1,1]:add('ArmoredFlank',(s*.3,.72,-.1),(.08,.26,.55),'46445e',cube=True);rod('ShadowHorn',(s*.13,1.4,.58),(s*.22,1.95,.28),.08,'b9a3e3',.004)
        if kind=='unicorn':rod('SpiralHorn',(0,1.53,.58),(0,2.18,.78),.1,'gold',.003);add('StarGem',(0,1.42,.75),(.08,.11,.04),'blue')
        if kind=='reindeer':
            add('Harness',(0,1.2,.1),(.57,.13,.7),'red');add('Bell',(0,.9,.9),(.16,.16,.13),'gold')
        if kind=='speed_wolf':
            for i in range(5):rod('WindCrest',(0,1.1-i*.08,.15-i*.2),(0,1.5-i*.1,-.15-i*.22),.13,'blue',.002)
        if kind=='sabertooth':
            for s in [-1,1]:
                rod('SaberFang',(s*.075,.42,.43),(s*.075,.05,.48),.04,'cream',.002)
                for i in range(4):add('TigerStripe',(s*.14,.31,(i-2)*.11),(.022,.13,.024),'253342')
        return
    old_mammal(kind)
    H={'rabbit':.45,'pig':.65,'horse':1.35,'cat':.6,'dog':.8,'goat':1.35,'doe':1.9,'deer':2.25,'bull':2.65,'buffalo':2.5,'elephant':3.2,'polar_bear':2.2,'wolf':1.4,'arena_beast':4.6}[kind]
    if kind in ['horse','goat','deer','doe']:
        add('LongNasalBridge',(0,H*.76,H*.64),(H*.12,H*.15,H*.26),'997052' if kind=='horse' else 'bc9872')
    if kind=='horse':
        for i in range(7):add('FlowingTail',(0,H*(.48-i*.045),-H*(.53+i*.015)),(H*.07,H*.09,H*.07),'dark')
    if kind=='goat':
        rod('ChinBeard',(0,H*.61,H*.65),(0,H*.39,H*.65),H*.075,'cream',.003)
        for s in [-1,1]:rod('BackSweptHorn',(s*H*.14,H*.94,H*.43),(s*H*.18,H*1.19,H*.12),H*.045,'brown',.002)
    if kind=='buffalo':
        for s in [-1,1]:rod('CrescentHorn',(s*.4,H*.86,.9),(s*1.45,H*.94,.65),.14,'dark',.05);rod('HookedTip',(s*1.45,H*.94,.65),(s*1.5,H*1.12,.85),.05,'cream',.003)
    if kind=='bull':add('ShoulderHump',(0,H*.65,-H*.2),(H*.31,H*.29,H*.25),'695b50');add('Dewlap',(0,H*.3,H*.42),(H*.1,H*.21,H*.16),'brown')
    if kind=='cat':
        for s in [-1,1]:
            fin('PointedCatEar',[(s*.05,.5,.19),(s*.15,.72,.16),(s*.2,.49,.19)],'8998a4')
            for i in range(3):rod('Whisker',(s*.07,.39,.35),(s*.3,.35+i*.035,.35),.004,'cream')
    if kind=='dog':
        for s in [-1,1]:add('FloppySpanielEar',(s*.21,.54,.24),(.09,.23,.1),'brown')
    if kind in ['wolf','arena_beast']:
        for s in [-1,1]:fin('TallWolfEar',[(s*H*.09,H*.85,H*.48),(s*H*.23,H*1.13,H*.42),(s*H*.29,H*.83,H*.43)],'dark')
    if kind=='rabbit':
        for s in [-1,1]:add('HindHaunch',(s*.12,.12,-.1),(.12,.14,.14),'dfd9cc');add('LongHindFoot',(s*.13,.04,.0),(.07,.04,.17),'cream')
    if kind=='pig':
        for i in range(12):add('CurlyTail',(.035*math.cos(i*.6),.29+.035*math.sin(i*.6),-.41-i*.003),(.013,.013,.013),'rose')
    if kind=='polar_bear':add('HeavyShoulders',(0,1.28,.35),(.69,.54,.61),'white');add('SmallRoundNose',(0,1.56,1.35),(.18,.12,.1),'dark')

def fish(kind):
    i=int(kind[-1]);coat=['98bed0','e8b767','6686bd','d28ca8','b5d6db','74a988'][i]
    w,h,length=[(.38,.45,1.65),(.7,.7,.95),(.25,1.25,.8),(.22,.95,.95),(.21,.22,2.2),(.65,.33,1.18)][i]
    add('FishBody',(0,0,0),(w,h,length),coat);add('Belly',(0,-h*.42,.12),(w*.86,h*.51,length*.7),'cream');eye(w*.55,h*.22,length*.89,min(.13,w*.28))
    add('Mouth',(0,-h*.12,length),(.09,.055,.04),'rose')
    tail=length+(.45 if i!=4 else .2)
    fin('ForkedTail',[(0,0,-length*.8),(0,h*1.45,-tail-.4),(0,0,-tail+.05),(0,-h*1.45,-tail-.4)],coat)
    for s in [-1,1]:fin('PectoralFin',[(s*w*.8,0,.2),(s*(w+.6),-.1,-.4),(s*w*.6,-h*.3,-.5)],'gold')
    fin('DorsalSail',[(0,h*.7,length*.4),(0,h*(2 if i==2 else 1.45),-.1),(0,h*.65,-length*.7)],coat)
    if i==2:fin('AngelAnalFin',[(0,-h*.6,.4),(0,-h*1.8,-.6),(0,-h*.5,-.7)],'blue')
    if i in [0,2,3]:
        for s in [-1,1]:
            for j in range(5):add('DistinctBand',(s*w*.94,0,(j-2)*length*.27),(.015,h*.79,.025),'59708b' if i!=3 else 'e9dbbc')
    if i==1:
        for s in [-1,1]:fin('FlowingGoldfishVeil',[(0,0,-.65),(s*.8,.45,-2.2),(s*.55,-.75,-2.1)],'d99b63')
    if i==4:
        for j in range(7):add('IceEelScute',(0,.2,(j-3)*.45),(.15,.09,.22),'blue')
    if i==5:
        for s in [-1,1]:rod('Barbel',(s*.13,-.1,1.1),(s*.48,-.28,1.45),.018,'cream')

old_benthic=benthic
def benthic(kind):
    old_benthic(kind)
    if kind=='river_glass_shrimp':
        for s in [-1,1]:rod('LongPrawnArm',(s*.12,.26,.3),(s*.45,.3,.9),.035,'blue');add('PrawnClaw',(s*.45,.3,.95),(.07,.06,.13),'blue')
        for i in range(5):rod('RostrumSpine',(0,.37,.35+i*.07),(0,.49,.39+i*.07),.025,'cream',.001)
    if kind=='river_moon_crab':
        add('GiantFiddlerClaw',(-.84,.52,.68),(.35,.28,.39),'blue');rod('ClawHook',(-.9,.62,.8),(-.74,.72,1.21),.12,'cream',.01)
        for s in [-1,1]:
            for i in range(4):rod('SpinyCarapace',(s*.4,.4,(i-1.5)*.18),(s*.64,.55,(i-1.5)*.24),.06,'cream',.001)
    if kind=='river_ice_snail':
        for o in objects:
            if 'Shell' in o.name:o.scale.z*=1.6
        rod('PointedIceShell',(0,.45,-.05),(0,1.08,-.18),.23,'blue',.015)

def dinosaur(kind):
    spino=kind=='spinosaurus';coat='698776' if spino else '936e54';h=5 if spino else 6
    add('HeavyTorso',(0,h*.49,-.4),(1.15,1.3,2.35),coat);add('Chest',(0,h*.57,1.1),(.9,1.2,1.2),coat)
    add('Neck',(0,h*.68,1.6),(.6,.9,.7),coat);add('Skull',(0,h*.82,2.4),(.65 if spino else 1.05,.56 if spino else .9,1.25 if spino else 1.05),coat)
    add('LowerJaw',(0,h*.75,2.65),(.52 if spino else .88,.2,1.15),'b5aa81');eye(.42 if spino else .7,h*.87,3.18,.12)
    for s in [-1,1]:
        for i in range(9):rod('InterlockingTeeth',(s*(.5 if spino else .83),h*.78,1.85+i*.21),(s*(.48 if spino else .8),h*.68,1.85+i*.21),.07,'cream',.003)
        key='leg'+str(len(joints)-1);joints[key]=[s*.83,2.45,-.85];add('Haunch',(s*.9,2.1,-.7),(.65,1.15,.78),coat,key);rod('Shin',(s*.9,1.5,-.45),(s*.93,.45,.04),.3,coat,.23,key);add('Foot',(s*.94,.25,.4),(.4,.23,.8),'dark',key)
        for j in range(3):rod('FootClaw',(s*.94+(j-1)*.24,.23,.8),(s*.94+(j-1)*.24,.16,1.2),.08,'cream',.005,key)
        rod('Forearm',(s*.85,3,1.1),(s*(1.4 if spino else 1),2.55,1.6),.2 if spino else .12,coat)
    for i in range(11):add('TaperedTail',(0,2.1-i*.12,-2-i*.48),(max(.06,.75-i*.06),max(.08,.65-i*.05),.58),coat)
    if spino:
        fin('HugeDorsalSail',[(0,3.4,1.6),(0,5.8,.4),(0,6.1,-1.1),(0,4.5,-2.6),(0,2.8,-3.3)],'b47964')
        for i in range(7):rod('SailRib',(0,3.3,1-i*.5),(0,5.9-abs(i-3)*.38,1-i*.5),.055,'d0ac7b')
    else:
        for i in range(10):add('DorsalScute',(0,3.3-i*.08,-.7-i*.35),(.15,.25,.24),'dark')

def zeus():
    add('BlueRoyalCape',(0,2.4,-.68),(1.25,1.65,.17),'536d96')
    add('Torso',(0,3,0),(1.05,1.35,.65),'cream');add('RoyalRobe',(0,1.35,0),(1.05,1.2,.72),'white');add('Belt',(0,2.1,0),(1.1,.15,.75),'gold')
    for i in range(9):rod('RobePleat',((i-4)*.2,.3,.65),((i-4)*.17,2,.65),.045,'c4c6d4')
    add('Head',(0,4.7,.08),(.67,.8,.61),'d2ad89');eye(.25,4.9,.62,.1)
    add('SilverHairCap',(0,5.18,-.14),(.71,.48,.62),'white');add('Nose',(0,4.8,.72),(.12,.16,.12),'d2ad89')
    for s in [-1,1]:
        for i in range(5):add('FlowingSilverHair',(s*(.56+math.sin(i*.6)*.08),5.12-i*.23,-.04),(.2,.22,.3),'white')
        rod('WhiteEyebrow',(s*.1,5.06,.64),(s*.39,5.1,.59),.045,'white')
    for i in range(5):
        width=.43-i*.075
        for s in [-1,0,1]:add('TaperedBeardCurl',(s*width*.55,4.47-i*.16,.61+i*.015),(max(.09,width*.55),.17,.18),'white')
    for s in [-1,1]:
        add('ShoulderArmor',(s*1,3.9,0),(.55,.35,.8),'gold');rod('Arm',(s*1,3.7,0),(s*1.65,2.9,.2),.32,'cream');add('Bracer',(s*1.55,3.05,.18),(.35,.38,.35),'gold')
        leg(s*.45,1,0,.28,'cream',len(joints)-1);add('Sandal',(s*.45,.14,.2),(.36,.14,.57),'gold')
        for i in range(5):add('LaurelLeaf',(s*(.59+math.sin(i*.6)*.1),5.33,.31-i*.17),(.13,.05,.1),'gold')
    rod('SwordHilt',(1.75,2.6,.25),(1.75,3.3,.25),.12,'gold');rod('SwordGuard',(1.2,3.25,.25),(2.3,3.25,.25),.09,'gold')
    fin('LightningBlade',[(1.5,3.3,.25),(1.9,4.55,.25),(1.67,4.5,.25),(2.15,6.2,.25),(1.96,4.05,.25),(2.1,4.15,.25),(1.95,3.3,.25)],'9bdce9');add('ThunderOrb',(-1.75,2.8,.25),(.36,.36,.36),'blue')

def legacy(kind):
    if kind in ['speed_wolf','sabertooth','unicorn','reindeer']:return mammal(kind)
    if kind=='monkey':
        add('Body',(0,.55,0),(.3,.42,.24),'brown');add('Face',(0,1.05,.1),(.33,.31,.28),'brown');add('FaceMask',(0,1.05,.32),(.26,.22,.07),'cream');eye(.12,1.11,.38,.045)
        for s in [-1,1]:add('RoundEar',(s*.34,1.1,.06),(.14,.15,.08),'rose');rod('LongArm',(s*.28,.79,0),(s*.48,.18,.13),.075,'brown');leg(s*.16,.44,-.03,.07,'brown',len(joints)-1,False)
        for i in range(16):add('CurledTail',(math.sin(i*.18)*.35,.4+i*.035,-.25-i*.06),(.055,.055,.075),'brown')
        add('RedRump',(0,.45,-.23),(.2,.17,.04),'red')
    elif kind=='turtle':
        add('Shell',(0,.45,0),(.65,.43,.8),'green');add('Plastron',(0,.16,0),(.56,.15,.7),'gold');add('Head',(0,.27,.88),(.23,.22,.3),'8eaa7d');eye(.11,.34,1.1,.05)
        for i in range(7):a=i*math.pi/3;add('HexagonalScute',(math.cos(a)*.34,.79-abs(math.cos(a))*.05,math.sin(a)*.41),(.2,.05,.24),'426c59')
        for s in [-1,1]:
            for z in [-.5,.5]:add('WebbedFlipper',(s*.6,.12,z),(.35,.07,.22),'8eaa7d')
    elif kind=='cobra':
        for i in range(22):a=i*.4;add('CoiledBody',(math.sin(a)*.55,.17+i*.008,math.cos(a)*.48),(.18,.18,.18),'6b8d62')
        rod('RaisedNeck',(0,.3,.3),(0,1.5,.4),.14,'6b8d62');add('SpectacledHood',(0,1.3,.35),(.52,.6,.15),'b99c59');add('Head',(0,1.77,.48),(.23,.19,.25),'green');eye(.11,1.8,.68,.045)
        for s in [-1,1]:add('HoodEyeMark',(s*.24,1.35,.51),(.11,.18,.02),'dark');rod('ForkedTongue',(0,1.72,.72),(s*.06,1.7,.97),.012,'red')
    elif kind=='spider':
        add('Abdomen',(0,.48,-.35),(.5,.39,.58),'453547');add('Thorax',(0,.39,.3),(.3,.28,.3),'6c4c68');eye(.13,.46,.55,.05)
        for s in [-1,1]:
            for i in range(4):rod('EightLegUpper',(s*.18,.4,(i-1.5)*.2),(s*.83,.7,(i-1.5)*.42),.045,'dark');rod('EightLegLower',(s*.83,.7,(i-1.5)*.42),(s*1.03,.04,(i-1.5)*.52),.035,'453547',.012)
            rod('VenomFang',(s*.1,.28,.5),(s*.15,.14,.76),.055,'gold',.001)
        add('HourglassMark',(0,.83,-.4),(.15,.025,.23),'red')
    elif kind=='sapling':
        add('BarkTorso',(0,.65,0),(.25,.62,.25),'brown');add('LeafCrown',(0,1.5,0),(.64,.5,.5),'green');eye(.13,.98,.27,.055)
        for s in [-1,1]:rod('BranchArm',(s*.2,.85,0),(s*.7,1.2,0),.09,'brown',.03);rod('Twig',(s*.6,1.15,0),(s*.74,1.5,.02),.035,'brown',.005);leg(s*.17,.35,0,.09,'brown',len(joints)-1,False)
    elif kind=='stone_worm':
        for i in range(9):add('RockSegment',(0,.5+i*.42,-i*.14),(.8-i*.035,.35,.65),'777b82')
        add('Maw',(0,3.9,-.85),(.65,.7,.15),'dark')
        for i in range(14):a=i*math.tau/14;rod('MawTooth',(math.cos(a)*.58,3.9+math.sin(a)*.62,-.68),(math.cos(a)*.37,3.9+math.sin(a)*.39,-.4),.09,'cream',.002)
    elif kind=='cursed_warrior':
        monster('robot')
        add('Helmet',(0,1.46,0),(.39,.31,.34),'dark',cube=True);add('CursedVisor',(0,1.45,.35),(.22,.04,.03),'red');rod('Sword',( .55,.6,.1),(.55,1.6,.1),.07,'blue',.005);add('Shield',(-.48,.75,.22),(.23,.38,.07),'gold',cube=True)

extra_species=['dark_horse','spinosaurus','trex','zeus','speed_wolf','sabertooth','unicorn','reindeer','monkey','turtle','cobra','spider','sapling','stone_worm','cursed_warrior']
