"""One entrance per room with reserved door approaches."""
rooms=[]
wall_count=0
door_clearances=[]
def wall(name,x,y,z,w,h,d):
    global wall_count
    box(name,x,y,z,w,h,d);wall_count+=1
def doorway(x,z,start,end,floor,height,room):
    for a,b in [(start,z-1.1),(z+1.1,end)]:
        if b>a:wall('room-wall',x,floor+height/2,(a+b)/2,.36,height,b-a+.04)
    wall('room-door-lintel',x,floor+(height+2.1)/2,z,.36,height-2.1,2.2)
    for edge in [-1,1]:box('room-door-jamb',x,floor+1.02,z+edge*1.14,.42,2.04,.1,'wood',solid=False)
    box('room-door-trim',x,floor+2.14,z,.44,.12,2.48,'gold',solid=False)
    room.update(door=dict(x=x,z=z,width=2.2,axis='x'),doors=1)
    door_clearances.append(dict(minX=x-2.8,maxX=x+2.8,minZ=z-1.5,maxZ=z+1.5,floor=floor,room=room['name']))
names={1:['Kho gia phả','Phòng trú ẩn','Phòng giáp','Hầm kho vàng','Kho vũ khí','Phòng bảo vật'],
       6:['Phòng cảnh vệ','Phòng tiệc','Phòng khách','Phòng sứ giả','Phòng ăn','Phòng chiến tích'],
       9.5:['Phòng tiếp khách','Phòng bản đồ','Bảo tàng giáp','Phòng tranh','Phòng trà','Kho hoàng gia'],
       13:['Phòng ngủ của vua','Phòng nghỉ','Phòng hoàng hậu','Phòng cổ vật','Phòng y phục','Thư viện cổ'],
       20:['Buồng thang','Phòng đọc','Kho sách','Kho rương','Phòng nghiên cứu','Phòng tinh thạch']}
for floor,height in [(1,4.55),(6,3.05),(9.5,3.05),(13,6.55),(20,5.1)]:
    edge=18.4 if floor==1 else 19.6
    rows=[-20.4,-10,4,20.4] if floor==1 else [-24.75,-12,3,21.6]
    if floor==13:rows=[-24.75,-10,0,21.6]
    if floor==20:rows=[-19.75,-7,3,21.6]
    for side in [-1,1]:
        x0,x1=(-edge,-5) if side<0 else (5,edge)
        for z in rows[1:-1]:wall('room-wall',(x0+x1)/2,floor+height/2,z,x1-x0+.12,height,.36)
        for row,(a,b) in enumerate(zip(rows,rows[1:])):
            room=dict(floor=floor,minX=x0,maxX=x1,minZ=a,maxZ=b,
                      name=names[floor][row+(0 if side<0 else 3)],corridor=False,stairRoom=(side<0 and row==0))
            door=(a+b)/2
            if floor==1 and side<0:door=[-11.6,-5,12.2][row]
            if floor==1 and side>0 and row==2:door=6.5
            doorway(side*5,door,a,b,floor,height,room);rooms.append(room)
    rooms.append(dict(floor=floor,minX=-5,maxX=5,minZ=rows[0],maxZ=rows[-1],name='Hành lang chính',corridor=True))
# Alternating corridor crossings force exploration without adding room exits.
for floor,height in [(1,4.55),(6,3.05),(9.5,3.05),(13,6.55),(20,5.1)]:
    for i,z in enumerate([-7,6]):
        side=(-1 if i==0 else 1) * (-1 if floor in [6,13] else 1)
        wall('room-maze-baffle',side*1.4,floor+height/2,z,7.2,height,.36)
        box('room-maze-cornice',side*1.4,floor+height-.12,z,7.2,.16,.46,'gold',solid=False)
# The west gallery connects two ancillary rooms and the prison's single gate.
for z in [1,8]:wall('room-wall',-6.5,-2.225,z,6.8,5.55,.36)
for name,a,b,door in [('Phòng cai ngục',-6,1,-2.5),('Phòng lưu giữ',1,8,4.5)]:
    room=dict(name=name,floor=-5,minX=-9.7,maxX=-3.3,minZ=a,maxZ=b,corridor=False)
    doorway(-9.7,door,a,b,-5,5.55,room);rooms.append(room)
rooms.append(dict(name='Hành lang nhà tù',floor=-5,minX=-15,maxX=-9.7,minZ=-6,maxZ=8,corridor=True))
rooms.append(dict(name='Sảnh điều khiển nhà tù',floor=-5,minX=-15,maxX=-7.8,minZ=8,maxZ=18,corridor=True))
rooms.append(dict(name='Nhà tù Nguyệt Thạch',floor=-5,minX=-7.8,maxX=-3.3,minZ=8,maxZ=18,
                  corridor=False,doors=1,door=dict(x=-7.8,z=13,width=1.6,axis='x'),prison=True))
door_clearances.append(dict(minX=-10,maxX=-5.8,minZ=11.9,maxZ=14.1,floor=-5,room='Nhà tù Nguyệt Thạch'))
