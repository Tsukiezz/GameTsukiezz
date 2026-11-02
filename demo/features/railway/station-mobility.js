/* Two-stop station lifts and grade-separated transfers. No rail heights change. */
const stationLiftRegistry=[];

function stationAccessGeometry(root,materials,surfaces=[],solids=[]){
    const bins=new Map();
    function box(x,y,z,w,h,d,material='teal',walk=false,solid=false){
        const g=new THREE.BoxGeometry(w,h,d);g.translate(x,y,z);let b=bins.get(material);
        if(!b){b={p:[],n:[],i:[]};bins.set(material,b);}const offset=b.p.length/3;
        b.p.push(...g.attributes.position.array);b.n.push(...g.attributes.normal.array);for(const i of g.index.array)b.i.push(offset+i);g.dispose();
        const bounds={minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY:y-h/2,maxY:y+h/2};
        if(walk)surfaces.push(bounds);if(solid)solids.push(bounds);
    }
    function gallery(a,b,width=3.6,guard=true){
        // Axis-aligned local galleries keep their walkable boxes exact.
        const alongX=Math.abs(b.x-a.x)>Math.abs(b.z-a.z),length=alongX?Math.abs(b.x-a.x):Math.abs(b.z-a.z),x=(a.x+b.x)/2,z=(a.z+b.z)/2,y=a.y;
        box(x,y-.12,z,alongX?length+width:width,.24,alongX?width:length+width,'stone',true);
        box(x,y-.29,z,alongX?length+width:width,.1,alongX?width:length+width,'teal');
        if(!guard)return;
        const trim=Math.min(width/2,length/3),guardLength=Math.max(.05,length-trim*2);
        for(const side of [-1,1]){
            const rx=x+(alongX?0:side*(width/2+.04)),rz=z+(alongX?side*(width/2+.04):0);
            box(rx,y+1.08,rz,alongX?guardLength:.14,.14,alongX?.14:guardLength,'gold');
            box(rx,y+.55,rz,alongX?guardLength:.1,.1,alongX?.1:guardLength,'teal');
            solids.push({minX:rx-(alongX?guardLength/2:.08),maxX:rx+(alongX?guardLength/2:.08),minZ:rz-(alongX?.08:guardLength/2),maxZ:rz+(alongX?.08:guardLength/2),minY:y+.15,maxY:y+1.2});
            for(let d=trim;d<=length-trim;d+=2){const t=d/Math.max(.01,length);box(alongX?a.x+(b.x-a.x)*t:rx,y+.52,alongX?rz:a.z+(b.z-a.z)*t,.12,1.04,.12,'steel');}
        }
    }
    function finish(){for(const [material,b] of bins){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));g.setIndex(b.i);root.add(new THREE.Mesh(g,materials[material]));}root.updateWorldMatrix(true,true);}
    return {box,gallery,finish};
}

function stationAccessSign(root,text,caption,position,yaw=0){
    const c=document.createElement('canvas');c.width=768;c.height=192;const ctx=c.getContext('2d');ctx.fillStyle='#12323d';ctx.fillRect(0,0,768,192);ctx.strokeStyle='#d7ba75';ctx.lineWidth=8;ctx.strokeRect(4,4,760,184);ctx.textAlign='center';ctx.fillStyle='#f1dfad';ctx.font='bold 38px sans-serif';ctx.fillText(text,384,76,730);ctx.fillStyle='#bce3e8';ctx.font='26px sans-serif';ctx.fillText(caption,384,133,730);
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(5.5,1.38),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),side:THREE.DoubleSide}));mesh.position.copy(position);mesh.rotation.y=yaw;root.add(mesh);return mesh;
}

