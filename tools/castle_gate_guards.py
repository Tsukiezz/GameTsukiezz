"""Two small royal gatekeepers. All geometry is authored and saved in Blender."""
for side in [-1,1]:
    gx,gz=side*3.05,-27.8
    floor=.35+(92.2-41.5)/53.5*5.65
    def guard_box(name,x,y,z,w,h,d,mat,arm=False):
        box('gatekeeper-'+name,gx+x,floor+y,gz+z,w,h,d,mat,solid=False)
        parts[-1].update(gatekeeper=side,guardArm=arm)
    for x in [-.105,.105]:
        guard_box('boot',x,.075,0,.15,.15,.22,'dark')
        guard_box('leg',x,.23,0,.12,.24,.14,'steel')
    guard_box('cape',0,.43,.13,.4,.42,.04,'red')
    guard_box('cuirass',0,.44,0,.35,.3,.22,'steel')
    guard_box('belt',0,.32,-.015,.37,.045,.24,'gold')
    guard_box('crest',0,.46,-.125,.07,.12,.025,'gold')
    guard_box('helmet',0,.7,0,.31,.26,.28,'steel')
    guard_box('visor',0,.715,-.147,.24,.045,.025,'dark')
    for x in [-.065,.065]:guard_box('eye',x,.715,-.165,.038,.018,.01,'glow')
    guard_box('plume',0,.89,.015,.06,.18,.15,'red')
    guard_box('shield-arm',-.23,.45,0,.12,.28,.12,'steel')
    guard_box('shield',-.25,.4,-.1,.2,.3,.05,'steel')
    guard_box('shield-cross',-.25,.4,-.133,.025,.2,.018,'gold')
    guard_box('opening-arm',.23,.43,0,.12,.3,.12,'steel',True)
    guard_box('glove',.23,.27,-.015,.13,.1,.13,'gold',True)
    guard_box('spear',-.34,.53,.015,.025,1.06,.025,'wood')
    guard_box('spear-head',-.34,1.1,.015,.06,.14,.06,'steel')
