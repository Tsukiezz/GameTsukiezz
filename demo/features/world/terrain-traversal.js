/* Terrain is a solid slope, not an unlimited sequence of tiny automatic steps. */
function installTerrainTraversal(){
    const maxSlope=Math.tan(35*Math.PI/180),cache=new Map();
    function gradient(x,z){
        const ix=Math.round(x*2),iz=Math.round(z*2),key=ix+','+iz;
        if(cache.has(key))return cache.get(key);
        const px=ix/2,pz=iz/2,r=.45,h=worldSurface.height;
        const dx=(h(px+r,pz)-h(px-r,pz))/(2*r),dz=(h(px,pz+r)-h(px,pz-r))/(2*r);
        const g={x:dx,z:dz,slope:Math.hypot(dx,dz)};
        if(cache.size>16000)cache.clear();cache.set(key,g);return g;
    }
    function walkway(x,z,y){
        if(Number.isFinite(window.highlandTrails?.support(x,z,y)))return true;
        if(inCastleEnvelope(x,z)||castleBridgeTop(x,z)!==null)return true;
        for(const api of [window.voidDistrict,window.stationMobility,window.moonRailway,window.realmTransitUpdate,window.antarcticRealm,window.desertRealm]){
            const s=api?.support?.(x,z,y);if(api===window.moonRailway&&s<=worldSurface.height(x,z)+.035)continue;
            if(Number.isFinite(s)&&Math.abs(s-y)<=MAX_STEP_HEIGHT+.04)return true;
        }
        // Furnished floors, roofs and other authored standable surfaces are
        // independent of the natural terrain below them.
        return getGroundElevation(x,z,y)>worldSurface.height(x,z)+.35;
    }
    function bypass(water=true){return Boolean(window.crystalWings?.flying||window.moonRailway?.aboard||window.riverBoat?.aboard||water&&window.playerSurvival?.swimming||window.evilCavern?.inside());}
    function castleStair(x,z,y){return inCastleEnvelope(x,z)&&(onCastleTransition(x,z,y)||(window.CASTLE_EXTENSION?.compactStairs||[]).some(p=>Math.abs(x-(p.x-110))<=p.width/2+.35&&z>=p.z+119.2&&z<=p.z+p.depth+120.5&&y>=p.bottom-.4&&y<=p.top+.4));}
    function canMove(from,x,z){
        if(bypass(false))return true;
        // Castle flights already have individual risers, ceilings and return
        // landings. Their floor resolver must handle several risers in a slow
        // frame instead of treating the next room floor as a natural cliff.
        if(castleStair(from.x,from.z,from.y)||castleStair(x,z,from.y))return true;
        const next=getGroundElevation(x,z,from.y),rise=next-from.y;
        // Air control cannot push the feet inside a cliff and rely on recovery
        // to teleport the character onto its top.
        if(rise>MAX_STEP_HEIGHT+.001||!isGrounded&&!window.playerSurvival?.swimming&&rise>.05)return false;
        if(walkway(x,z,from.y)||!isGrounded&&from.y>next+.12)return true;
        const g=gradient(x,z),up=g.x*(x-from.x)+g.z*(z-from.z);
        return !(g.slope>maxSlope&&up>1e-7&&next>=from.y-.03);
    }
    function steepAt(x,z,y){return !bypass()&&!walkway(x,z,y)&&Math.abs(y-worldSurface.height(x,z))<.4&&gradient(x,z).slope>maxSlope;}
    function slide(dt){
        const p=playerGroup.position;if(!steepAt(p.x,p.z,p.y))return false;
        const g=gradient(p.x,p.z),d=Math.min(.18,dt*3.5),x=p.x-g.x/g.slope*d,z=p.z-g.z/g.slope*d;
        if(!checkCollision(x,z,p.y,PLAYER_RADIUS)){p.x=x;p.z=z;}
        isGrounded=false;jumpVelocityY=Math.min(0,jumpVelocityY);return true;
    }
    window.terrainTraversal={maxSlope,maxAngle:35,maxStep:MAX_STEP_HEIGHT,gradient,walkway,canMove,steepAt,slide};
}