function createStationLift({root,materials,cx,cz,levels,labels,name,role='ground'}){
    const surfaces=[],solids=[],art=stationAccessGeometry(root,materials,surfaces,solids),low=Math.min(...levels),high=Math.max(...levels);
    const glass=materials.glass.clone();glass.opacity=.22;glass.depthWrite=false;
    for(const sx of [-1,1])for(const sz of [-1,1]){art.box(cx+sx*2.7,(low+high+3.6)/2,cz+sz*2.7,.42,high-low+3.6,.42,'teal',false,true);art.box(cx+sx*2.7,low-.12,cz+sz*2.7,1.2,.24,1.2,'steel');}
    // Structural bands are bracing, with no extra lift stops or intermediate floors.
    for(let y=low+5;y<high;y+=10){art.box(cx,y,cz-2.7,5.6,.22,.22,'steel');for(const side of [-1,1])art.box(cx+side*2.7,y,cz,.22,.22,5.6,'steel');}
    for(const y of levels){art.box(cx,y+3.2,cz+2.7,5.8,.3,.35,'gold');art.box(cx,y+3.4,cz+4.2,6.4,.2,3.7,'teal');}
    art.box(cx,high+3.55,cz,6,.25,6,'teal');art.box(cx,high+3.72,cz,5.7,.09,5.7,'gold');
    for(const [floor,y] of levels.entries()){
        art.box(cx,y-.12,cz+4.2,6,.24,3.6,'stone',true);
        if(floor===0)for(const side of [-1,1]){art.box(cx+side*2.95,y+1.05,cz+4.3,.12,.12,3.7,'gold');art.box(cx+side*2.95,y+.55,cz+4.3,.15,1.1,3.7,'teal',false,true);}
        else {art.box(cx,y+1.08,cz+6.1,5.9,.14,.14,'gold');art.box(cx,y+.55,cz+6.1,5.9,1.1,.14,'teal',false,true);}
        art.box(cx+3.05,y+1.12,cz+3.7,.4,1.05,.4,'teal',false,true);art.box(cx+3.05,y+1.7,cz+3.7,.43,.13,.43,'lamp');
        stationAccessSign(root,labels[floor],name,new THREE.Vector3(cx,y+3.05,cz+2.9));
    }
    // The bottom pit stays covered even when the cabin has left it.
    art.box(cx,low-.18,cz,5,.3,5,'stone',true);art.finish();
    const cabin=new THREE.Group();cabin.name='StationLiftCabin';root.add(cabin);
    const cab=stationAccessGeometry(cabin,materials);cab.box(0,-.12,0,4.8,.24,4.8,'steel');cab.box(0,.025,0,4.6,.04,4.6,'wood');cab.box(0,3,0,4.8,.2,4.8,'teal');cab.box(0,2.87,0,2,.06,1.5,'lamp');
    for(const side of [-1,1]){cab.box(side*2.32,.5,0,.14,1,4.7,'teal');cab.box(side*2.32,1.2,0,.12,.12,4.5,'gold');}
    cab.box(0,.5,-2.32,4.7,1,.14,'teal');cab.box(0,1.2,-2.32,4.5,.12,.12,'gold');cab.finish();
    for(const side of [-1,1]){const panel=new THREE.Mesh(new THREE.BoxGeometry(.08,1.7,4.4),glass);panel.position.set(side*2.32,2,0);cabin.add(panel);}
    const back=new THREE.Mesh(new THREE.BoxGeometry(4.4,1.7,.08),glass);back.position.set(0,2,-2.32);cabin.add(back);
    const gates=levels.map(y=>[-1,1].map(side=>{const panel=new THREE.Mesh(new THREE.BoxGeometry(2.3,2.7,.12),materials.teal);panel.position.set(cx+side*1.15,y+1.35,cz+2.45);root.add(panel);return panel;}));
    let floor=0,target=0,phase='idle',elapsed=0,from=levels[0],open=1;
    cabin.position.set(cx,levels[0],cz);
    const lift={root,cabin,surfaces,solids,levels:[...levels],labels,name,role,cx,cz,gates,glass,get floor(){return floor;},get target(){return target;},get phase(){return phase;},get busy(){return phase!=='idle';},get open(){return open;},
        worldPoint(index,inside=false){return root.localToWorld(new THREE.Vector3(cx,levels[index],cz+(inside?0:4.2)));},
        local(p){root.updateWorldMatrix(true,false);return root.worldToLocal(p.clone());},
        contains(p,tolerance=.5){const q=this.local(p);return Math.abs(q.x-cx)<2.1&&Math.abs(q.z-cz)<2.15&&Math.abs(q.y-cabin.position.y)<tolerance;},
        request(index){if(this.busy||index===floor||index<0||index>1)return false;target=index;phase='closing';elapsed=0;from=cabin.position.y;return true;},
        tick(dt){const before=cabin.position.y;elapsed+=dt;if(phase==='closing'){open=Math.max(0,1-elapsed/.7);if(elapsed>=.7){phase='moving';elapsed=0;open=0;}}
            else if(phase==='moving'){const duration=Math.max(2.5,Math.abs(levels[target]-from)/9),t=THREE.MathUtils.clamp(elapsed/duration,0,1),smooth=t*t*(3-2*t);cabin.position.y=THREE.MathUtils.lerp(from,levels[target],smooth);if(t>=1){floor=target;phase='opening';elapsed=0;}}
            else if(phase==='opening'){open=Math.min(1,elapsed/.7);if(open>=1){phase='idle';elapsed=0;}}
            for(let f=0;f<2;f++)for(let side=0;side<2;side++)gates[f][side].position.x=cx+(side?1:-1)*(1.15+(floor===f&&phase!=='moving'?open:0)*2.3);
            return cabin.position.y-before;
        },
        support(x,z,y){const q=this.local(new THREE.Vector3(x,y,z)),h=cabin.position.y;if(Math.abs(q.x-cx)<=2.3&&Math.abs(q.z-cz)<=2.3&&q.y>=h-MAX_STEP_HEIGHT-.03&&q.y<h+2)return root.position.y+h;let top=-Infinity;for(const b of surfaces)if(q.x>=b.minX&&q.x<=b.maxX&&q.z>=b.minZ&&q.z<=b.maxZ&&q.y>=b.maxY-MAX_STEP_HEIGHT-.01)top=Math.max(top,root.position.y+b.maxY);return top;},
        blocked(x,z,y,radius=.35){const q=this.local(new THREE.Vector3(x,y,z));for(const b of solids)if(q.y+PLAYER_HEIGHT>b.minY&&q.y<b.maxY&&q.x+radius>b.minX&&q.x-radius<b.maxX&&q.z+radius>b.minZ&&q.z-radius<b.maxZ)return true;
            if(Math.abs(q.x-cx)<2.5+radius&&Math.abs(q.z-(cz+2.45))<.13+radius)for(let f=0;f<2;f++)if(q.y+PLAYER_HEIGHT>levels[f]&&q.y<levels[f]+2.7&&(floor!==f||open<.92||phase==='moving'))return true;
            if(q.y+PLAYER_HEIGHT>cabin.position.y&&q.y<cabin.position.y+3&&Math.abs(q.z-cz)<2.4+radius&&Math.abs(q.x-cx)>2.2-radius&&Math.abs(q.x-cx)<2.5+radius)return true;
            if(q.y+PLAYER_HEIGHT>cabin.position.y&&q.y<cabin.position.y+3&&Math.abs(q.x-cx)<2.4+radius&&Math.abs(q.z-(cz-2.32))<.13+radius)return true;return false;
        }};
    lift.tick(0);root.updateWorldMatrix(true,true);stationLiftRegistry.push(lift);return lift;
}

