/* Original woodland voices/foley, pooled through the existing SFX master bus. */
(() => {
    const buffers=new Map(),loading=new Map(),voices=new Set(),recent=new WeakMap();let steps=new WeakMap();
    const actions={guardian:['emerge','roar','skill','ultimate','attack','move','death'],spirit:['emerge','roar','attack','move','death']};
    const stats={played:0,culled:0,byEvent:{}};let epoch=0;
    const enabled=()=>gameState.isPlaying&&!gameState.inDialogue&&!document.hidden&&!document.querySelector('.modal-overlay.active')&&!sfx.muted&&!window.tsuventureSettings?.muted&&Number(window.tsuventureSettings?.sfx??90)>0;
    function load(actor,action){const key=actor+'-'+action;if(buffers.has(key))return Promise.resolve(buffers.get(key));if(loading.has(key))return loading.get(key);
        const request=fetch('features/forest/assets/audio/'+key+'.wav').then(r=>{if(!r.ok)throw Error(key);return r.arrayBuffer();}).then(a=>sfx.ctx.decodeAudioData(a)).then(b=>{buffers.set(key,b);return b;}).catch(()=>null);loading.set(key,request);return request;
    }
    function warm(){if(!sfx.ctx)return;for(const [actor,list] of Object.entries(actions))for(const action of list)load(actor,action);}
    function unlock(){if(!sfx.ctx)return;sfx.ctx.resume().catch(()=>{});warm();}
    for(const event of ['pointerdown','keydown'])document.addEventListener(event,unlock,{passive:true});
    function stop(){epoch++;for(const v of voices){try{v.source.stop();}catch{}}voices.clear();steps=newWeakSteps();}
    function newWeakSteps(){return new WeakMap();}
    // Track playback by simulation time so idle actors never chatter every frame.
    function play(actor,action,position,owner=null){
        if(!actions[actor]?.includes(action)||!enabled()||!sfx.ctx||sfx.ctx.state!=='running')return false;
        const distance=playerGroup.position.distanceTo(position),range=action==='move'?22:actor==='guardian'?65:36;
        if(distance>=range){stats.culled++;return false;}
        if(owner){let map=recent.get(owner);if(!map){map={};recent.set(owner,map);}const now=sfx.ctx.currentTime;if(now-(map[action]??-100)<(action==='move'?.25:.12))return false;map[action]=now;}
        if(voices.size>=12){if(action==='move')return false;const quiet=[...voices].find(v=>v.action==='move')||voices.values().next().value;quiet.source.stop();voices.delete(quiet);}
        const ticket=epoch;
        const emit=buffer=>{
            if(!buffer||ticket!==epoch||!enabled()||sfx.ctx.state!=='running'||voices.size>=12)return;
            const ctx=sfx.ctx,source=ctx.createBufferSource(),gain=ctx.createGain(),pan=ctx.createStereoPanner();source.buffer=buffer;source.playbackRate.value=owner?.voicePitch||1;
            gain.gain.value=(action==='move'?.1:actor==='guardian'?.48:.3)*Math.pow(1-distance/range,1.5);
            const d=position.clone().sub(playerGroup.position),right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0);pan.pan.value=THREE.MathUtils.clamp(d.normalize().dot(right)*.8,-.8,.8);
            source.connect(gain);gain.connect(pan);pan.connect(sfx.sfxGain);const v={source,gain,pan,action};voices.add(v);source.onended=()=>{voices.delete(v);source.disconnect();gain.disconnect();pan.disconnect();};source.start();stats.played++;stats.byEvent[actor+'-'+action]=(stats.byEvent[actor+'-'+action]||0)+1;
        };const cached=buffers.get(actor+'-'+action);if(cached)emit(cached);else load(actor,action).then(emit);return true;
    }
    function movement(actor,owner,position,dt){let step=steps.get(owner);if(!step){step={last:position.clone(),distance:0};steps.set(owner,step);return;}const d=position.distanceTo(step.last);step.last.copy(position);if(d>4||dt<=0){step.distance=0;return;}step.distance+=d;const stride=actor==='guardian'?2.6:.9;if(d>.001&&step.distance>=stride){step.distance%=stride;play(actor,'move',position,owner);}}
    // Existing UI pauses use the same preferences. Stop tails immediately on mute.
    window.addEventListener('tsuventure-settings-saved',()=>{if(!enabled())stop();});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
    function update(){if(voices.size&&!enabled())stop();}
    window.forestAudio={play,movement,stop,warm,load,update,actions,buffers,stats,get voices(){return voices.size;}};
})();
