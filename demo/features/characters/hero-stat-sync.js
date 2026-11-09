/* Cooperative initializer: keep gameplay callbacks synchronous. */
async function installHeroStatSync(){
    const modal = document.getElementById('modal-heroes');
    const grid = modal.querySelector('.hero-grid');
    for (const [id,data] of Object.entries(HERO_SKINS)) {
        if (window.gameBoot.shouldYield()) await window.gameBoot.yield();
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'hero-card';
        card.classList.toggle('selected',id===activeHeroType);
        card.id = 'card-hero-'+id;
        card.addEventListener('click',()=>selectHero(id));
        const portrait = document.createElement('div');
        portrait.className = 'hero-img-wrap';
        const img = new Image();
        img.src = heroSkinPortrait(id);
        img.alt = '';
        portrait.append(img);
        const name = document.createElement('h3');
        name.textContent = data.name;
        const theme = document.createElement('div');
        theme.className = 'hero-class';
        theme.textContent = data.theme;
        const description = document.createElement('p');
        description.className = 'skin-details';
        description.textContent = data.detail;
        card.append(portrait,name,theme,description);
        grid.append(card);
    }
    modal.querySelector('.modal-header p').textContent='Chọn ngoại hình bạn thích. Các skin dùng chung chỉ số và cơ chế chiến đấu.';
    document.getElementById('btn-open-heroes').querySelector('span').textContent='SKIN';
    document.getElementById('btn-preview-hero').title='Chọn skin';
    window.skins={catalog:HERO_SKINS,combatType:'hamster',attackDuration:.5,get selected(){return activeHeroType;},select:selectHero};
}