function buildStationLiftAccess(station,height,survey,materials,parent,choice){
    // The former stair search could fall back to a flooded foot of the hill.
    // A lift must have a dry ground lobby, even when this needs a longer gallery.
    function candidate(x,z){const floors=[];let wet=false,blocked=false;for(const dx of [-3,0,3])for(const dz of [-4,0,4]){const p=station.model.localToWorld(new THREE.Vector3(x+2+dx,0,z+7.5+dz)),floor=height(p.x,p.z),water=playerSurvival.surfaceAt(p.x,p.z),expanded=window.worldExpansion?.waterAt(p.x,p.z);floors.push(floor);if(water!==null&&floor<water+.3||expanded&&floor<expanded.y+.3||Math.abs(p.x)>EXPANDED_REALM_DATA.bound-6||Math.abs(p.z)>EXPANDED_REALM_DATA.bound-6)wet=true;if(survey.top(p.x,p.z,.8,floor+3,floor+.3)>floor+.3||window.livingWorld&&checkCollision(p.x,p.z,floor,.6))blocked=true;}const high=Math.max(...floors),low=Math.min(...floors);if(wet||blocked||high-low>.65)return null;return {x,z,bottom:high,score:Math.hypot(x+2,z+7.5)+(high-low)*180};}
    const existing=candidate(choice.x,choice.z);
    if(existing)choice={...choice,bottom:existing.bottom};
    else {let best=null;for(const x of [36,52,68,88,112,144,184,224,272,320])for(const z of [32,-32,55,-55,80,-80,112,-112,152,-152]){const p=candidate(x,z);if(p&&(!best||p.score<best.score))best=p;}if(best)choice=best;}
    const root=new THREE.Group();root.name='RailwayLiftAccess';root.position.copy(station.model.position);root.rotation.y=station.yaw;parent.add(root);root.updateWorldMatrix(true,false);
    const base=choice.bottom-station.model.position.y+.02,top=station.platform.y-station.model.position.y,cx=choice.x+2,cz=choice.z+3.5;
    // Re-evaluate after relocating a flooded lobby. Its new dry site may be
    // almost level with the platform; two nearby lift floors would overlap.
    if(Math.abs(top-base)<5){
        const surfaces=[],solids=[],art=stationAccessGeometry(root,materials,surfaces,solids),street=new THREE.Vector3(cx,base,cz+8),world=root.localToWorld(street.clone());street.y=height(world.x,world.z)-root.position.y+.02;
        const count=Math.max(1,Math.ceil(Math.abs(top-street.y)/.14)),waypoints=[street.clone()];
        for(let i=0;i<count;i++){const length=3.8/count,z=cz+8-(i+.5)*length,y=THREE.MathUtils.lerp(street.y,top,(i+1)/count);art.box(cx,y-.12,z,4.2,.24,length+.02,'stone',true);art.box(cx,y+.01,z-length/2+.03,4,.02,.06,'gold');for(const side of [-1,1]){art.box(cx+side*2.2,y+.53,z,.1,1.06,.1,'teal',false,true);art.box(cx+side*2.2,y+1.05,z,.12,.1,length+.02,'gold');}waypoints.push(new THREE.Vector3(cx,y,cz+8-(i+1)*length));}
        const path=[waypoints.at(-1),new THREE.Vector3(choice.x+8,top,cz+4.2),new THREE.Vector3(choice.x+8,top,44),new THREE.Vector3(7,top,44),new THREE.Vector3(7,top,36)];for(let i=1;i<path.length;i++)art.gallery(path[i-1],path[i]);waypoints.push(...path.slice(1));art.finish();
        return {kind:'stairs',root,surfaces,solids,rise:top-street.y,entrance:root.localToWorld(street.clone()),waypoints:waypoints.map(p=>root.localToWorld(p.clone())),height(x,z,y){const q=root.worldToLocal(new THREE.Vector3(x,y,z));let best=-Infinity;for(const b of surfaces)if(q.x>=b.minX&&q.x<=b.maxX&&q.z>=b.minZ&&q.z<=b.maxZ&&q.y>=b.maxY-MAX_STEP_HEIGHT-.01)best=Math.max(best,b.maxY+root.position.y);return best;}};
    }
    const lift=createStationLift({root,materials,cx,cz,levels:[base,top],labels:['0 · Mặt đất','1 · Sân ga'],name:station.name||'Ga tàu',role:'ground'});
    const art=stationAccessGeometry(root,materials,lift.surfaces,lift.solids),entry=new THREE.Vector3(cx,base,cz+4.2),waypoints=[entry.clone()];
    const street=root.localToWorld(new THREE.Vector3(cx,0,cz+8)),streetY=height(street.x,street.z)-root.position.y+.02,steps=Math.max(1,Math.ceil(Math.abs(base-streetY)/.14)),depth=3.8/steps;
    for(let j=0;j<steps;j++){const z=cz+8-(j+.5)*depth,y=THREE.MathUtils.lerp(streetY,base,(j+1)/steps);art.box(cx,y-.1,z,4.2,.2,depth+.025,'stone',true);art.box(cx,y+.012,z-depth/2+.035,4,.02,.06,'gold');for(const side of [-1,1]){art.box(cx+side*2.17,y+.52,z,.12,1.04,.12,'teal',false,true);art.box(cx+side*2.17,y+1.08,z,.14,.12,depth+.025,'gold');lift.solids.push({minX:cx+side*2.17-.09,maxX:cx+side*2.17+.09,minZ:z-depth/2,maxZ:z+depth/2,minY:y+.15,maxY:y+1.15});}}
    const gallery=[new THREE.Vector3(cx,top,cz+4.2),new THREE.Vector3(choice.x+8,top,cz+4.2),new THREE.Vector3(choice.x+8,top,44),new THREE.Vector3(7,top,44),new THREE.Vector3(7,top,36)];
    gallery.slice(1).forEach((p,i)=>{const a=gallery[i];art.gallery(a,p);const length=a.distanceTo(p);for(let d=10;d<length-5;d+=18){const q=a.clone().lerp(p,d/length),world=root.localToWorld(q.clone()),ground=height(world.x,world.z)-root.position.y,h=top-.35-ground;if(h>1&&survey.top(world.x,world.z,.7,world.y-.35,ground+root.position.y+.2)<ground+root.position.y+.25)art.box(q.x,ground+h/2,q.z,.75,h,.75,'steel');}});waypoints.push(...gallery);
    art.finish();root.updateWorldMatrix(true,true);
    // Preserve the surveyed ground entrance of the former stairs exactly.
    const entrance=root.localToWorld(new THREE.Vector3(cx,base,choice.z+7.5));
    return {kind:'lift',root,lift,surfaces:lift.surfaces,solids:lift.solids,waypoints:waypoints.map(p=>root.localToWorld(p)),rise:top-base,entrance,height:(x,z,y)=>lift.support(x,z,y)};
}

