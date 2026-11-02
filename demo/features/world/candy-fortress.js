/* Cookie masonry, working gate openings and a walkable chocolate rampart. */
function decorateCandyFortress({center,box,add,sphere,tower}){
    const sections=[],gates=[],walkways=[],steps=[];
    const floor=(x,z)=>Math.min(center.y,worldExpansion.height(center.x+x,center.z+z)??center.y)-center.y;
    function walk(name,x,y,z,w,d){box(name,x,y-.1,z,w,.2,d,'#a67d65');addBoxCollider(center.x+x,center.z+z,w,d,center.y+y-.2,center.y+y,true);colliders.at(-1).name='candy-rampart-'+name;walkways.push({x,z,y,w,d});}
    function wall(x,z,w,d){const bottom=Math.min(floor(x,z),floor(x-w/2,z-d/2),floor(x+w/2,z+d/2))-.35,top=9;box('FortressWaferWall',x,(bottom+top)/2,z,w,top-bottom,d,'#b58b64',true);box('ChocolateWallFoot',x,bottom+.5,z,w+.25,1,d+.25,'#704e49',true);box('CreamWallCornice',x,8.75,z,w+.5,.45,d+.5,'#e3cfb5');sections.push({x,z,w,d,bottom,top});}
    // Four gates stay open at ground level; their lintels carry the wall walk.
    for(const z of [-108,108]){for(const side of [-1,1])wall(side*63,z,110,5);box('GateLintel',0,8.3,z,16,1.4,5,'#a77f62',true);box('GateIcingArch',0,7.25,z,16,.45,5.3,'#ead4b5');for(const s of [-1,1]){box('GateChocolatePier',s*8.6,3.5,z,1.2,7,6,'#805951',true);sphere('GatePeppermintSeal',s*8.6,6.1,z+(z>0?3.1:-3.1),.75,'#bd7890');}gates.push({x:0,z,width:16,axis:'z'});walk('NorthSouthRampart',0,9.25,z,232,3.6);}
    for(const x of [-116,116]){wall(x,-53,5,110);wall(x,63,5,90);box('SideGateLintel',x,8.3,10,5,1.4,16,'#a77f62',true);for(const s of [-1,1])box('SideGatePillar',x,3.5,10+s*8.6,6,7,1.2,'#805951',true);gates.push({x,z:10,width:16,axis:'x'});walk('EastWestRampart',x,9.25,0,3.6,216);}
    for(const x of [-116,116])for(const z of [-108,108]){const bottom=floor(x,z)-.35;box('CornerTowerFoot',x,bottom/2,z,12,Math.abs(bottom)+.25,12,'#765650',true);tower(x,z,17);}
    for(let x=-110;x<=110;x+=5)for(const z of [-108,108]){box('CookieBattlement',x,10.05,z,2.9,1.6,5,'#bc966f',true);sphere('SugarBattlementCap',x,10.9,z,.65,'#e7d6bd',1,.45,1);}
    for(let z=-100;z<=100;z+=5)for(const x of [-116,116]){box('CookieBattlement',x,10.05,z,5,1.6,2.9,'#bc966f',true);}
    // The stair is on the inside, away from the gate and existing houses.
    const x=-107,z0=80,rise=9.25,run=34,count=Math.ceil(rise/.15);
    for(let i=0;i<count;i++){const top=(i+1)*rise/count,z=z0-(i+.5)*run/count;box('ChocolateRampartStair',x,top-.09,z,3.4,.18,run/count+.02,'#976f58');addBoxCollider(center.x+x,center.z+z,3.4,run/count+.02,center.y+top-.18,center.y+top,true);colliders.at(-1).name='candy-rampart-step';steps.push({x,z,y:top});for(const side of [-1,1])box('StairSugarHandrail',x+side*1.8,top+.65,z,.1,.1,run/count+.03,'#ead4b5',true);}
    walk('RampartLanding',-111.5,9.25,45,12,3.8);
    for(const [x,z] of [[-33,61],[32,65],[-34,-3],[69,3]]){box('SweetMarketCounter',x,.8,z,8,1.4,2.7,'#966951',true);for(const s of [-1,1])box('SweetMarketPole',x+s*4,1.6,z,.14,3.2,.14,'#886551',true);for(let i=0;i<8;i++)box(i%2?'MarketAwningCream':'MarketAwningRose',x-3.5+i,3.4,z,1,.2,4.5,i%2?'#e8d4b6':'#b77b98');for(let i=0;i<7;i++){sphere('DisplayMacaron',x-2.7+i*.85,1.7,z,.38,['#b787a1','#94b6a4','#d0b48a'][i%3],1,.55,1);sphere('MarketSugarJar',x-2.7+i*.85,2,z-.6,.25,'#c4d4d2',1,1.4,1);}}
    for(const z of [-3,34,65])for(const x of [-12,12]){box('CandyStreetLamp',x,2.2,z,.16,4.4,.16,'#816e70');sphere('SugarLamp',x,4.7,z,.5,'#edcf91');box('ParkBench',x*1.35,.65,z,3.5,.35,1.1,'#a37b62',true);box('ParkBenchBack',x*1.35,1.2,z-.48,3.5,.9,.15,'#795853',true);}
    for(const x of [-43,43]){box('RoyalFlowerBed',x,.25,-5,9,.3,4,'#8b6e66',true);for(let i=0;i<8;i++)sphere('RoyalJellyBloom',x-3.5+i,1,-5,.45,i%2?'#b9b68a':'#ba87aa',.8,1.2,.8);}
    box('RoyalPastryOven',-43,1.8,-49,5,3.6,4,'#855e53',true);box('OvenMouth',-43,1.4,-46.9,3,1.7,.15,'#403541');box('BakingTable',-43,1.1,-41,7,1.8,3,'#a98161',true);for(let i=0;i<8;i++)sphere('BakingCookie',-46+i*.8,2.1,-41,.33,'#cead79',1,.2,1);
    return {sections,gates,walkways,steps};
}
