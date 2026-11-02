/* Complete creature reference; encounters and victories remain a saved journal. */
function installFieldGuide(){
    const storageKey='tsuventure_field_guide_v1',catalog=[];
    for(const [index,spec] of ARENA_LEVELS.entries())catalog.push({id:spec.id,type:'monsters',name:spec.name,description:spec.description,detail:()=>spec.hp.toLocaleString()+' HP · '+(index===4?'MAX':'LV '+(index+1))+' · '+spec.skill+' · Huân Chương '+(index+1)});
    catalog.push({id:'lunar_resident',type:'npcs',name:'Cư dân Nguyệt Sơn',icon:'🏘',description:'Những cư dân hiền lành sống trong các làng bậc thềm dọc hai sống núi phía tây. Làm vườn, bán tinh thạch và đi lại quanh giếng làng. Đến gần để tự ghi nhận vào thư viện.',detail:()=> westernHighlands.villages.length+' làng · '+westernHighlands.residents.length+' cư dân'});
    catalog.push({id:'candy_cavity',type:'monsters',name:'Chúa Sâu Răng',icon:'🍭',description:'Kẹo mút khổng lồ bị nguyền rủa trong Vương Quốc Bánh Kẹo. Truy đuổi và thôi miên người chơi. Rời vòng tím trước khi phép hoàn tất.',detail:()=> '10.000 HP · Thôi miên 2,5 giây +24 sát thương · Báo trước 1,8 giây · Hồi sau 30 phút.'});
    for(const [kind,name] of [['elephant','Voi'],['chicken','Gà'],['buffalo','Trâu']])catalog.push({id:'roaming_'+kind,type:'wildlife',name,description:'Sinh vật hiền lành đi lại trên đất khô, tránh công trình, nước và đường tàu.'});
    catalog.push({id:'wise_sphinx',type:'monsters',name:'Nhân Sư Anh Minh',icon:'🦁',description:'Người canh giữ khổng lồ biết tuần tra, truy đuổi và giáng địa chấn. Rời vòng đỏ trong 2 giây để tránh hóa đá; vách kim tự tháp che chắn đòn phép.',detail:()=> '12.000 HP · Di chuyển 5,5 m/s khi truy đuổi · Hóa đá 4 giây + 65 sát thương · Địa chấn 90 sát thương, báo trước 1,25 giây.'});
    catalog.push({id:'pyramid_cobra',type:'monsters',name:'Rắn Hổ Mang Cổ Mộ',icon:'🐍',description:'Ẩn trong những ngã rẽ mê cung. Bò theo hành lang, dựng đầu báo trước khi cắn. Nọc độc rút máu trong 8 giây.',detail:()=> '360 HP · Cắn 16 · Độc 4 máu/giây trong 8 giây · Báo trước 0,65 giây.'});
    catalog.push({id:'pyramid_spider',type:'monsters',name:'Nhện Độc Cổ Mộ',icon:'🕷',description:'Săn người trong mê cung bằng tám chân. Tường chặn tầm nhìn và đòn cắn; lùi khỏi vòng cảnh báo để tránh nọc độc.',detail:()=> '220 HP · Cắn 10 · Độc 3 máu/giây trong 6 giây · Báo trước 0,65 giây.'});
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
    catalog.push({id:'swamp_crocodile',type:'monsters',icon:'🐊',name:text('Cá Sấu Đầm Lầy','Swamp Crocodile'),description:text('Cá sấu hung bạo với giáp vảy, hàm dài và răng nanh, sinh sống dưới rễ đước của Phế Tích Triều Mặn.','A savage armored crocodile with long jaws and fangs, living beneath the prop roots of the drowned sanctuary.'),detail:()=>tr(text('10.000 HP · Ngoạm lao: 48 sát thương · Báo trước 1,15 giây. Rời vòng cam; bơi tới phế tích để lên bờ. Cá sấu ngụp lặn trong hồ sâu.','10,000 HP · Lunge bite: 48 damage · 1.15-second warning. Leave the orange circle; swim to the sanctuary landing. Dives in deep water.'))});
    for(const [kind,vi,en,dvi,den] of [
        ['fish','Cá Đầm Lầy','Swamp fish','Cá bơi thành đàn dưới làn nước đục của Rừng Ngập Mặn.','Fish swimming in schools beneath the murky mangrove waters.'],
        ['turtle','Rùa Đầm Lầy','Swamp turtle','Rùa bơi và lặn giữa rễ đước, từ mặt nước xuống lòng hồ.','Turtles swimming and diving among mangrove roots.'],
        ['crab','Cua Đầm Lầy','Swamp crab','Cua bò trên đáy bùn sâu bên dưới những rễ đước.','Crabs crawling across the muddy bottom beneath mangrove roots.'],
        ['lotus','Lá Sen Đầm Lầy','Swamp lotus leaves','Lá sen nổi trên mặt hồ mặn, lay động theo làn nước; không thể đứng lên lá.','Lotus leaves floating on the brackish lake; they cannot support the player.'],
        ['lotusFlower','Hoa Sen Đầm Lầy','Swamp lotus flower','Hoa sen nở giữa những cụm lá nổi ở Phế Tích Triều Mặn.','Lotus flowers blooming among floating leaves at the drowned sanctuary.']
    ])catalog.push({id:'swamp_'+kind,type:'wildlife',name:text(vi,en),description:text(dvi,den)});
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
    for(const item of catalog)if(skills[item.id]){const previous=item.detail;item.detail=()=>[previous?.(),tr(skills[item.id])].filter(Boolean).join(' · ');}
    catalog.push({id:'giant_stone_worm',type:'monsters',name:text('Giun Đá Khổng Lồ','Giant stone worm'),description:text('Tuần tra ngẫu nhiên bên trong đá dưới Hang Tà Thần. Không thể nhìn thấy hoặc đánh trúng khi còn ẩn.','Roams randomly inside the stone beneath the Evil God Cavern. Cannot be seen or struck while burrowing.'),detail:()=>tr(text('5200 HP · Cắn thường: 18 · Địa Chấn Trồi Lên: 46 sát thương trong bán kính 4,2 m. Đá rung báo trước 1,8 giây; giun lộ ra 4 giây rồi ẩn lại.','5200 HP · Bite: 18 · Seismic eruption: 46 damage within 4.2 m. Tremors warn for 1.8 seconds; exposed for 4 seconds.'))});
    catalog.push({id:'cursed_warrior',type:'monsters',name:text('Chiến Binh Bị Nguyền Rủa','Cursed warrior'),description:text('Lính cổ bị nguyền rủa tuần tra những ngã rẽ tối đen. Biết đi vòng theo hành lang để truy đuổi.','Cursed soldiers patrol the pitch-black passages and follow corridors to pursue intruders.'),detail:()=>tr(text('1800 HP · Chém thường: 14 · Ấn Xích Hồn: 28 sát thương, làm chậm 50% trong 4 giây. Niệm 1,25 giây; vách đá chặn được đòn phép.','1800 HP · Slash: 14 · Soul Shackle: 28 damage and 50% slow for 4 seconds. Casts for 1.25 seconds; stone walls block the spell.'))});
    catalog.push({id:'cavern_sentinels',type:'npcs',name:text('Cận Vệ Hang Tà Thần','Cavern sentinels'),description:text('Hai cận vệ đứng hai bên lối xuống hang, đánh dấu cửa vào mê cung tối. Đến gần để tự ghi nhận vào thư viện.','Two sentinels mark the entrance to the dark cavern maze. Approach to record them in the guide.')});
    for(const [kind,vi,en] of [['bull','Bò Tót','Gaur'],['goat','Dê','Goat'],['doe','Nai','Doe'],['deer','Hươu','Deer'],['dog','Chó','Dog'],['cat','Mèo','Cat'],['butterfly','Bươm Bướm','Butterfly']])catalog.push({id:'roaming_'+kind,type:'wildlife',name:text(vi,en),description:text('Sinh vật hiền lành sinh ra ngẫu nhiên trên các vùng đất khô của thế giới. Đi quanh thảm thực vật và tránh nước, dung nham, công trình.','A peaceful creature randomly spawned across dry regions. Roams among plants and avoids water, lava and buildings.')});
    catalog.push({id:'war_dragon',type:'monsters',name:text('Rồng Chiến Tranh','War Dragon'),description:text('Rồng giáp đen với đôi cánh màng và vương miện sừng, canh giữ thanh gươm trong Thung Lũng Núi Lửa.','A black armored dragon with membranous wings and a horned crown, guarding the sword in the Volcanic Valley.'),detail:()=>tr(text('20.000 HP · Bay giới hạn trong thung lũng, tấn công từ trên không · Cào thường: 24 · Phun dung nham: báo trước 1,8 giây, gây bỏng · Ba cầu lửa: 42 sát thương và bỏng 5 máu/giây trong 6 giây. Dung nham dưới chân gây chết ngay.','20,000 HP · Claw: 24 · Lava breath: 1.8-second warning and burning · Three fireballs: 42 damage and 5 HP/sec burn for 6 seconds. Stepping into lava is instantly fatal.'))});
    catalog.push({id:'royal_train_driver',type:'npcs',name:text('Lính Chì Hoàng Gia — Lái Tàu','Royal Tin Soldier — Train Driver'),description:text('NPC lính chì mặc quân phục hoàng gia, điều khiển đầu máy Nguyệt Hành. Dừng 60 giây tại ga được khách gọi bằng nút Chờ tàu.','A royal tin soldier NPC driving the Moon Railway locomotive. Stops for 60 seconds at stations requested by passengers.')});
    const campEnglish={dwarf:'Hostile dwarf',robot:'Patrol robot',wolf:'Wild wolf',rabbit:'Demonic moon rabbit'};
    for(const [kind,spec] of Object.entries(window.monsterCamps?.specs||{}))catalog.push({id:'camp_'+kind,type:'monsters',name:text(spec.name,campEnglish[kind]||spec.name),description:text('Quái ở các bãi nhỏ khắp bản đồ, mỗi bãi 10–15 con. Dọn sạch nhận 1 xu vàng và 1 vật phẩm ngẫu nhiên; bãi hồi sau 30 phút.','Lives in camps of 10–15 across the map. Clearing a camp grants one gold coin and one random item; camps respawn after 30 minutes.'),detail:()=>`${spec.hp} HP · `+tr(text(`Cận chiến: ${spec.damage} sát thương · Tốc độ ${spec.speed} m/s.`,`Melee: ${spec.damage} damage · Speed ${spec.speed} m/s.`))});
    catalog.push({id:'snow_queen',type:'monsters',name:text('Nữ Chúa Tuyết','Snow Queen'),description:text('Canh giữ lãnh địa băng riêng ở Nam Cực, cách xa nhà máy Tuyết. Biết truy đuổi, đánh gần và tung phép đóng băng.','Guards a separate Antarctic ice domain, far from the Snow Factory. Pursues intruders, strikes in melee, and casts freezing magic.'),detail:()=>`${snowQueen.boss.maxHealth} HP · `+tr(text('Cận chiến: 19 · Phép băng: 28 sát thương, đóng băng 3 giây. Vòng cảnh báo 1,6 giây; rời vòng 7 m trước khi phép nổ.','Melee: 19 · Ice spell: 28 damage and a 3-second freeze. A 1.6-second warning; leave the 7 m circle before impact.'))});
    for(const [kind,vi,en] of [['penguin','Chim cánh cụt','Penguin'],['polar_bear','Gấu trắng','Polar bear']])catalog.push({id:'polar_'+kind,type:'wildlife',name:text(vi,en),description:text(kind==='penguin'?'Sinh sống thành đàn trên đất tuyết Nam Cực, đi lạch bạch quanh bờ khô, tránh sông và đường tàu.':'Gấu trắng đi lại trên vùng tuyết phía nam. Hiện là sinh vật cảnh quan hiền lành, không phải quái chiến đấu.',kind==='penguin'?'Lives in colonies on dry Antarctic snow, waddling clear of rivers and railways.':'Roams the southern snowfields. Currently a peaceful scenic animal, rather than a combat enemy.')});
    const fishEnglish=['Silver river fish','Golden river fish','Blue river fish','Rose river fish','Ice river fish','Green river fish'];
    for(const [i,spec] of (window.aquaticEcology?.types||[]).entries())catalog.push({id:'network_fish_'+i,type:'wildlife',name:text(spec.name,fishEnglish[i]||spec.name),description:text('Bơi theo đàn trong toàn mạng sông mở rộng, từ đất phía bắc tới vùng tuyết phía nam. Cá luôn ở dưới mặt nước và trên đáy sông.','Schools throughout the expanded river network, from northern earthlands to southern snow. Swims beneath the surface and above the riverbed.')});
    const weedEnglish=['Green ribbon grass','Olive river weed','Blue watergrass','Golden river weed'];
    for(const [i,spec] of (window.aquaticEcology?.weedTypes||[]).entries())catalog.push({id:'river_seagrass_'+i,type:'wildlife',name:text(spec.name,weedEnglish[i]||spec.name),description:text('Cỏ/rong nước mọc bám đáy trong mạng sông, lá lay động theo dòng chảy, tạo cảnh quan cho đàn cá.','Aquatic plants rooted in the riverbed, with blades swaying among the fish.')});
    catalog.push({id:'santa_claus',type:'npcs',name:text('Ông già Noel','Santa Claus'),description:text('Bay khắp bản đồ trên xe kéo tuần lộc, thả hòm quà ngẫu nhiên khoảng 2 phút/lần. Hòm đáp đất phát khói đỏ; nhấn E mở để nhận thức ăn, tài nguyên và cơ hội 2% có Động cơ vĩnh cửu.','Flies around the map in a reindeer sleigh, dropping gifts roughly every two minutes. Landed chests emit red smoke; press E for food, resources, and a 2% chance of a Perpetual Engine.')});
    catalog.push({id:'flying_reindeer',type:'wildlife',name:text('Tuần lộc bay','Flying reindeer'),description:text('Bốn tuần lộc kéo xe ông già Noel trên bầu trời, giữ cao ít nhất khoảng 150 m trên địa hình. Không phải quái vật.','Four reindeer pull Santa’s sleigh through the sky, at least about 150 m above terrain. Peaceful creatures.')});
    for(const [id,type,vi,en,description] of COMMUNITY_GUIDE)catalog.push({id,type,name:text(vi,en),description,detail:()=>type==='wildlife'?'Sinh vật hiền lành · Sống trên đáy sông':'NPC thân thiện · Tự động ghi nhận khi đến gần'});
    // Keep aquatic vegetation in the world, outside the creature reference.
    for(let i=catalog.length-1;i>=0;i--)if(catalog[i].id.startsWith('river_seagrass_')||['river_kelp','swamp_lotus','swamp_lotusFlower'].includes(catalog[i].id))catalog.splice(i,1);
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
    // A weak PC should only render portraits for cards actually being browsed.
    const previewQueue=[];let previewPending=false;
    function loadPreview(article){const url=window.libraryPreviews?.get(article.dataset.entry);if(!url)return;const img=document.createElement('img');img.src=url;img.alt=article.querySelector('h3').textContent;img.loading='lazy';article.querySelector('.field-guide-icon')?.replaceWith(img);}
    function pumpPreviews(){if(previewPending)return;previewPending=true;requestAnimationFrame(()=>{previewPending=false;const article=previewQueue.shift();if(article?.isConnected&&modal.classList.contains('active'))loadPreview(article);if(previewQueue.length)pumpPreviews();});}
    const previewObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting&&modal.classList.contains('active')){previewObserver.unobserve(e.target);previewQueue.push(e.target);}pumpPreviews();},{root:card,rootMargin:'100px'});
    function renderCards(){
        previewObserver.disconnect();previewQueue.length=0;grid.replaceChildren();
        for(const item of catalog.filter(item=>item.type===category)){
            const known=Boolean(records[item.id]),name=tr(item.name);
            if(query&&!normalize(name).includes(query))continue;
            const article=document.createElement('article');article.className='field-guide-entry';article.dataset.entry=item.id;
            const thumbnail=window.libraryPreviews?.cache.get(item.id);
            if(thumbnail){const img=document.createElement('img');img.src=thumbnail;img.alt=name;img.loading='lazy';article.append(img);}
            else{const icon=document.createElement('div');icon.className='field-guide-icon';icon.textContent=tr(text('Ảnh 3D…','3D preview…'));article.append(icon);previewObserver.observe(article);}
            const title=document.createElement('h3');title.textContent=name;article.append(title);
            const description=document.createElement('p');description.textContent=tr(item.description);article.append(description);
            if(item.detail){const detail=document.createElement('strong');detail.textContent=item.detail();article.append(detail);}
            const status=document.createElement('small');status.className='field-guide-status';status.textContent=known?tr(text('Đã gặp','Encountered')):tr(text('Chưa gặp','Not yet encountered'));article.append(status);
            if(known&&records[item.id].defeated){const defeated=document.createElement('small');defeated.textContent=tr(text('Đã đánh bại','Defeated'));article.append(defeated);}
            grid.append(article);
        }
        if(!grid.childElementCount){const empty=document.createElement('p');empty.textContent=tr(text('Không tìm thấy mục phù hợp.','No matching entries.'));grid.append(empty);}
    }
    function render(){
        heading.textContent=tr(text('THƯ VIỆN HÀNH TRÌNH','JOURNEY LIBRARY'));close.setAttribute('aria-label',tr(text('Đóng thư viện','Close library')));
        progress.textContent=tr(text('Đã khám phá','Discovered'))+` ${Object.keys(records).length} / ${catalog.length}`;
        search.placeholder=tr(text('Tìm trong toàn bộ thư viện…','Search the whole library…'));search.setAttribute('aria-label',search.placeholder);
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
        if(window.evilCavern?.inside(p)){record('place_7');return;}
        if(window.evilCavern?.guards.some(a=>p.distanceTo(a.group.position)<10))record('cavern_sentinels');
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
            if(!ids.has(id)||records[id]||!model?.visible)return;
            for(let parent=model.parent;parent;parent=parent.parent)if(!parent.visible)return;
            const position=model.getWorldPosition?model.getWorldPosition(new THREE.Vector3()):model.position;
            if(p.distanceTo(position)>radius)return;
            const point=position.clone().add(new THREE.Vector3(0,height,0));
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
        if(!records.thermal_coral)for(const plant of riverRealm.data.decor)if(plant.kind!=='kelp')encounter('thermal_coral',{visible:true,position:new THREE.Vector3(plant.x,plant.y,plant.z)},12,.6);
        const swamp=window.mangroveRealm;
        if(swamp)for(const [kind,actors] of Object.entries(swamp.life.populations)){
            const id='swamp_'+kind;if(!ids.has(id)||records[id])continue;
            const batches=swamp.life.batches.filter(batch=>batch.kind===kind);
            if(!swamp.group.visible||!batches.some(batch=>batch.mesh.visible))continue;
            for(const actor of actors){
                // The opaque surface hides submerged wildlife from observers on land.
                if(actor.position.y<swamp.waterAt(actor.position.x,actor.position.z)?.y&&!playerSurvival.underwater)continue;
                encounter(id,{visible:true,position:actor.position},kind.startsWith('lotus')?20:16,0);
                if(records[id])break;
            }
        }
        for(const camp of window.monsterCamps?.camps||[]){const id='camp_'+camp.kind;if(records[id]||p.distanceTo(camp.center)>55)continue;for(const actor of camp.actors){if(actor.health>0)encounter(id,actor.group,28,1);if(records[id])break;}}
        if(window.romanArena?.tournament?.opponent?.health>0)encounter(romanArena.tournament.opponent.spec.id,romanArena.tournament.opponent.group,120,2);
        if(window.snowQueen?.boss.health>0)encounter('snow_queen',snowQueen.group,100,3);
        for(const actor of window.westernHighlands?.residents||[])if(actor.group.parent.visible)encounter('lunar_resident',actor.group,18,.7);
        for(const actor of window.polarEcology?.actors||[])encounter('polar_'+actor.kind,actor.group,32,actor.kind==='penguin'?.7:1.3);
        const ecology=window.aquaticEcology;
        if(ecology?.group.visible&&playerSurvival.underwater){
            for(const [kind,pool] of ecology.pools.entries()){const id='network_fish_'+kind;if(records[id]||!pool.body.visible)continue;pool.body.updateWorldMatrix(true,false);for(let i=0;i<pool.body.count;i++){pool.body.getMatrixAt(i,matrix);position.setFromMatrixPosition(matrix).applyMatrix4(pool.body.matrixWorld);encounter(id,{visible:true,position},18,0);if(records[id])break;}}
        }
        if(window.santaGifts?.group.visible){encounter('santa_claus',santaGifts.santa,260,3);for(const deer of santaGifts.reindeer)encounter('flying_reindeer',deer,260,2);}
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