function finishLowStationStairs(access,station,height,materials){
    access.kind='stairs';const root=access.root,art=stationAccessGeometry(root,materials,access.surfaces,access.solids),end=root.worldToLocal(access.entrance.clone());
    // A short paved forecourt, framed by solid handrails and warm bollards.
    // Keep the ground-level junction open for the existing village trail.
    // The stair flights themselves retain their full structural handrails.
    art.gallery(end.clone().add(new THREE.Vector3(0,0,4)),end,5,false);
    for(const side of [-1,1]){art.box(end.x+side*3,end.y+.4,end.z+3,.4,.8,.4,'teal',false,true);art.box(end.x+side*3,end.y+.85,end.z+3,.5,.12,.5,'lamp');}
    art.finish();stationAccessSign(root,'LỐI LÊN SÂN GA','Thang bộ · tay vịn hai bên',end.clone().add(new THREE.Vector3(3,2.1,4)),Math.PI/2);return access;
}

function installStationMobility(){
    const rail=moonRailway,materials=rail.materials,root=new THREE.Group();root.name='StationInterchanges';scene.add(root);const transfers=[];
    for(const [index,s] of rail.stations.entries()){
        const back=rail.reversePlatforms[index],gap=Math.max(s.platform.y-rail.terrainHeight(s.platform.x,s.platform.z),s.returnPlatform.y-rail.terrainHeight(s.returnPlatform.x,s.returnPlatform.z));
        if(gap<5&&s.access.kind!=='lift'&&back.access?.kind!=='lift'&&Math.abs(s.platform.y-s.returnPlatform.y)<2.5)continue;
        const f=new THREE.Vector3(Math.sin(s.yaw),0,Math.cos(s.yaw)),origin=s.model.position;
        // Put the interchange at the end which avoids the existing hillside
        // paths and ground ramps. A cabin must not occupy their centre line.
        let placement=null;
        for(const along of [-64,64,-82,82]){
            const anchors=[s.platform,s.returnPlatform].map(p=>p.clone().addScaledVector(f,along-p.clone().sub(origin).dot(f))),towards=along<0?1:-1;
            let score=Math.abs(along)-64+(along>0?1:0);
            for(const [side,a] of anchors.entries()){
                for(let d=0;d<=30;d+=3){const p=a.clone().addScaledVector(f,towards*d),ground=rail.terrainHeight(p.x,p.z);if(ground>p.y+.2)score+=100000;
                    const floor=window.highlandTrails?.support(p.x,p.z,p.y);if(Number.isFinite(floor)&&Math.abs(floor-p.y)<2.5&&highlandTrails.corridorAt(p.x,p.z,4))score+=1000;
                    const points=side?back.access?.waypoints:s.access.waypoints;for(const q of points||[])if(Math.hypot(q.x-p.x,q.z-p.z)<6&&Math.abs(q.y-p.y)<2.5)score+=1000;
                }
            }
            if(!placement||score<placement.score)placement={along,anchors,score};
        }
        const {along,anchors}=placement;
        let bridgeY=Math.max(...anchors.map(p=>p.y))+8.5;for(let t=0;t<=1;t+=.05){const p=anchors[0].clone().lerp(anchors[1],t);bridgeY=Math.max(bridgeY,rail.terrainHeight(p.x,p.z)+2);}
        const group=new THREE.Group();group.name='StationTransfer_'+index;root.add(group);const links=[];
        for(let side=0;side<2;side++){
            const tower=new THREE.Group();tower.name='StationTransferLift';tower.position.copy(anchors[side]);tower.rotation.y=s.yaw+(along>0?Math.PI:0);group.add(tower);
            const lift=createStationLift({root:tower,materials,cx:0,cz:0,levels:[0,bridgeY-anchors[side].y],labels:[side?'0 · Ga chiều ngược':'0 · Ga chiều xuôi','1 · Cầu đổi chiều'],name:s.name,role:'transfer'});
            const art=stationAccessGeometry(tower,materials,lift.surfaces,lift.solids),join=Math.abs(along)-(side?30:34);art.gallery(new THREE.Vector3(0,0,4.2),new THREE.Vector3(0,0,20));art.gallery(new THREE.Vector3(0,0,20),new THREE.Vector3(0,0,join));art.finish();links.push(lift);
        }
        const a=links[0].worldPoint(1),b=links[1].worldPoint(1),delta=b.clone().sub(a),bridge=new THREE.Group();bridge.name='StationTransferBridge';bridge.position.copy(a);bridge.rotation.y=Math.atan2(delta.x,delta.z);group.add(bridge);
        const surfaces=[],solids=[],art=stationAccessGeometry(bridge,materials,surfaces,solids);art.gallery(new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,delta.length()),4);art.finish();
        stationAccessSign(bridge,s.name,'CẦU BỘ HÀNH · XUÔI ↔ NGƯỢC',new THREE.Vector3(0,2.4,delta.length()/2),Math.PI/2);
        transfers.push({station:index,name:s.name,root:group,lifts:links,bridge,bridgeY,surfaces,solids,along,placementScore:placement.score,span:delta.length(),endpoints:[a,b]});
    }
    root.updateWorldMatrix(true,true);
    const hud=document.createElement('div');hud.className='station-mobility-hud';hud.hidden=true;hud.innerHTML='<strong></strong><span></span><button type="button" aria-keyshortcuts="E"></button>';document.body.append(hud);const button=hud.querySelector('button');
    let riding=null,near=null;const vector=new THREE.Vector3();
    function nearest(){if(rail.aboard)return null;let best=null,score=Infinity;for(const lift of stationLiftRegistry){if(lift.contains(playerGroup.position)){return {lift,floor:lift.floor,inside:true};}for(let floor=0;floor<2;floor++){const p=lift.worldPoint(floor),d=Math.hypot(p.x-playerGroup.position.x,p.z-playerGroup.position.z);if(d<4.5&&Math.abs(p.y-playerGroup.position.y)<1.5&&d<score){score=d;best={lift,floor,inside:false};}}}return best;}
    function interact(){const target=nearest();if(!target||rail.aboard||gameState.inDialogue)return false;const {lift,floor,inside}=target;if(lift.busy)return true;if(inside){if(lift.request(1-lift.floor)){riding=lift;resetGameplayInput();jumpVelocityY=0;isGrounded=true;playerLife.resetFall();}}else if(lift.floor!==floor)lift.request(floor);else showNotification('Thang đã đến. Bước vào cabin, nhấn E để đi.');return true;}
    button.onclick=interact;
    function localBoxBlocked(object,solids,x,z,y,radius){const q=object.worldToLocal(new THREE.Vector3(x,y,z));return solids.some(b=>q.y+PLAYER_HEIGHT>b.minY&&q.y<b.maxY&&q.x+radius>b.minX&&q.x-radius<b.maxX&&q.z+radius>b.minZ&&q.z-radius<b.maxZ);}
    function support(x,z,y){let top=-Infinity;for(const lift of stationLiftRegistry)if(Math.hypot(x-lift.root.position.x,z-lift.root.position.z)<480)top=Math.max(top,lift.support(x,z,y));for(const t of transfers){if(Math.hypot(x-t.bridge.position.x,z-t.bridge.position.z)>t.span+8)continue;const q=t.bridge.worldToLocal(new THREE.Vector3(x,y,z));for(const b of t.surfaces)if(q.x>=b.minX&&q.x<=b.maxX&&q.z>=b.minZ&&q.z<=b.maxZ&&q.y>=b.maxY-MAX_STEP_HEIGHT-.01)top=Math.max(top,t.bridge.position.y+b.maxY);}return top;}
    function blocked(x,z,y,radius=.35){for(const lift of stationLiftRegistry)if(Math.hypot(x-lift.root.position.x,z-lift.root.position.z)<480&&lift.blocked(x,z,y,radius))return true;for(const t of transfers)if(Math.hypot(x-t.bridge.position.x,z-t.bridge.position.z)<t.span+8&&localBoxBlocked(t.bridge,t.solids,x,z,y,radius))return true;return false;}
    function update(dt){const active=gameState.isPlaying&&!gameState.inDialogue&&!document.querySelector('.modal-overlay.active');root.visible=gameState.isPlaying;if(!active){hud.hidden=true;return;}
        if(riding&&(gameState.health<=0||Math.hypot(playerGroup.position.x-riding.worldPoint(riding.floor,true).x,playerGroup.position.z-riding.worldPoint(riding.floor,true).z)>6))riding=null;
        for(const lift of stationLiftRegistry){const dy=lift.tick(Math.min(.1,dt));if(lift===riding){playerGroup.position.y+=dy;currentGroundY=playerGroup.position.y;jumpVelocityY=0;isGrounded=true;playerLife.resetFall();if(lift.phase==='idle')riding=null;}}
        near=nearest();hud.hidden=!near;if(!near)return;const {lift,floor,inside}=near;hud.querySelector('strong').textContent=lift.name;hud.querySelector('span').textContent=lift.busy?'Thang máy đang di chuyển…':lift.labels[floor];button.disabled=lift.busy;button.textContent=lift.busy?'Vui lòng chờ':inside?'E · '+lift.labels[1-lift.floor].replace(/^\d · /,'Đi đến '):lift.floor!==floor?'E · Gọi thang máy':'E · Thang đã đến — bước vào cabin';
    }
    function vertical(){if(!riding)return false;keys.jump=false;jumpVelocityY=0;currentGroundY=playerGroup.position.y;isGrounded=true;return true;}
    window.addEventListener('keydown',e=>{if(e.key.toLowerCase()!=='e'||e.repeat||e.ctrlKey||e.altKey||e.metaKey||!gameState.isPlaying||document.querySelector('.modal-overlay.active')||e.target?.closest?.('input,textarea,select,[contenteditable=true]'))return;if(interact()){e.preventDefault();e.stopImmediatePropagation();}},true);
    window.stationMobility={root,lifts:stationLiftRegistry,transfers,hud,interact,update,support,blocked,vertical,nearest,get riding(){return riding;}};
}
