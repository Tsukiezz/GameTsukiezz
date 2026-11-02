(()=>{
 // A temporary tournament runs the actual AI update on the actual arena floor.
 // It cannot alter the live tournament, its gate, saved medals or inventory rows.
 const checks=[],live=romanArena,previous=localStorage.getItem('tsuventure_arena_tournament_v1'),position=playerGroup.position.clone(),render=inventoryWorkspace.render;
 const arena={center:live.center.clone(),floor:live.floor,region:live.region,point:live.point,blocked:()=>false,tunnels:live.tunnels.map(t=>({...t,collider:{...t.collider},gate:t.gate.clone(true)}))};
 try{
  localStorage.setItem('tsuventure_arena_tournament_v1',JSON.stringify({completed:3}));inventoryWorkspace.render=()=>{};installArenaTournament(arena);const t=arena.tournament,b=t.opponent,p=arena.center.clone().setY(arena.floor);gameState.inDialogue=false;document.querySelectorAll('.modal-overlay.active').forEach(m=>closeModal(m.id));playerGroup.position.copy(p).z+=30;b.group.position.copy(p);b.state='pursue';b.cooldown=b.special=999;b.enrage=10;
  for(let i=0;i<5;i++)t.update(.1);const fast=b.group.position.distanceTo(p);b.group.position.copy(p);b.enrage=0;for(let i=0;i<5;i++)t.update(.1);const normal=b.group.position.distanceTo(p);checks.push({name:'Actual T-rex pursuit becomes 70 percent faster during roar',ok:fast>normal*1.65&&fast<normal*1.75,detail:{fast,normal}});
 }finally{
  arena.tournament?.clearThreats();if(arena.tournament){scene.remove(arena.tournament.root);arena.tournament.hud.remove();arena.tournament.rows.forEach(r=>r.remove());}if(previous===null)localStorage.removeItem('tsuventure_arena_tournament_v1');else localStorage.setItem('tsuventure_arena_tournament_v1',previous);inventoryWorkspace.render=render;playerGroup.position.copy(position);inventoryWorkspace.render();
 }
 checks.push({name:'Independent movement check preserves actual medals',ok:romanArena.tournament.completed===5&&localStorage.getItem('tsuventure_arena_tournament_v1')===previous});return {checks};
})()
