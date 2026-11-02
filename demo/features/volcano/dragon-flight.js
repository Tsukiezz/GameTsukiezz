/* The War Dragon takes off, patrols, attacks and lands inside its own caldera. */
function installVolcanicDragonFlight(){
    const c=volcanicValley,d=c.dragon,home=new THREE.Vector3(830,c.ground(830,-590),-590);
    const bounds={x:790,z:-555,rx:95,rz:140,ceiling:c.profile.floor+170};
    const flight={state:'grounded',timer:0,cooldown:8,destination:null,start:home.clone(),landing:home.clone(),bounds};d.flight=flight;
    const active=()=>gameState.isPlaying&&!gameState.inDialogue&&!document.querySelector('.modal-overlay.active')&&c.contains(playerGroup.position.x,playerGroup.position.z)&&Math.abs(playerGroup.position.y-c.ground(playerGroup.position.x,playerGroup.position.z))<80;
    const ease=t=>{t=THREE.MathUtils.clamp(t,0,1);return t*t*(3-2*t);};
    function confine(p){const x=(p.x-bounds.x)/bounds.rx,z=(p.z-bounds.z)/bounds.rz,r=Math.hypot(x,z);if(r>.76){p.x=bounds.x+x/r*bounds.rx*.76;p.z=bounds.z+z/r*bounds.rz*.76;}p.y=Math.min(bounds.ceiling,Math.max(c.ground(p.x,p.z),p.y));return p;}
    function destination(){for(let i=0;i<40;i++){const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*.65,x=bounds.x+Math.cos(a)*r*bounds.rx,z=bounds.z+Math.sin(a)*r*bounds.rz,h=c.ground(x,z);if(h+25<bounds.ceiling)return new THREE.Vector3(x,h+22+Math.random()*8,z);}return home.clone().add(new THREE.Vector3(0,26,0));}
    function takeOff(){if(!active()||d.health<=0||flight.state!=='grounded'||flight.cooldown>0||d.state!=='patrol')return false;flight.state='takeoff';flight.timer=0;flight.start.copy(d.group.position);flight.destination=destination();d.destination=null;return true;}
    function land(){if(flight.state!=='airborne')return false;flight.state='landing';flight.timer=0;flight.start.copy(d.group.position);flight.landing.copy(home);return true;}
    const original=c.update;let time=0;
    function update(dt){dt=THREE.MathUtils.clamp(dt,0,.1);time+=dt;
        if(active()&&d.health>0){
            flight.cooldown=Math.max(0,flight.cooldown-dt);flight.timer+=dt;
            if(flight.state==='grounded'){if(flight.cooldown===0&&d.state==='patrol')takeOff();}
            else if(flight.state==='takeoff'){d.group.position.copy(flight.start);d.group.position.y+=ease(flight.timer/3)*26;if(flight.timer>=3){flight.state='airborne';flight.timer=0;}}
            else if(flight.state==='airborne'){
                const p=d.group.position;if(d.state==='patrol'||d.state==='recover'){
                    if(!flight.destination||p.distanceTo(flight.destination)<4)flight.destination=destination();const delta=flight.destination.clone().sub(p),length=delta.length();if(length>.01){p.addScaledVector(delta,Math.min(1,dt*8/length));const target=Math.atan2(-delta.x,-delta.z),turn=Math.atan2(Math.sin(target-d.group.rotation.y),Math.cos(target-d.group.rotation.y));d.group.rotation.y+=turn*(1-Math.exp(-4*dt));}}
                const floor=c.ground(p.x,p.z);p.y=Math.max(floor+15,Math.min(bounds.ceiling,p.y));if(flight.timer>16&&d.state==='patrol')land();
            }else if(flight.state==='landing'){const t=ease(flight.timer/4);d.group.position.copy(flight.start).lerp(flight.landing,t);d.group.position.y=Math.max(d.group.position.y,c.ground(d.group.position.x,d.group.position.z));if(flight.timer>=4){d.group.position.copy(home);flight.state='grounded';flight.timer=0;flight.cooldown=13;d.destination=null;}}
            confine(d.group.position);
        }
        original(dt);
        if(d.health<=0&&flight.state!=='grounded'){d.group.position.y=Math.max(c.ground(d.group.position.x,d.group.position.z),d.group.position.y-dt*18);if(d.group.position.y<=c.ground(d.group.position.x,d.group.position.z)+.01)flight.state='grounded';}
        if(d.health>0){const air=flight.state!=='grounded',blend=1-Math.exp(-10*dt);for(const side of [-1,1]){const target=side*(air?.3+Math.sin(time*6)*.55:.08+Math.sin(time*1.8)*.12),joint=d.joints['wing'+side];joint.rotation.z+=(target-joint.rotation.z)*blend;}d.group.rotation.x+=((air?-.06:0)-d.group.rotation.x)*blend;}
        const p=d.group.position;Object.assign(c.dragonCollider,{x:p.x,z:p.z,minY:p.y,maxY:p.y+8,disabled:d.health<=0});
        if(!c.hud.hidden&&flight.state!=='grounded')c.hud.textContent+=' · '+(flight.state==='takeoff'?'Rồng đang cất cánh':flight.state==='landing'?'Rồng đang hạ cánh':'Rồng đang bay trong thung lũng');
    }
    const pause=c.pause;c.pause=()=>{pause();if(flight.state==='grounded')flight.cooldown=Math.max(8,flight.cooldown);};
    c.update=update;c.flight={state:flight,bounds,home,takeOff,land,confine,destination};
}
