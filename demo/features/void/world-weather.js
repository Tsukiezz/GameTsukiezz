/* Non-overlapping 15% weather checks, with active-play clocks and warning zones. */
/* Cooperative initializer: keep gameplay callbacks synchronous. */
async function installWorldWeather(){
    const root=new THREE.Group();root.name='CosmicWeather';scene.add(root);const hud=document.createElement('div');hud.id='world-weather';hud.hidden=true;gameHud.append(hud);
    const chance=.15,interval=120,durations={glass:180,meteor:180,comet:360,sandstorm:105,sun:240};
    const weights={glass:11,meteor:6,comet:20,sandstorm:18,sun:45};
    const descriptions={
        glass:'MƯA THỦY TINH · Tìm mái che hoặc mặc giáp bảo hộ',
        meteor:'THIÊN THẠCH · Né vòng cảnh báo',
        comet:'SAO CHỔI · Ngắm bầu trời',
        sandstorm:'BÃO CÁT · Thuốc tiên Minh Quang tăng tầm nhìn 70%',
        sun:'ÁNH MẶT TRỜI · Trời quang'
    };
    let kind=null,remaining=0,check=0,tick=0,age=0,impactTimer=0,shake=0,impacts=0;
    const warnings=[];
    const crystals=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.08),new THREE.MeshBasicMaterial({color:0xb9ddec,transparent:true,opacity:.7}),160);crystals.frustumCulled=false;crystals.visible=false;root.add(crystals);const dummy=new THREE.Object3D();
    const comet=new THREE.Group();root.add(comet);const core=new THREE.Mesh(new THREE.SphereGeometry(2,12,8),new THREE.MeshBasicMaterial({color:0xe0edff,fog:false}));comet.add(core);const tail=new THREE.Mesh(new THREE.ConeGeometry(4,65,12,1,true),new THREE.MeshBasicMaterial({color:0x839bdf,transparent:true,opacity:.38,side:THREE.DoubleSide,depthWrite:false,fog:false}));tail.rotation.z=Math.PI/2;tail.position.x=-32;comet.add(tail);comet.visible=false;
    const auroraUniforms={time:{value:0},strength:{value:0}},aurora=new THREE.Mesh(new THREE.SphereGeometry(1,32,20),new THREE.ShaderMaterial({side:THREE.BackSide,transparent:true,depthWrite:false,depthTest:false,fog:false,uniforms:auroraUniforms,
        vertexShader:'varying vec3 direction;void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader:`uniform float time;uniform float strength;varying vec3 direction;void main(){vec3 d=normalize(direction);float a=atan(d.x,d.z),h=d.y;
        float wave=.28+.09*sin(a*3.+time*.045)+.045*sin(a*8.-time*.07);float band=exp(-pow((h-wave)/.19,2.));
        float folds=pow(.5+.5*sin(a*31.+sin(a*7.+time*.09)*2.+h*11.),3.);float curtain=band*(.28+.72*folds);
        float pink=smoothstep(.22,.6,h+.11*sin(a*4.));vec3 c=mix(vec3(.16,.85,.39),vec3(.96,.29,.64),pink);c=mix(c,vec3(.91,1.,.95),pow(folds,5.)*.68);
        float sky=smoothstep(-.08,.18,h);float alpha=strength*sky*(.14+curtain*.68);gl_FragColor=vec4(c,alpha);}` }));
    aurora.name='CometPinkWhiteGreenAurora';aurora.renderOrder=-90;aurora.frustumCulled=false;aurora.visible=false;root.add(aurora);
    const daylight=new THREE.Mesh(new THREE.SphereGeometry(1,32,20),new THREE.ShaderMaterial({
        side:THREE.BackSide,depthWrite:false,depthTest:false,fog:false,
        vertexShader:'varying vec3 ray;void main(){ray=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader:`
            varying vec3 ray;
            void main() {
                vec3 d=normalize(ray);
                vec3 sun=normalize(vec3(-.57,.32,-.76));
                float horizon=pow(1.-clamp(d.y,0.,1.),2.);
                float angle=dot(d,sun);
                vec3 blue=mix(vec3(.12,.42,.76),vec3(.89,.66,.38),horizon);
                blue+=vec3(.58,.30,.10)*pow(max(0.,angle),18.);
                blue=mix(blue,vec3(1.,.85,.55),.80*pow(max(0.,angle),160.));
                blue=mix(blue,vec3(1.,.96,.82),smoothstep(.997,.9985,angle));
                gl_FragColor=vec4(blue,1.);
                #include <encodings_fragment>
            }
        `
    }));
    daylight.name='SunlitLunarSky';
    daylight.renderOrder=-95;daylight.frustumCulled=false;daylight.visible=false;
    const sunlight=new THREE.HemisphereLight(0xffdda2,0x6b86ae,0);
    sunlight.name='SolarWeatherLight';
    const dustPositions=new Float32Array(240*3),dustGeometry=new THREE.BufferGeometry();
    dustGeometry.setAttribute('position',new THREE.BufferAttribute(dustPositions,3).setUsage(THREE.DynamicDrawUsage));
    const dust=new THREE.Points(dustGeometry,new THREE.PointsMaterial({
        color:0xe0b172,size:.13,opacity:.48,transparent:true,depthWrite:false
    }));
    dust.name='SandstormDust';dust.frustumCulled=false;dust.visible=false;
    const dustFog=new THREE.Color(0x765e51),sunFog=new THREE.Color(0xa29580);
    const dustSky=new THREE.Mesh(new THREE.SphereGeometry(1,18,12),new THREE.MeshBasicMaterial({
        side:THREE.BackSide,color:dustFog,fog:false,depthTest:false,depthWrite:false
    }));
    dustSky.renderOrder=-95;dustSky.frustumCulled=false;dustSky.visible=false;
    root.add(daylight,sunlight,dust,dustSky);
    const active=()=>gameState.isPlaying&&!gameState.inDialogue&&!document.querySelector('.modal-overlay.active');
    function sheltered(){const p=playerGroup.position;if(window.undergroundNetwork?.inside(p)||window.voidDistrict?.inside(p)||evilCavern.inside(p)||inCastleEnvelope(p.x,p.z))return true;return colliders.some(c=>!c.disabled&&c.minY>p.y+PLAYER_HEIGHT&&c.minY<p.y+35&&c.maxX-c.minX>2&&c.maxZ-c.minZ>2&&p.x>c.minX&&p.x<c.maxX&&p.z>c.minZ&&p.z<c.maxZ);}
    const protectedArmor=()=>Boolean(technologyCraft.equippedArmor()&&gameState.armor>0);
    function stop(){kind=null;remaining=0;tick=0;impactTimer=0;crystals.visible=comet.visible=aurora.visible=daylight.visible=dust.visible=dustSky.visible=false;sunlight.intensity=0;auroraUniforms.strength.value=0;for(const w of warnings){root.remove(w.marker,w.rock);w.marker.geometry.dispose();w.marker.material.dispose();w.rock.geometry.dispose();w.rock.material.dispose();}warnings.length=0;hud.hidden=true;shake=0;}
    function start(type){if(kind||!Object.hasOwn(durations,type))return false;kind=type;remaining=durations[type];age=0;tick=0;impactTimer=type==='meteor'?1:0;showNotification(descriptions[kind]);return true;}
    function roll(random=Math.random){
        if(kind||random()>=chance)return false;
        let value=random()*100;
        for(const [type,weight] of Object.entries(weights)){
            value-=weight;
            if(value<0)return start(type);
        }
        return false;
    }
    function warn(position=playerGroup.position){const target=position.clone();target.y=worldSurface.height(target.x,target.z);const marker=new THREE.Mesh(new THREE.RingGeometry(10.5,11.5,48),new THREE.MeshBasicMaterial({color:0xff7254,side:THREE.DoubleSide,transparent:true,opacity:.8,depthWrite:false}));marker.position.copy(target).y+=.08;marker.rotation.x=-Math.PI/2;const rock=new THREE.Mesh(new THREE.IcosahedronGeometry(2.8,0),new THREE.MeshStandardMaterial({color:0x4d3e4d,emissive:0xa34c27,emissiveIntensity:.7,roughness:1}));rock.position.copy(target).y+=130;root.add(marker,rock);warnings.push({target,marker,rock,timer:4});return warnings.at(-1);}
    function impact(w){impacts++;shake=.85;window.combatEffects?.burst(w.target,0xffa15c,8);const p=playerGroup.position;if(!sheltered()&&Math.hypot(p.x-w.target.x,p.z-w.target.z)<11.5&&Math.abs(p.y-w.target.y)<30)playerLife.hurt(protectedArmor()?48:180,true,'Thiên thạch va chạm');root.remove(w.marker,w.rock);w.marker.geometry.dispose();w.marker.material.dispose();w.rock.geometry.dispose();w.rock.material.dispose();}
    function update(dt){if(!active())return;dt=Math.min(.1,Math.max(0,dt));if(!kind){check+=dt;if(check>=interval){check=0;roll();}return;}age+=dt;remaining-=dt;if(remaining<=0){stop();return;}hud.hidden=false;hud.textContent=descriptions[kind]+' · '+Math.ceil(remaining)+'s';const p=playerGroup.position;
        crystals.visible=kind==='glass'&&!sheltered();if(crystals.visible){for(let i=0;i<160;i++){dummy.position.set(p.x+Math.sin(i*137.5)*22,p.y+2+((i*.73-age*16)%28+28)%28,p.z+Math.cos(i*97.1)*22);dummy.rotation.set(age+i,.5,i*.4);dummy.scale.set(1,3,1);dummy.updateMatrix();crystals.setMatrixAt(i,dummy.matrix);}crystals.instanceMatrix.needsUpdate=true;tick+=dt;if(tick>=1){tick-=1;if(!protectedArmor())playerLife.hurt(7,false,'Mưa thủy tinh');}}
        comet.visible=kind==='comet';aurora.visible=comet.visible;auroraUniforms.time.value=age;auroraUniforms.strength.value=comet.visible?Math.min(1,age/5,remaining/5):0;if(comet.visible){comet.position.copy(camera.position).add(new THREE.Vector3(180*Math.sin(age*.003)-90,190, -230));comet.rotation.z=.3;}
        if(kind==='meteor'){impactTimer-=dt;if(impactTimer<=0){impactTimer=12;if(!sheltered())warn();}for(let i=warnings.length-1;i>=0;i--){const w=warnings[i];w.timer-=dt;w.rock.position.y=w.target.y+Math.max(0,w.timer/4)*130;w.rock.rotation.x+=dt;w.marker.material.opacity=.4+.4*Math.sin(age*8)**2;if(w.timer<=0){impact(w);warnings.splice(i,1);}}}shake=Math.max(0,shake-dt);
    }
    function environment(){
        const visible=gameState.isPlaying&&kind!==null&&!document.body.classList.contains('is-underwater');
        const outdoors=visible&&(kind==='sandstorm'||kind==='sun'||kind==='comet')&&!sheltered();
        daylight.visible=outdoors&&kind==='sun';
        dust.visible=outdoors&&kind==='sandstorm';
        dustSky.visible=dust.visible;
        stars.visible=!daylight.visible&&!dust.visible;
        if(window.realmScenery)window.realmScenery.sky.visible=stars.visible;
        comet.visible=aurora.visible=outdoors&&kind==='comet';
        const blend=Math.min(1,age/3,remaining/3);
        sunlight.intensity=daylight.visible?.72*blend:0;
        if(daylight.visible){
            daylight.position.copy(camera.position);
            daylight.scale.setScalar(camera.far*.88);
            scene.fog.color.lerp(sunFog,blend);
        }
        if(dust.visible){
            // Fog distance is inversely proportional to density.
            const clear=Boolean(window.templeSupplies?.visionActive);
            const density=.19/(clear?1.7:1);
            scene.fog.color.lerp(dustFog,blend);
            scene.fog.density=THREE.MathUtils.lerp(scene.fog.density,density,blend);
            dustSky.position.copy(camera.position);
            dustSky.scale.setScalar(camera.far*.88);
            dust.position.copy(camera.position);
            const wrap=(x,size)=>((x%size)+size)%size;
            for(let i=0;i<dustPositions.length;i+=3){
                dustPositions[i]=wrap(i*1.617+age*10,16)-8;
                dustPositions[i+1]=wrap(i*.787-age*1.8,9)-3;
                dustPositions[i+2]=wrap(i*1.381+age*4,16)-8;
            }
            dust.material.opacity=(clear?.23:.56)*blend;
            dustGeometry.attributes.position.needsUpdate=true;
            if(window.mercuryLake?.water?.material.uniforms)mercuryLake.water.material.uniforms.fogDensity.value=scene.fog.density;
            for(const mesh of window.riverRealm?.waterMeshes||[])if(mesh.material.uniforms.fogDensity)mesh.material.uniforms.fogDensity.value=scene.fog.density;
        }
    }
    window.worldWeather={root,hud,aurora,auroraUniforms,chance,interval,durations,weights,start,stop,roll,warn,impact,sheltered,protectedArmor,update,environment,get kind(){return kind;},get remaining(){return remaining;},get impacts(){return impacts;},get warnings(){return warnings;},camera(){aurora.position.copy(camera.position);aurora.scale.setScalar(camera.far*.8);if(shake>0&&active())camera.position.add(new THREE.Vector3(Math.sin(age*91),Math.cos(age*83),0).multiplyScalar(shake*.25));}};
}
