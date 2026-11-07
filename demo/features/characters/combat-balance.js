/* All enemy health sinks use this once; enemy attacks on heroes are unchanged. */
function heroOutgoingDamage(amount,targetHealth){
    if(!Number.isFinite(amount)||amount<=0)return 0;
    const base=(window.volcanicValley?.equipped||window.weaponSystem?.equipped)?Math.max(240,Math.round(amount)):window.gearSystem?.ironEquipped?80:Math.max(1,Math.round(amount*.22));
    const damage=Math.round(base*(window.rageArmor?.multiplier??1)*(window.weaponSystem?.multiplier??1));
    if(Number.isFinite(targetHealth)&&targetHealth>0)window.weaponSystem?.onHit(Math.min(targetHealth,damage));
    return damage;
}
