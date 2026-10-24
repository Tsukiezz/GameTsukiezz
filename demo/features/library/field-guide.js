/* Encounter journal: only discovered entries reveal their identity and details. */
function installFieldGuide(){
    const storageKey='tsuventure_field_guide_v1',catalog=[];
    const text=(vi,en)=>({vi,en}),lang=()=>window.tsuventureSettings?.language||'vi';
    const tr=value=>typeof value==='object'?value[lang()]:(window.tsuventureSettings?.translate(value)||value);
    for(const model of LAKE_MONSTER_DATA.models)catalog.push({id:model.id,type:'monsters',name:model.name,icon:model.id==='ness'?'🐉':'🐊',
        description:model.id==='ness'?text('Cổ dài, da bọc giáp và hàm răng nhọn. Tuần tra rồi ngụp xuống vực thủy ngân. Chỉ săn người đang ở trong nước.','A plated, long-necked predator with needle teeth. Patrols and dives into the mercury abyss. Only hunts players in water.'):text('Cá sấu khổng lồ với gai vũ trụ và hàm lớn. Bơi ngầm và truy đuổi người ở dưới nước. Bờ và cầu đá là nơi tránh đòn.','A colossal crocodile with cosmic spines and enormous jaws. Swims below and pursues swimmers. The shore and stone bridge are safe.'),
        detail:()=>`${model.maxHealth} HP · ${model.detect} m · `+tr(text('Tầm phát hiện','Detection range'))});
    catalog.push({id:'forest_guardian',type:'monsters',name:text('Thần Rừng','Forest Guardian'),description:text('Quái vật vỏ cây ngụy trang giữa Rừng Nguyên Sinh. Thức tỉnh khi có người đến gần và trở lại dạng cây khi họ rời xa.','A bark giant disguised among the trees of the Primordial Forest. Awakens near intruders and returns to tree form when they leave.'),detail:()=> '7000 HP'});
    for(const [kind,vi,en] of [['frog','Ếch rừng','Forest frog'],['rabbit','Thỏ rừng','Forest rabbit'],['pig','Heo rừng hiền','Peaceful forest pig'],['horse','Ngựa rừng','Forest horse']])catalog.push({id:'wildlife_'+kind,type:'wildlife',name:text(vi,en),description:text('Sinh vật hiền lành sống trong Rừng Nguyên Sinh, đi quanh những khoảng trống giữa cây.','A harmless inhabitant of the Primordial Forest, wandering between the trees.')});
    catalog.push({id:'royal_guards',type:'npcs',name:text('Lính gác hoàng gia','Royal gatekeepers'),icon:'🛡',description:text('Hai lính gác ở cổng lâu đài. Nhấn E gần cổng để họ mở hoặc đóng cửa.','Two castle gatekeepers. Press E near the gate to have them open or close it.')});
    catalog.push({id:'lunar_unicorn',type:'npcs',name:text('Kỳ lân Nguyệt Quang','Moonlight unicorn'),icon:'🦄',description:text('Sinh vật hiền hòa trong lâu đài, khác với quái vật chiến đấu dưới hồ.','A peaceful creature inside the castle, unlike the hostile lake bosses.')});
    landmarksData.forEach((landmark,index)=>catalog.push({id:'place_'+index,type:'places',name:landmark.name,icon:landmark.icon,landmark,
        description:text('Địa điểm đã bắt gặp trong hành trình khám phá thế giới mặt trăng.','A location encountered while exploring the moonlit realm.')}));
    const additions=[
        ['space_sabertooth','monsters','Hổ Răng Kiếm Không Gian','Space sabertooth','Ẩn mình và di chuyển giữa các sườn Núi Bạch Khuyết.','Roams hidden among the slopes of Mount Bach Khuyet.','3600 HP · Cắn thường: 18 · Cắn xé: 40 + chảy máu 4/giây trong 8 giây. Né vòng hồng trước khi hổ vồ.','3600 HP · Bite: 18 · Rend: 40 + bleeding for 4/sec over 8 seconds. Dodge the pink warning circle.'],
        ['speed_wolf','monsters','Sói Tốc Độ','Speed wolf','Thú săn mồi di chuyển khắp núi Nguyệt Tuyền, từ chân núi theo đường mòn lên rừng anh đào và suối nóng.','A predator roaming Moonwell Mountain, following the trail between its foothills, cherry groves, and summit hot spring.','2400 HP · Cắn thường: 16 · Vồ cắn: 36 và choáng 1,4 giây. Né khỏi hướng lao đã báo trước.','2400 HP · Bite: 16 · Rush bite: 36 and a 1.4-second stun. Dodge its telegraphed charge.'],
        ['forest_sapling','monsters','Sinh Linh Cây Cối','Summoned sapling','Sinh linh do Thần Rừng triệu hồi từ lòng đất tại Rừng Nguyên Sinh.','A plant spirit summoned from the ground by the Forest Guardian.','190 HP · Đánh thường: 12 · Trồi lên trong 1,4 giây, truy đuổi rồi biến mất sau 17 giây.','190 HP · Attack: 12 · Emerges over 1.4 seconds, pursues intruders, and expires after 17 seconds.'],
        ['red_rumped_monkey','wildlife','Khỉ Đít Đỏ','Red-rumped monkey','Sinh vật hiền lành sống trên bờ khô quanh Suối Nước Nóng Nguyệt Tuyền.','A harmless monkey living on the dry banks of Moonwell Hot Spring.'],
        ['river_fish_0','wildlife','Cá Nguyệt Kim','Moon goldfish','Cá ánh vàng bơi theo đàn trong các nhánh sông và suối nóng.','Golden fish schooling in the river branches and hot spring.'],
        ['river_fish_1','wildlife','Cá Vảy Lam','Blue-scale fish','Cá vảy xanh sinh sống dưới dòng sông dẫn đến Hồ Thủy Ngân.','Blue fish inhabiting the river flowing into Mercury Lake.'],
        ['river_fish_2','wildlife','Cá Vảy Hồng','Rose-scale fish','Cá màu hồng sống xen giữa các đàn cá và thực vật thủy sinh.','Rose-colored fish swimming among other schools and aquatic plants.'],
        ['river_kelp','wildlife','Tảo Bẹ Nguyệt Tuyền','Moonwell kelp','Những dải tảo lay động dưới đáy sông, tạo nơi trú cho các đàn cá.','Swaying kelp on the riverbed provides shelter for schools of fish.'],
        ['thermal_coral','wildlife','San Hô Suối Nóng','Thermal coral','Sinh vật san hô kỳ ảo phát triển dưới làn nước của vùng Nguyệt Tuyền.','Fantastical coral growing beneath the waters of the Moonwell region.']
    ];
    for(const [id,type,vi,en,dvi,den,skillVi,skillEn] of additions)catalog.push({id,type,name:text(vi,en),description:text(dvi,den),...(skillVi?{detail:()=>tr(text(skillVi,skillEn))}:{})});
    const skills={
        ness:text('Đánh thường: 38 · Cầu năng lượng: 78, báo trước 1,4 giây. Né sang bên hoặc lên cầu, bờ hồ.','Basic attack: 38 · Energy orb: 78, telegraphed for 1.4 seconds. Dodge sideways or reach the shore or bridge.'),
        space_croc:text('Đánh thường: 28 · Ngoạm: 68, giữ 1,3 giây rồi nhả ra. Rời vòng đỏ trước khi hàm khép lại.','Basic attack: 28 · Capture bite: 68, holds for 1.3 seconds then releases. Leave the red warning circle.'),
        forest_guardian:text('Đánh thường: 32 · Triệu hồi tối đa 4 sinh linh cây, hồi chiêu 16 giây. Tránh vòng xanh và tiêu diệt các sinh linh.','Basic attack: 32 · Summons up to 4 saplings, with a 16-second cooldown. Avoid green circles and defeat the summons.')
    };
    for(const item of catalog)if(skills[item.id]){const previous=item.detail;item.detail=()=>[previous?.(),tr(skills[item.id])].filter(Boolean).join(' ? ');}
    const ids=new Set(catalog.map(c=>c.id));let records={};
    try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');if(saved&&typeof saved==='object')for(const [id,value] of Object.entries(saved))if(ids.has(id)&&value&&typeof value==='object')records[id]={seenAt:String(value.seenAt||''),defeated:value.defeated===true};}catch{}
    const normalize=value=>value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
    let category='monsters',query='',scan=0;
    const modal=document.createElement('div');modal.id='modal-field-guide';modal.className='modal-overlay';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','field-guide-title');
    const card=document.createElement('div');card.className='modal-card field-guide-card';modal.append(card);
    const header=document.createElement('div');header.className='field-guide-header';
    const heading=document.createElement('h2');heading.id='field-guide-title';const close=document.createElement('button');close.className='field-guide-close';close.textContent='×';close.onclick=()=>closeModal(modal.id);header.append(heading,close);card.append(header);
    const progress=document.createElement('p');progress.className='field-guide-progress';card.append(progress);
    const controls=document.createElement('div');controls.className='field-guide-controls';card.append(controls);
    const tabs=document.createElement('div');tabs.className='field-guide-tabs';controls.append(tabs);
    const search=document.createElement('input');search.type='search';search.id='field-guide-search';search.oninput=()=>{query=normalize(search.value);renderCards();};controls.append(search);
    const grid=document.createElement('div');grid.className='field-guide-grid';card.append(grid);document.body.append(modal);
    const categories={monsters:text('Quái vật','Monsters'),wildlife:text('Sinh vật','Wildlife'),npcs:text('NPC','NPCs'),places:text('Địa điểm','Places')};
    const books=[];
    function makeBook(className){const button=document.createElement('button');button.type='button';button.className=className;button.textContent='📖';button.onclick=open;books.push(button);return button;}
    const hudBook=makeBook('hud-action hud-book-button');hudBook.id='btn-field-guide';document.querySelector('.hud-actions').insertBefore(hudBook,document.querySelector('.hud-settings-button'));
    const lobbyBook=makeBook('btn-menu library-menu');lobbyBook.id='btn-lobby-field-guide';
    const lobbyLabel=document.createElement('span'),lobbyArrow=document.createElement('span');lobbyArrow.textContent='›';lobbyArrow.setAttribute('aria-hidden','true');lobbyBook.replaceChildren(lobbyLabel,lobbyArrow);
    document.getElementById('btn-open-settings').before(lobbyBook);
    function renderCards(){
        grid.replaceChildren();
        for(const item of catalog.filter(item=>item.type===category)){
            const known=Boolean(records[item.id]),name=known?tr(item.name):tr(text('Chưa khám phá','Undiscovered'));
            if(query&&(!known||!normalize(name).includes(query)))continue;
            const article=document.createElement('article');article.className='field-guide-entry'+(known?'':' locked');article.dataset.entry=item.id;
            const thumbnail=known?window.libraryPreviews?.get(item.id):null;
            if(thumbnail){const img=document.createElement('img');img.src=thumbnail;img.alt=name;img.loading='lazy';article.append(img);}
            else if(!known){const icon=document.createElement('div');icon.className='field-guide-icon';icon.textContent='?';article.append(icon);}
            const title=document.createElement('h3');title.textContent=name;article.append(title);
            const description=document.createElement('p');description.textContent=known?tr(item.description):tr(text('Gặp trong hành trình để ghi vào thư viện.','Encounter this during your journey to add it to the library.'));article.append(description);
            if(known&&item.detail){const detail=document.createElement('strong');detail.textContent=item.detail();article.append(detail);}
            if(known&&records[item.id].defeated){const defeated=document.createElement('small');defeated.textContent=tr(text('Đã đánh bại','Defeated'));article.append(defeated);}
            grid.append(article);
        }
        if(!grid.childElementCount){const empty=document.createElement('p');empty.textContent=tr(text('Không tìm thấy mục đã khám phá.','No discovered entries found.'));grid.append(empty);}
    }
    function render(){
        heading.textContent=tr(text('THƯ VIỆN HÀNH TRÌNH','JOURNEY LIBRARY'));close.setAttribute('aria-label',tr(text('Đóng thư viện','Close library')));
        progress.textContent=tr(text('Đã khám phá','Discovered'))+` ${Object.keys(records).length} / ${catalog.length}`;
        search.placeholder=tr(text('Tìm tên đã gặp…','Search encountered names…'));search.setAttribute('aria-label',search.placeholder);
        tabs.replaceChildren();for(const [id,label] of Object.entries(categories)){
            const b=document.createElement('button');b.type='button';b.dataset.category=id;b.textContent=tr(label);b.setAttribute('aria-pressed',String(category===id));b.onclick=()=>{category=id;render();};tabs.append(b);
        }
        lobbyLabel.textContent=tr(text('THƯ VIỆN','LIBRARY'));
        for(const book of books){book.title=tr(text('Thư viện (B)','Library (B)'));book.setAttribute('aria-label',book.title);}
        renderCards();
    }
    function record(id,defeated=false){
        if(!ids.has(id))return false;
        const changed=!records[id]||(defeated&&!records[id].defeated);if(!changed)return false;
        records[id]={seenAt:records[id]?.seenAt||new Date().toISOString(),defeated:Boolean(defeated||records[id]?.defeated)};
        try{localStorage.setItem(storageKey,JSON.stringify(records));}catch{}
        books.forEach(b=>b.classList.add('has-new-entry'));if(modal.classList.contains('active'))render();return true;
    }
    function closeGuide(){closeModal(modal.id);if(gameState.isPlaying)renderer.domElement.focus({preventScroll:true});else lobbyBook.focus({preventScroll:true});}
    close.onclick=closeGuide;
    function open(){render();books.forEach(b=>b.classList.remove('has-new-entry'));openModal(modal.id);search.focus();}
    function visible(point){
        const projected=point.clone().project(camera);if(projected.z< -1||projected.z>1||Math.abs(projected.x)>1.15||Math.abs(projected.y)>1.15)return false;
        const direction=point.clone().sub(camera.position),distance=direction.length();
        return !new THREE.Raycaster(camera.position,direction.normalize(),0,distance-.5).intersectObjects(mercuryLake.group.children.filter(m=>m.name.startsWith('MercuryArchitecture_')),false).length;
    }
    function update(dt){
        if(!gameState.isPlaying||gameState.inDialogue||document.querySelector('.modal-overlay.active'))return;
        scan+=dt;if(scan<.4)return;scan=0;
        const p=playerGroup.position;
        for(const actor of lakeMonsters.actors){
            if(actor.health<=0||!actor.group.visible)continue;
            actor.group.updateMatrixWorld(true);const head=actor.joints.head.getWorldPosition(new THREE.Vector3());
            const underwater=playerSurvival.underwater;if(!underwater&&head.y<mercuryLake.data.waterY)continue;
            if(p.distanceTo(head)<100&&visible(head))record(actor.spec.id);
            else if(p.distanceTo(actor.position)<18&&underwater)record(actor.spec.id);
        }
        catalog.filter(item=>item.landmark).forEach(item=>{
            const lm=item.landmark;if(lm.hidden)return;
            if(lm.id==='thermal_spring'){if(p.y>220&&Math.hypot(p.x-lm.x,p.z-lm.z)<90)record(item.id);return;}
            if(lm.id==='thermal_waterfall'){if(Math.hypot(p.x-lm.x,p.z-lm.z)<220)record(item.id);return;}
            if(lm.id==='bach_khuyet'){if(bachKhuyet.contains(p.x,p.z))record(item.id);return;}
            const radius=item.id==='place_5'?185:item.id==='place_1'?45:35;
            if(lm.id==='ancient_tree'?ancientGrove.contains(p.x,p.z):Math.hypot(p.x-lm.x,p.z-lm.z)<radius)record(item.id);
        });
        if(Math.abs(p.x+110)<10&&Math.abs(p.z-92.2)<10&&p.y>5&&p.y<9)record('royal_guards');
        function encounter(id,model,radius,height=1){
            if(records[id]||!model?.visible||p.distanceTo(model.position)>radius)return;
            const point=model.position.clone().add(new THREE.Vector3(0,height,0));
            if(!visible(point))return;
            const delta=point.clone().sub(camera.position),distance=delta.length();
            if(new THREE.Raycaster(camera.position,delta.normalize(),.05,Math.max(.05,distance-.3)).intersectObjects([bachKhuyet.terrain,riverRealm.terrain],false).length)return;
            record(id);
        }
        if(bachKhuyet.tiger.health>0)encounter('space_sabertooth',bachKhuyet.tiger.group,65,1.4);
        if(riverRealm.wolf.health>0)encounter('speed_wolf',riverRealm.wolf.group,45,1);
        for(const actor of riverRealm.monkeys)encounter('red_rumped_monkey',actor.group,22,.6);
        for(const actor of monsterSkills.minions)if(actor.health>0&&actor.age>.3)encounter('forest_sapling',actor.group,25,1);
        const matrix=new THREE.Matrix4(),position=new THREE.Vector3();
        for(const school of riverRealm.schools){
            const id='river_fish_'+school.fish[0].kind;if(records[id]||!school.mesh.visible||p.distanceTo(school.center)>200)continue;
            school.mesh.updateMatrixWorld(true);
            for(let i=0;i<school.fish.length;i++){school.mesh.getMatrixAt(i,matrix);position.setFromMatrixPosition(matrix).applyMatrix4(school.mesh.matrixWorld);encounter(id,{visible:true,position},18,0);if(records[id])break;}
        }
        if(!records.river_kelp||!records.thermal_coral)for(const plant of riverRealm.data.decor){const id=plant.kind==='kelp'?'river_kelp':'thermal_coral';if(!records[id])encounter(id,{visible:true,position:new THREE.Vector3(plant.x,plant.y,plant.z)},12,.6);}
        const unicorn=interactables.find(i=>i.type==='lunar_unicorn');if(unicorn&&p.distanceTo(unicorn.pos)<12)record('lunar_unicorn');
    }
    window.addEventListener('keydown',e=>{
        if(e.key.toLowerCase()==='b'&&!e.repeat&&!e.target.closest('input,textarea,select')){e.preventDefault();modal.classList.contains('active')?closeModal(modal.id):open();}
    });
    modal.addEventListener('keydown',e=>{
        if(e.key!=='Tab')return;const list=[...card.querySelectorAll('button,input')],first=list[0],last=list.at(-1);
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    });
    window.addEventListener('tsuventure-settings-saved',render);
    window.fieldGuide={catalog,record,open,update,get records(){return {...records};},render};render();
}
