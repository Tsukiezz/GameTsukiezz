/* All enemy health sinks use this once; enemy attacks on heroes are unchanged. */
function heroOutgoingDamage(amount){
    if(!Number.isFinite(amount)||amount<=0)return 0;
    const base=window.volcanicValley?.equipped?Math.max(240,Math.round(amount)):Math.max(1,Math.round(amount*.22));
    return Math.round(base*(window.rageArmor?.multiplier??1));
}
