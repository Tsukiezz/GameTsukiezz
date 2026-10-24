/* Local preferences and bilingual interface. No network or account required. */
(() => {
    const key='tsuventure_settings';
    let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{}
    const volume=(value,fallback)=>Number.isFinite(Number(value))?Math.min(100,Math.max(0,Number(value))):fallback;
    const settings={language:saved.language==='en'?'en':'vi',bgm:volume(saved.bgm,80),sfx:volume(saved.sfx,90),muted:saved.muted===true};
    const pairs={
        'King Kong Đấm Bốc':'King Kong Boxer','Hộ Vệ • Quyền Anh':'Guardian • Boxing','Đấm bốc':'Boxing',
        'Gorilla nhỏ với găng đấm bốc đỏ và giáp vai xanh. Hộ vệ cận chiến, giảm 20% sát thương nhận từ quái vật.':'A little gorilla with red boxing gloves and blue pauldrons. A melee guardian who takes 20% less monster damage.',
        'Thể lực':'Stamina','Oxy':'Oxygen','Thư viện (B)':'Library (B)',
        'Trên bờ: an toàn':'On shore: safe','Trong nước: quái vật có thể phát hiện bạn':'In water: monsters can detect you',
        'Bơi: WASD · Space nổi lên · Q / Ctrl lặn · Shift bơi nhanh':'Swim: WASD · Space ascend · Q / Ctrl dive · Shift swim faster',
        'Không đủ thể lực':'Not enough stamina',
        'Quái vật Hồ Thủy Ngân':'Mercury Lake monsters','Cầu đá: an toàn':'Stone bridge: safe',
        'Rời cầu: có thể bị phát hiện':'Off the bridge: monsters can detect you',
        'Tuần tra':'Patrolling','Đang săn đuổi':'Hunting','Chuẩn bị tấn công':'Preparing attack','Đang hồi đòn':'Recovering','Đã bị hạ':'Defeated',
        'Loch Ness — Kẻ Nuốt Trăng':'Loch Ness — Moon Devourer','Cá Sấu Không Gian — Hàm Hư Không':'Space Crocodile — Void Maw',
        'BẢN ĐỒ · 2080m':'MAP · 2080m','Hồ Thủy Ngân — Vực Tĩnh Lặng':'Mercury Lake — Silent Abyss',
        'Rừng Nguyên Sinh':'Primordial Forest','Thần Rừng':'Forest Guardian',
        'Rừng ngoại vi':'Forest outskirts','Cổ thụ đã khám phá':'Discovered Elder Tree',
        'Đại Cổ Thụ Nguyệt Tộc':'Ancient Moon Tree','Rừng Bạch Nguyệt':'Moon Birch Forest',
        'Rừng Thông U Ảnh':'Shadow Pine Forest','Rừng Dương Xỉ và Nấm':'Fern and Mushroom Forest','Rừng Liễu Nguyệt':'Moon Willow Forest',
        'Lưu thay đổi':'Save changes','Chưa lưu thay đổi':'Unsaved changes','Đã lưu và áp dụng':'Saved and applied',
        'Nhấn Lưu thay đổi để áp dụng trên thiết bị này':'Press Save changes to apply on this device',
        'Máu':'Health','Giáp':'Armor','Máu và giáp':'Health and armor',
        'CHƠI':'PLAY','KHO ĐỒ':'INVENTORY','NHÂN VẬT':'CHARACTERS','CÀI ĐẶT':'SETTINGS',
        'Sẽ cập nhật trong tương lai':'Coming in a future update',
        'Ngôn ngữ':'Language','Tự động lưu trên thiết bị này':'Automatically saved on this device',
        'CÀI ĐẶT TRÒ CHƠI':'GAME SETTINGS','Tùy chỉnh âm thanh và trải nghiệm chơi':'Customize your sound and gameplay',
        'Nhạc Nền (BGM Music)':'Background music','Âm hưởng huyền bí đêm trăng Tsuventure':'The mystical moonlit sounds of Tsuventure',
        'Hiệu Ứng Âm Thanh (SFX)':'Sound effects (SFX)','Tiếng vung kiếm, nhặt đồ và đối thoại':'Sword swings, pickups and dialogue',
        'Chế Độ Toàn Màn Hình':'Fullscreen','Mở rộng tầm nhìn trải nghiệm 3D':'Expand your view of the world','Bật / Tắt':'Toggle',
        'Tối Ưu Hóa Đồ Họa & Máy Yếu':'Graphics & performance','Cân Bằng (Mặc Định)':'Balanced (default)',
        'Chọn Cực Mượt cho máy yếu: giảm hiệu ứng và tự hạ độ phân giải khi FPS thấp.':'Choose Minimal for slower devices: fewer effects and adaptive resolution.',
        'Cực Mượt':'Minimal','Siêu Mượt':'Low','Cân Bằng':'Balanced','Tuyệt Đẹp':'Ultra',
        'Cực Mượt (Máy rất yếu)':'Minimal (slower devices)','Siêu Mượt (Máy yếu)':'Low (slower devices)','Tuyệt Đẹp (Ultra)':'Ultra',
        'CỰC MƯỢT':'MINIMAL','MƯỢT':'LOW','CHUẨN':'BALANCED',
        'Máy rất yếu · độ phân giải tự động':'Slower devices · adaptive resolution',
        'Dành cho máy yếu, laptop onboard':'Slower devices and integrated graphics',
        'Cân đối hình ảnh và hiệu năng':'Balanced visuals and performance','Máy mạnh, độ phân giải cao':'Powerful devices, higher resolution',
        'Thế giới phế tích cổ xưa chìm dưới vầng trăng khuyết huyền bí. Hãy chọn nhân vật bảo hộ, giải mã những phiến đá thì thầm và thắp lại ngọn lửa linh thiêng!':'Explore ancient ruins beneath a mysterious crescent moon. Choose your guardian, uncover forgotten secrets and rekindle the sacred flame.',
        'Đang chọn:':'Selected:','Chiến Binh Hamster':'Hamster Knight','Thỏ Phù Thủy':'Rabbit Mage','(Cận chiến)':'(Melee)',
        'Chiến Binh Rồng':'Dragon Knight','Hiệp Sĩ Rồng • Kiếm & Khiên':'Dragon Knight • Sword & Shield',
        'Rồng nhỏ màu ngọc bích, đôi cánh ngắn và bộ giáp xanh. Một người bạn dũng cảm, thân thiện trong chuyến phiêu lưu ánh trăng.':'A little jade dragon with short wings and blue armor. A brave, friendly companion for your moonlit adventure.',
        'Nhấn':'Press','để chơi ở chế độ Toàn Màn Hình':'to play in fullscreen',
        'CHỌN NHÂN VẬT':'CHOOSE YOUR CHARACTER',
        'Mỗi nhân vật mang phong cách chiến đấu, vũ khí và phép thuật thần bí riêng biệt':'Each hero has a distinct fighting style, weapon and magic.',
        'Hiệp Sĩ Hoàng Gia • Kiếm & Khiên':'Royal Knight • Sword & Shield',
        'Nguyệt Thần Pháp Sư • Quyền Trượng & Sách Phép':'Moon Mage • Staff & Spellbook',
        'Sức Mạnh':'Strength','Phòng Thủ':'Defense','Tốc Độ':'Speed','Phép Thuật':'Magic',
        'Ma Thuật':'Magic','Công Thủ':'Attack & Defense',
        'Hiệp sĩ nhỏ bé với ý chí kiên cường. Sở hữu chiếc mũ giáp thép, khiên bạc và thanh kiếm ánh trăng, chuyên chiến đấu cận chiến.':'A brave little knight with a steel helmet, silver shield and moonlit sword. Specializes in close combat.',
        'Bậc thầy phép thuật Nguyệt Tinh với chiếc mũ chóp nhọn và quyền trượng ma thuật tím neon. Thi triển thần chú giải ấn tầm xa.':'A master of moonstone magic with a pointed hat and glowing violet staff. Casts spells from afar.',
        'Đã Chọn':'Selected','Chọn Anh Hùng':'Choose Hero',
        'Địa điểm':'Destinations','Chọn điểm đến':'Choose a destination','Di chuyển nhanh đến khu vực bạn muốn khám phá.':'Travel to an area you want to explore.',
        'Nhân vật':'Characters','Đổi nhân vật':'Change character','Thế giới':'World','Lâu đài':'Castle',
        'Cài đặt':'Settings','Cài đặt đồ họa':'Graphics settings','Điều khiển':'Controls','Trang chủ':'Lobby','Về trang chủ':'Return to lobby',
        'Giữ chuột phải để nhìn quanh, lăn chuột để đổi khoảng cách.':'Hold the right mouse button to look around. Scroll to zoom.',
        'Di chuyển':'Move','Nhảy':'Jump','Tương tác':'Interact','Ngồi / đứng':'Sit / stand','Chuột phải':'Right mouse',
        'Đại điện':'Great Hall','Phòng tiếp khách':'Reception','Ngai vàng':'Throne','Gác mái':'Attic',
        'Cửa hầm bí mật':'Secret entrance','Đấu trường':'Arena','Tế đàn':'Altar','Cổ thụ':'Ancient tree',
        'Đền Trung Tâm':'Central Temple','Lâu Đài T1':'Castle F1','Ngai Vàng T2':'Throne F2',
        'Phòng khiêu vũ':'Ballroom','Thư viện cổ':'Ancient Library','Phòng ăn':'Dining Room','Phòng tiệc':'Banquet Hall',
        'Phòng tranh':'Art Gallery','Phòng đọc':'Reading Room','Kho sách':'Book Archive','Phòng nghiên cứu':'Study',
        'Phòng Vũ Khí':'Armory','Đại Điện':'Great Hall','Sảnh Tiếp Khách':'Reception',
        'Hầm Bí Mật':'Secret Basement','Mật Thất':'Hidden Crypt','Trạm Vũ Trụ':'Space Station',
        'Hồ Thủy Ngân':'Mercury Lake','Hang Động':'Cave','Đài Thiên Văn':'Observatory',
        'Chém kiếm':'Sword attack','Vung trượng':'Staff attack','Chạy nhanh':'Sprint',
        'VỊ TRÍ HIỆN TẠI':'CURRENT LOCATION','BẢN ĐỒ':'MAP',
        'Menu sảnh chính':'Lobby menu','Bật/Tắt Âm Thanh':'Toggle audio',
    };
    const reverse=Object.fromEntries(Object.entries(pairs).map(([vi,en])=>[en,vi]));
    function translate(value){
        const trim=value.trim(),leading=value.slice(0,value.indexOf(trim));
        const table=settings.language==='en'?pairs:reverse;
        if(table[trim])return leading+table[trim]+value.slice(leading.length+trim.length);
        // Preserve the icon in compact HUD labels.
        for(const [from,to] of Object.entries(table))if(trim.endsWith(from)&&trim.length-from.length<=5)return value.replace(from,to);
        return value;
    }
    let observer;
    function localize(root=document.body){
        observer?.disconnect();
        const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
        let node;while((node=walker.nextNode())){
            if(node.parentElement?.closest('script,style,option'))continue;
            const result=translate(node.nodeValue);if(result!==node.nodeValue)node.nodeValue=result;
        }
        for(const el of root.querySelectorAll('[title],[aria-label]'))for(const attr of ['title','aria-label'])if(el.hasAttribute(attr)){
            const old=el.getAttribute(attr),next=translate(old);if(old!==next)el.setAttribute(attr,next);
        }
        document.documentElement.lang=settings.language;
        observer?.observe(document.body,{subtree:true,childList:true,characterData:true});
    }
    function save(){try{localStorage.setItem(key,JSON.stringify(settings));}catch{}}
    const draft={...settings,graphics:currentProfileKey};
    const saveButton=document.getElementById('btn-save-settings'),saveStatus=document.getElementById('settings-save-status');
    function dirty(){
        const changed=['language','bgm','sfx'].some(k=>draft[k]!==settings[k]) || draft.graphics!==currentProfileKey;
        saveButton.disabled=!changed;
        saveStatus.textContent=translate(changed?'Chưa lưu thay đổi':'Đã lưu và áp dụng');
    }
    function chooseGraphics(key){
        if(!graphicsProfiles[key])return;
        draft.graphics=key;
        document.querySelectorAll('.btn-preset').forEach(b=>b.classList.toggle('active',b.id==='btn-preset-'+key));
        document.getElementById('current-profile-label').textContent=translate(graphicsProfiles[key].name);dirty();
    }
    const select=document.getElementById('setting-language');select.value=settings.language;
    select.addEventListener('change',()=>{draft.language=select.value==='en'?'en':'vi';dirty();});
    function applyAudio(){
        sfx.muted=settings.muted;
        if(sfx.bgmGain)sfx.bgmGain.gain.value=settings.bgm/100*.1;
        if(sfx.sfxGain)sfx.sfxGain.gain.value=settings.sfx/100;
        document.getElementById('btn-audio-toggle').textContent=settings.muted?'🔇':'🔊';
    }
    const init=sfx.init.bind(sfx);sfx.init=function(){init();applyAudio();};
    for(const type of ['bgm','sfx']){
        const slider=document.getElementById('slider-'+type);slider.value=settings[type];
        slider.addEventListener('input',()=>{draft[type]=volume(slider.value,80);dirty();});
    }
    saveButton.addEventListener('click',()=>{
        for(const k of ['language','bgm','sfx'])settings[k]=draft[k];
        if(currentProfileKey!==draft.graphics)setGraphicsProfile(draft.graphics);
        save();applyAudio();localize();dirty();window.dispatchEvent(new Event('tsuventure-settings-saved'));
    });
    window.resetSettingsDraft=()=>{
        Object.assign(draft,settings,{graphics:currentProfileKey});select.value=settings.language;
        for(const type of ['bgm','sfx'])document.getElementById('slider-'+type).value=settings[type];
        chooseGraphics(currentProfileKey);
    };
    document.getElementById('btn-audio-toggle').addEventListener('click',()=>{settings.muted=sfx.muted;save();applyAudio();});
    applyAudio();
    let queued=false;
    observer=new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;localize();});}});
    localize();
    const video=document.getElementById('lobby-video'),home=document.getElementById('home-screen');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    function syncVideo(){
        if(home.classList.contains('hidden')||document.hidden||reduced.matches)video.pause();
        else video.play().catch(()=>{});
    }
    new MutationObserver(syncVideo).observe(home,{attributes:true,attributeFilter:['class']});
    document.addEventListener('visibilitychange',syncVideo);reduced.addEventListener('change',syncVideo);
    video.addEventListener('error',()=>{video.style.display='none';});syncVideo();
    window.tsuventureSettings={get language(){return settings.language;},translate,chooseGraphics};
    dirty();
})();
