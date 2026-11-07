/* Building reservations are two-dimensional and include courtyards and roofs.
   Terrain height alone must never turn a roof or empty hall into a monster camp. */
/* Cooperative initializer: keep gameplay callbacks synchronous. */
async function installConstructionZones(){
    const zones=[],boxes=[],cell=100,grid=new Map();
    function rect(name,minX,maxX,minZ,maxZ){const b={name,minX,maxX,minZ,maxZ};boxes.push(b);for(let x=Math.floor(minX/cell);x<=Math.floor(maxX/cell);x++)for(let z=Math.floor(minZ/cell);z<=Math.floor(maxZ/cell);z++){const k=x+','+z;if(!grid.has(k))grid.set(k,[]);grid.get(k).push(b);}return b;}
    function refresh(){boxes.length=0;grid.clear();scene.updateMatrixWorld(true);rect('Central temple',170,234,-238,-172);if(window.romanArena){const b=new THREE.Box3().setFromObject(romanArena.group);rect('Roman arena',b.min.x-12,b.max.x+12,b.min.z-12,b.max.z+12);}
        for(const [name,root] of [['Grand railway terminal',window.grandTerminal?.group],['Royal technology',window.technologyBase?.group],['Candy kingdom',window.candyRealm?.group],['Pyramid',window.desertRealm?.pyramid]])if(root){const b=new THREE.Box3().setFromObject(root);if(!b.isEmpty())rect(name,b.min.x-8,b.max.x+8,b.min.z-8,b.max.z+8);}
        const f=antarcticRealm.factory,a=antarcticRealm.arena;rect('Snow factory',f.x-114,f.x+114,f.z-112,f.z+85);rect('Ice arena',a.x-110,a.x+110,a.z-110,a.z+140);
        for(const v of window.westernHighlands?.villages||[])rect('Village '+v.plan.id,v.center.x-94,v.center.x+94,v.center.z-94,v.center.z+94);
        for(const [i,s] of (window.moonRailway?.stations||[]).entries())for(const root of [s.model,s.access?.root,moonRailway.reversePlatforms[i]?.root,moonRailway.reversePlatforms[i]?.access?.root])if(root){const b=new THREE.Box3().setFromObject(root);if(!b.isEmpty())rect('Station '+s.name,b.min.x-6,b.max.x+6,b.min.z-6,b.max.z+6);}
        for(const p of window.realmTransitUpdate?.bridges||[]){const b=new THREE.Box3().setFromObject(p.root);rect('Pedestrian bridge',b.min.x-4,b.max.x+4,b.min.z-4,b.max.z+4);}
        for(const lm of landmarksData){if(lm.hidden||/railway_|antarctic|ice_lake|void_district/.test(lm.id)||!Number.isFinite(lm.x))continue;const r=['ancient_tree','thermal_spring','thermal_waterfall'].includes(lm.id)?35:lm.id==='mercury_lake'?0:28;if(r)rect(lm.name,lm.x-r,lm.x+r,lm.z-r,lm.z+r);}
        // Also catch isolated authored walls/buildings omitted from travel lists.
        for(const c of colliders){if(c.disabled||!Number.isFinite(c.minX)||!/(castle|technology|candy|temple|ruin|pyramid|house|cottage|altar|arena|gate|factory|tower|workshop)/i.test(c.name||'')||/rock|tree|bridge|stair|trail|railway/i.test(c.name||''))continue;rect(c.name,c.minX-3,c.maxX+3,c.minZ-3,c.maxZ+3);}
    }
    function contains(x,z,r=0){if(window.moonveilPalace?.affects(x,z))return true;if(voidReserved(x,z,r+8))return true;if(window.technologyBase?.contains(x,z)||window.candyRealm?.contains(x,z))return true;for(let a=Math.floor((x-r)/cell);a<=Math.floor((x+r)/cell);a++)for(let b=Math.floor((z-r)/cell);b<=Math.floor((z+r)/cell);b++)for(const q of grid.get(a+','+b)||[])if(x+r>=q.minX&&x-r<=q.maxX&&z+r>=q.minZ&&z-r<=q.maxZ)return true;return false;}
    window.constructionZones={boxes,contains,refresh};refresh();
}
