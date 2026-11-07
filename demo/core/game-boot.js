/* Local staged startup. The progress bar advances on completed work, never a timer. */
(() => {
    const loaderScript=document.currentScript,manifestUrl=loaderScript.dataset.bootManifest;
    const overlay=document.getElementById('game-loading'),stage=document.getElementById('boot-stage'),percent=document.getElementById('boot-percent'),bar=document.getElementById('boot-progress'),fill=document.getElementById('boot-fill');
    const lobbyVideo=document.getElementById('lobby-video');if(lobbyVideo){lobbyVideo.autoplay=false;lobbyVideo.pause();lobbyVideo.preload='none';}
    const state={ready:false,failed:false,percent:0,history:[{percent:0,at:performance.now()}],steps:[],assets:{loaded:0,total:0},yields:0,maxHeartbeatDelay:0};
    state.frames=0;function paintTick(){state.frames++;if(!state.ready&&!state.failed)requestAnimationFrame(paintTick);}requestAnimationFrame(paintTick);
    let lastYield=performance.now(),lastBeat=performance.now(),lastStep=null,manager=null,assetErrors=[],phaseStart=20,phaseSpan=0;
    const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
    const heartbeat=setInterval(()=>{const now=performance.now();state.maxHeartbeatDelay=Math.max(state.maxHeartbeatDelay,now-lastBeat);lastBeat=now;},100);
    try{new PerformanceObserver(list=>{for(const entry of list.getEntries()){state.longTasks??=[];if(state.longTasks.length<300)state.longTasks.push({start:entry.startTime,duration:entry.duration});}}).observe({entryTypes:['longtask']});}catch{}
    function progress(value,label){value=Math.max(state.percent,Math.min(100,Math.floor(value)));if(value!==state.percent){state.percent=value;state.history.push({percent:value,at:performance.now()});}percent.textContent=value+'%';bar.setAttribute('aria-valuenow',String(value));fill.style.width=value+'%';if(label)stage.textContent=label;}
    async function yieldUI(){state.yields++;await sleep(0);lastYield=performance.now();}
    function shouldYield(){return performance.now()-lastYield>=12;}
    async function checkpoint(done,total,label,weight=1){
        const now=performance.now();if(lastStep){lastStep.ms=now-lastStep.at;state.steps.push(lastStep);}lastStep={label,step:done,at:now};
        phaseStart=20+72*done/total;phaseSpan=72*weight/total;progress(phaseStart,label);if(shouldYield())await yieldUI();
    }
    function fail(error){if(state.failed)return;state.failed=true;state.error=error?.message||String(error);state.errorStack=error?.stack||state.error;clearInterval(heartbeat);overlay.classList.remove('boot-finished');overlay.hidden=false;overlay.setAttribute('aria-busy','false');stage.textContent='Chưa thể tải xong game';overlay.querySelector('.boot-caption').textContent='Không tải được một phần dữ liệu. Bạn có thể thử tải lại.';const retry=document.getElementById('boot-retry');retry.hidden=false;retry.onclick=()=>location.reload();console.error('Tsuventure startup:',error);}
    window.addEventListener('error',event=>{if(!state.ready&&event.error)fail(event.error);});
    window.addEventListener('unhandledrejection',event=>{if(!state.ready)fail(event.reason);});
    // Prevent partially initialized controls from receiving input behind the curtain.
    for(const type of ['keydown','keyup','mousedown','pointerdown','wheel'])window.addEventListener(type,event=>{if(!state.ready&&!event.target?.closest?.('#boot-retry')){event.stopImmediatePropagation();if(event.cancelable)event.preventDefault();}}, {capture:true,passive:false});
    function trackTextures(){
        manager=THREE.DefaultLoadingManager;const oldStart=manager.onStart,oldProgress=manager.onProgress,oldError=manager.onError;
        manager.onStart=(url,loaded,total)=>{state.assets={loaded,total};oldStart?.(url,loaded,total);};
        manager.onProgress=(url,loaded,total)=>{state.assets={loaded,total};oldProgress?.(url,loaded,total);};
        manager.onError=url=>{assetErrors.push(url);oldError?.(url);};
    }
    async function loadScript(src){
        await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.async=false;script.onload=resolve;script.onerror=()=>reject(Error('Không tải được '+src.split('?')[0]));document.body.append(script);});
        if(src.split('?')[0]==='vendor/three-r128.min.js')trackTextures();
        if(src.split('?')[0]==='core/runtime.js'){if(!window.gameBoot.initialization)throw Error('Thiếu tiến trình khởi tạo');await window.gameBoot.initialization;}
        if(state.failed)throw Error(state.error);
    }
    async function waitTextures(){
        const deadline=performance.now()+120000;
        while(state.assets.loaded<state.assets.total){if(performance.now()>deadline)throw Error('Tải hình ảnh quá thời gian chờ');if(assetErrors.length)throw Error('Không tải được '+assetErrors[0]);await sleep(25);}
        if(assetErrors.length)throw Error('Không tải được '+assetErrors[0]);
        const required=[...document.images].filter(image=>image.getAttribute('src')&&!image.src.startsWith('data:'));
        await Promise.all(required.map(image=>image.decode().catch(()=>{throw Error('Không đọc được hình '+image.getAttribute('src'));})));
    }
    async function warmFirstFrame(){
        // Apply the chosen profile to lights added by later construction stages too.
        setGraphicsProfile(currentProfileKey);
        const limit=graphicsProfiles[currentProfileKey].lightDistance;
        for(const item of dynamicLights){const light=item.light,lx=light.parent?light.parent.position.x+light.position.x:light.position.x,lz=light.parent?light.parent.position.z+light.position.z:light.position.z,range=Math.min(item.maxDist,limit);light.visible=currentProfileKey!=='low'&&(playerGroup.position.x-lx)**2+(playerGroup.position.z-lz)**2<=range*range;}
        scene.updateMatrixWorld(true);
        const lights=[],objects=[];scene.traverseVisible(object=>{if(object.isLight)lights.push(object);if(object.material)objects.push(object);});
        // Three r128 compile() traverses even hidden map geometry. Compile only
        // visible objects, in small batches, keeping the original scene and parents.
        const warmScene=scene.clone(false);let batch=[];
        warmScene.traverseVisible=callback=>{callback(warmScene);for(const light of lights)callback(light);};
        warmScene.traverse=callback=>{callback(warmScene);for(const object of batch)callback(object);};
        for(let i=0;i<objects.length;i+=24){batch=objects.slice(i,i+24);renderer.compile(warmScene,camera);progress(96+2*Math.min(1,(i+24)/objects.length),'Chuẩn bị khung cảnh đầu tiên');await yieldUI();}
        warmScene.traverse=callback=>callback(warmScene);warmScene.traverseVisible=warmScene.traverse;
        renderer.render(scene,camera);await yieldUI();
    }
    async function start(){
        // Give the real game backdrop and 0% a complete paint before loading JS.
        await sleep(80);progress(0,'Chuẩn bị hành trình');
        const response=await fetch(manifestUrl,{cache:'no-cache'});if(!response.ok)throw Error('Không tải được danh sách dữ liệu game');const manifest=await response.json();
        const initIndex=manifest.scripts.findIndex(src=>src.split('?')[0]==='core/runtime.js');
        for(let i=0;i<manifest.scripts.length;i++){
            if(i<=initIndex)progress(20*i/(initIndex+1),'Tải dữ liệu vương quốc');
            await loadScript(manifest.scripts[i]);if(shouldYield())await yieldUI();
        }
        progress(93,'Hoàn thiện hình ảnh và vật phẩm');await yieldUI();await waitTextures();
        progress(96,'Chuẩn bị khung cảnh đầu tiên');await yieldUI();
        await warmFirstFrame();progress(98,'Mở cánh cổng hành trình');
        progress(100,'Sẵn sàng khám phá');overlay.setAttribute('aria-busy','false');
        await sleep(400);state.ready=true;state.readyAt=performance.now();clearInterval(heartbeat);
        clock.start();animate();document.body.classList.remove('game-loading');overlay.classList.add('boot-finished');
        await sleep(350);overlay.hidden=true;window.dispatchEvent(new CustomEvent('tsuventure-ready'));
    }
    window.gameBoot={state,progress,checkpoint,taskProgress(done,total){progress(phaseStart+phaseSpan*done/total);},shouldYield,yield:yieldUI,initialize:async work=>{await yieldUI();await work();},get ready(){return state.ready;}};
    start().catch(fail);
})();
