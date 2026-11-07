/* Impact damage is based on real airborne height, never on teleport distance. */
/* Cooperative initializer: keep gameplay callbacks synchronous. */
async function installPlayerLife(){
    const spawn=new THREE.Vector3(0,getGroundElevation(0,10,0),10);let peak=null,immune=0,deaths=0,pendingCause=null,lastDamage=null,lastDeath=null,noticeTimer=null;
    const protectedOnTrain=()=>Boolean(window.moonRailway?.aboard);
    const monsterDamageMultiplier=1.5, monsterCriticalChance=.15, piercingHealthShare=.30;
    const causes={guardian:'Thần Rừng tấn công',lake_monster:'Quái vật hồ Thủy Ngân tấn công',cave_guard:'Cận vệ Thần Ác tấn công',cave_curse:'Lời nguyền trong hang Thần Ác',sphinx:'Nhân Sư tấn công',poison:'Nọc độc trong kim tự tháp',lava:'Bỏng lửa và dung nham',volcano_monster:'Quái vật Thung Lũng Núi Lửa',wolf:'Sói Nguyệt Tuyền tấn công',crocodile:'Cá sấu đầm lầy tấn công',aerial:'Đạn tấn công của quái vật',hunger:'Đói kiệt sức',oxygen:'Hết ôxy dưới nước',bleed:'Chảy máu',sabertooth:'Hổ răng kiếm Bạch Khuyết tấn công',minion:'Quái chú lùn tấn công',forest_spirit:'Sinh Linh Cây Cối tấn công',snow_queen:'Nữ Chúa Tuyết tấn công',candy_boss:'Chúa Sâu Răng tấn công'};
    function formatCause(cause){return causes[cause]||cause?.text||cause||'Thương tích không xác định';}
    function noteDamage(cause){pendingCause=formatCause(cause);}
    // Keep the train guard for direct writes such as oxygen loss and collision.
    let health=gameState.health;
    Object.defineProperty(gameState,'health',{enumerable:true,configurable:true,get:()=>health,set(next){
        next=Number(next);
        if(!Number.isFinite(next))return;
        if(next<health&&protectedOnTrain()){pendingCause=null;return;}
        if(next<health)lastDamage={cause:pendingCause||'Thương tích không xác định',time:Date.now()};
        pendingCause=null;
        health=next;
    }});
    const notice=document.createElement('section');notice.id='death-notice';notice.className='death-notice';notice.setAttribute('role','alert');notice.hidden=true;notice.innerHTML='<strong>BẠN ĐÃ GỤC NGÃ</strong><p></p><small>Đã hồi sinh tại điểm xuất phát.</small><button type="button">Đóng · Enter</button>';document.body.append(notice);
    function dismissDeath(){notice.hidden=true;clearTimeout(noticeTimer);}
    notice.querySelector('button').onclick=dismissDeath;
    function protectTrain(){resetFall();window.combatEffects?.clearPlayerThreats();window.lakeMonsters?.pause();window.forestGuardian?.pause();window.monsterSkills?.pause();window.desertRealm?.release();window.desertRealm?.clearPoison();window.snowQueen?.release();window.candyRealm?.release();window.riverRealm?.pause?.();window.volcanicValley?.pause?.();window.evilCavern?.pause?.();pendingCause=null;}
    function resetFall(){peak=null;}
    function die(cause){if(protectedOnTrain()||immune>0&&gameState.health>0)return false;const reason=cause?formatCause(cause):lastDamage?.cause||'Thương tích không xác định';lastDeath={cause:reason,position:playerGroup.position.toArray(),time:Date.now()};deaths++;immune=3;resetFall();window.forestGuardian?.releaseRoots();window.moonRailway?.leaveForRespawn();window.riverBoat?.packForTravel();window.santaGifts?.pause();window.monsterSkills?.pause();window.snowQueen?.release();window.candyRealm?.release();window.desertRealm?.release();window.desertRealm?.clearPoison();window.crystalWings?.stopFlight();window.monsterCamps?.restoreHunger();Object.assign(gameState,{health:gameState.maxHealth,stamina:100,oxygen:100});resetGameplayInput();fastTravelTo(spawn.x,spawn.z,'Điểm xuất phát',spawn.y);castleSafeAnchor=null;isSitting=false;playerGroup.visible=true;window.worldSurface?.resetCamera();updatePlayerVitals();notice.querySelector('p').textContent='Nguyên nhân: '+reason;notice.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(dismissDeath,7000);showNotification('Bạn đã gục ngã · '+reason);return true;}
    function applyDamage(amount, useArmor, cause, monster=false, special=false){
        if(protectedOnTrain()||!gameState.isPlaying||gameState.inDialogue||document.querySelector('.modal-overlay.active')||immune>0||!Number.isFinite(amount)||amount<=0)return false;
        const taken=useArmor?heroIncomingDamage(amount):amount;
        const piercing=monster&&(special||Math.random()<monsterCriticalChance);
        if(monster)window.rageArmor?.onDamage();
        const shieldDamage=piercing?taken*(1-piercingHealthShare):taken;
        const absorbed=useArmor?(window.gearSystem?.absorbArmor(shieldDamage)??0):0;
        noteDamage(cause);
        gameState.health=Math.max(0,gameState.health-(taken-absorbed));
        if(gameState.health<=0)die();else updatePlayerVitals();
        return true;
    }
    function hurt(amount,useArmor=true,cause='Thương tích không xác định'){
        return applyDamage(amount,useArmor,cause);
    }
    function hitMonster(amount,cause,{special=false}={}){
        return applyDamage(amount*monsterDamageMultiplier,true,cause,true,special);
    }
    function sample(previous,next,landed){if(immune>0||crystalWings.flying||moonRailway.aboard||riverBoat.aboard||playerSurvival.swimming){resetFall();return;}if(!isGrounded||landed)peak=Math.max(peak??previous,previous,next);if(landed){const distance=(peak??previous)-next;resetFall();if(distance>4){const damage=window.gearSystem?.fallDamage(Math.round((distance-4)*11))??Math.round((distance-4)*11);const before=deaths;hurt(damage,false,'Rơi từ độ cao '+distance.toFixed(1)+' m');if(deaths===before)showNotification('Rơi '+distance.toFixed(1)+' m · −'+damage+' máu');}}}
    function update(dt){immune=Math.max(0,immune-dt);if(gameState.health<=0)die();}
    window.playerLife={spawn,die,hurt,hitMonster,monsterCriticalChance,sample,resetFall,update,noteDamage,protectTrain,dismissDeath,notice,get lastDeath(){return lastDeath;},get targetable(){return !protectedOnTrain()&&gameState.health>0;},get protectedOnTrain(){return protectedOnTrain();},get deaths(){return deaths;},get immune(){return immune;}};
}
