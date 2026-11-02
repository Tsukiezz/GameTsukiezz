function installRageArmor(){
    let until=0;const badge=document.createElement('div');badge.id='rage-armor-buff';badge.hidden=true;badge.style.cssText='font-size:11px;color:#ed997f;margin-top:6px';document.querySelector('.hud-bars').append(badge);
    function onDamage(cause){if(!window.technologyCraft?.state.rageEquipped||!cause)return;const text=String(cause);if(/đói|ôxy|oxy|rơi|thiên thạch|thủy tinh|dung nham|chảy máu|không xác định/i.test(text))return;until=Date.now()+30000;}
    window.rageArmor={onDamage,get active(){return technologyCraft.state.rageEquipped&&Date.now()<until;},get multiplier(){return this.active?1.3:1;},get remaining(){return this.active?Math.ceil((until-Date.now())/1000):0;},update(){badge.hidden=!this.active;badge.textContent='CUỒNG NỘ · +30% sát thương · '+this.remaining+'s';}};
}
