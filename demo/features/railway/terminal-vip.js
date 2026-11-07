const vipMineModels = new Map();

function createVipMineModel(kind) {
    if (!vipMineModels.has(kind)) {
        const root = new THREE.Group();
        for (const part of VIP_MINE_ART.models[kind]) {
            const geometry = new THREE.BufferGeometry();
            for (const [attribute, values] of [['position', part.positions], ['normal', part.normals], ['color', part.colors]]) {
                geometry.setAttribute(attribute, new THREE.Float32BufferAttribute(values, 3));
            }
            geometry.computeBoundingSphere();
            const settings = {vertexColors: true, side: THREE.DoubleSide};
            const material = part.glow ? new THREE.MeshBasicMaterial(settings) : new THREE.MeshStandardMaterial({...settings, roughness: .78});
            root.add(new THREE.Mesh(geometry, material));
        }
        vipMineModels.set(kind, root);
    }
    return vipMineModels.get(kind).clone(true);
}

function createTerminalDialog(id) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = id;
    overlay.innerHTML = '<section class="modal-card terminal-dialog" role="dialog" aria-modal="true"><button class="modal-close" type="button" aria-label="Đóng">×</button><h2></h2><p></p><div class="terminal-dialog-actions"></div></section>';
    const close = () => closeModal(id);
    overlay.querySelector('.modal-close').onclick = close;
    overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
    window.addEventListener('keydown', event => {
        if (event.key === 'Escape' && overlay.classList.contains('active')) close();
    });
    document.body.append(overlay);
    return {overlay, close, open(title, description, actions) {
        overlay.querySelector('h2').textContent = title;
        overlay.querySelector('p').textContent = description;
        const buttons = overlay.querySelector('.terminal-dialog-actions');
        buttons.replaceChildren();
        for (const [label, action] of actions) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'tour-btn';
            button.textContent = label;
            button.onclick = action;
            buttons.append(button);
        }
        openModal(id);
        buttons.firstElementChild?.focus();
    }};
}

function installTerminalVip(root, world, stationName) {
    const model = createVipMineModel('vip');
    model.name = 'TsukiezzVipLounge';
    root.add(model);
    const floor = VIP_MINE_ART.floor;
    const areas = [
        {name: 'Cà Phê Ánh Trăng', x: -15, z: -36},
        {name: 'Đồ Ăn Nhanh', x: 15, z: -36},
        {name: 'Bánh Mì Việt Nam', x: -15, z: 11}
    ];
    const stations = [];
    function addStation(kind, name, x, z, options = {}) {
        const item = {id: 'terminal-vip-' + stations.length, type: 'terminal_vip', kind, name, pos: world(x, floor, z), radius: 2.6, prompt: 'E · ' + name, ...options};
        stations.push(item);
        interactables.push(item);
        return item;
    }
    for (const area of areas) {
        const plaque = stationAccessSign(root, area.name.toUpperCase(), 'TẦNG 3 · PHÒNG CHỜ VIP', new THREE.Vector3(area.x, floor + 4.37, area.z + 1.64));
        plaque.scale.set(1.6, 1.15, 1);
    }
    const arcadeMachines = [8, 15, 22, 29].map((z, index) => {
        const kind = index < 2 ? 'pusher' : 'claw';
        const name = kind === 'pusher' ? 'Đẩy Xu' : 'Kéo Thú';
        const sign = stationAccessSign(root, name.toUpperCase(), '1 xu / lượt', new THREE.Vector3(13.28, floor + 3.89, z), -Math.PI / 2);
        sign.scale.set(.58, .45, 1);
        return addStation(kind, name, 11.5, z, {z, toys: []});
    });
    stationAccessSign(root, 'GHẾ MASSAGE', '2 xu · Đầy thể lực thêm 5 phút sau khi rời ghế', new THREE.Vector3(0, floor + 3.3, 47), Math.PI);
    for (const x of [-13, -8, 8, 13]) {
        for (const z of [47, 57]) addStation('massage', 'Ngồi ghế massage · 2 xu', x, z + 2.1, {seat: world(x, floor + .85, z + .17)});
    }
    const lights = [];
    for (const z of [-45, 0, 49]) {
        const light = new THREE.PointLight(0xffe4bd, .82, 43, 1.35);
        light.position.set(0, floor + 5, z);
        root.add(light);
        lights.push(light);
    }

    const dialog = createTerminalDialog('modal-terminal-vip');
    const controls = dialog.overlay.querySelector('.terminal-dialog-actions');
    const status = dialog.overlay.querySelector('p');
    const display = document.createElement('div');
    display.className = 'terminal-arcade-display';
    controls.before(display);
    const prizes = [
        ['Chú lùn','camp_dwarf','dwarf','🧙'], ['Rô bốt','camp_robot','robot','🤖'],
        ['Sói','camp_wolf','wolf','🐺'], ['Thỏ quỷ','camp_rabbit','rabbit','🐰'],
        ['Sinh linh cây','forest_sapling',null,'🌿']
    ];
    const allowed = item => gameState.isPlaying && !gameState.inDialogue && !moonRailway.aboard &&
        !crystalWings.flying && stations.includes(item) && playerGroup.position.distanceTo(item.pos) <= item.radius + .15;
    let round = null, current = null, massage = null, buffUntil = 0, phase = 0;
    const coinPusherChance = .03;
    const baseChance = tier => .8 / 2 ** (tier - 1);
    const chance = (tier, clicks) => Math.min(.95, baseChance(tier) * (1 + .08 * clicks));
    const percent = value => (Math.round(value * 1000) / 10).toLocaleString('vi-VN') + '%';

    function pay(item, amount) {
        if (!allowed(item) || round) return false;
        if (monsterCamps.spend('goldCoin', amount)) return true;
        showNotification('Cần ' + amount + ' xu vàng.');
        return false;
    }

    function pushCoin(item) {
        if (!pay(item, 1)) return false;
        const amount = Math.random() < coinPusherChance ? 50 + Math.floor(Math.random() * 51) : 0;
        if (amount) monsterCamps.add('goldCoin', amount);
        status.textContent = amount ? 'Đồng xu rơi! Bạn nhận ' + amount + ' xu vàng.' : 'Đã đẩy xu. Chưa có đồng nào rơi.';
        display.classList.remove('pushing');
        void display.offsetWidth;
        display.classList.add('pushing');
        return true;
    }

    function boost() {
        if (!round || round.item !== current) return;
        const now = performance.now();
        if (now >= round.end || now - round.lastClick < 180 || round.clicks >= 8) return;
        round.lastClick = now;
        round.clicks++;
        status.textContent = 'Lực kẹp ' + round.clicks + ' / 8 · Tỉ lệ ' + percent(chance(round.tier, round.clicks));
    }

    function settle() {
        if (!round) return;
        const {item, tier, clicks} = round;
        round = null;
        const won = Math.random() < chance(tier, clicks);
        if (won) monsterCamps.add('goldCoin', tier);
        const result = won ? 'Kéo được thú! Bạn nhận ' + tier + ' xu vàng.' : 'Thú tuột khỏi càng kẹp.';
        if (current === item && dialog.overlay.classList.contains('active')) openMachine(item, result);
        else showNotification(result);
    }

    function pull(item, tier) {
        if (!pay(item, 1)) return false;
        round = {item, tier, clicks: 0, lastClick: -Infinity, end: performance.now() + 3000};
        openMachine(item);
        setTimeout(settle, 3000);
        return true;
    }

    function openMachine(item, result) {
        current = item;
        display.className = 'terminal-arcade-display';
        display.replaceChildren();
        display.onclick = null;
        if (item.kind === 'pusher') {
            display.classList.add('terminal-coin-tray');
            for (let i = 0; i < 24; i++) {
                const coin = document.createElement('i');
                coin.style.setProperty('--coin-row', String(Math.floor(i / 8)));
                coin.style.setProperty('--coin-col', String(i % 8));
                display.append(coin);
            }
            dialog.open('Đẩy Xu', result || `Mỗi lần đẩy tốn 1 xu. Tỉ lệ rơi là ${percent(coinPusherChance)}, nhận ngẫu nhiên 50–100 xu.`, [
                ['Đẩy 1 xu', () => pushCoin(item)]
            ]);
            if (round) controls.firstElementChild.disabled = true;
            return;
        }

        display.classList.add('terminal-claw-belt');
        const running = round?.item === item;
        dialog.open('Kéo Thú', result || (running ? 'Bấm chuột trái để tăng lực. Kết quả sau 3 giây.' :
            'Chọn một thú trên băng chuyền. Mỗi lượt tốn 1 xu.'), running ? [['Tăng lực kẹp', boost]] : []);
        for (const [index, [name, id,, symbol]] of prizes.entries()) {
            const tier = index + 1, card = document.createElement('button');
            card.type = 'button';
            card.className = 'terminal-prize';
            card.disabled = Boolean(round);
            if (running && tier === round.tier) card.classList.add('claw-target');
            const image = window.libraryPreviews?.get(id);
            if (image) {
                const picture = document.createElement('img');
                picture.src = image;
                picture.alt = '';
                card.append(picture);
            } else card.append(symbol);
            const label = document.createElement('strong');
            label.textContent = name;
            const reward = document.createElement('span');
            reward.textContent = tier + ' xu · ' + percent(baseChance(tier));
            card.append(label, reward);
            card.onclick = () => pull(item, tier);
            display.append(card);
        }
        display.onclick = running ? boost : null;
        if (!running && !round) display.firstElementChild?.focus();
    }

    function fillStamina() {
        if (gameState.stamina === gameState.maxStamina) return;
        gameState.stamina = gameState.maxStamina;
        updatePlayerVitals();
    }

    function finishMassage(stand = true) {
        if (!massage) return false;
        const {item} = massage;
        massage = null;
        if (stand) {
            playerGroup.position.copy(item.pos);
            currentGroundY = item.pos.y;
            jumpVelocityY = 0;
            isGrounded = true;
            isSitting = false;
        }
        buffUntil = Date.now() + 300000;
        fillStamina();
        showNotification('Massage · Thể lực đầy trong 5 phút.');
        return true;
    }

    function interact(item) {
        if (!allowed(item)) return false;
        if (item.kind !== 'massage') {
            openMachine(item);
            return true;
        }
        if (massage || !pay(item, 2)) return true;
        playerGroup.position.copy(item.seat);
        playerGroup.rotation.y = root.rotation.y;
        currentGroundY = item.seat.y;
        jumpVelocityY = 0;
        isGrounded = isSitting = true;
        heroMotion.stop();
        massage = {item};
        fillStamina();
        showNotification('Đang massage. Nhấn E, C hoặc di chuyển để rời ghế.');
        return true;
    }

    function animateToys(dt, onVip) {
        if (!onVip || !window.monsterCamps) return;
        phase += dt;
        for (const machine of arcadeMachines) {
            if (machine.kind !== 'claw') continue;
            if (!machine.toys.length) {
                for (const [,, kind] of prizes) {
                    const toy = kind ? monsterCamps.preview(kind) : monsterSkills.previewMinion();
                    const bounds = new THREE.Box3().setFromObject(toy);
                    const size = bounds.getSize(new THREE.Vector3());
                    const scale = .44 / Math.max(size.x, size.y, size.z);
                    toy.scale.multiplyScalar(scale);
                    root.add(toy);
                    machine.toys.push({toy, y: floor + 1.4 - bounds.min.y * scale});
                }
            }
            for (const [index, {toy,y}] of machine.toys.entries()) {
                const offset = (phase * .65 + index * .6) % 3 - 1.5;
                toy.position.set(14.7, y + .025 * Math.sin(phase * 11 + index), machine.z + offset);
                toy.visible = Math.abs(offset) < 1.37;
            }
        }
    }

    function update(dt) {
        const onVip = root.visible && gameState.isPlaying && Math.abs(playerGroup.position.y - root.position.y - floor) < 8;
        for (const light of lights) light.visible = onVip;
        animateToys(dt, onVip);
        if (massage) {
            if (!gameState.isPlaying || gameState.health <= 0 || playerGroup.position.distanceTo(massage.item.seat) > 1) finishMassage(false);
            else if (!isSitting || keys.forward || keys.backward || keys.left || keys.right || keys.jump) finishMassage();
        }
        if (massage || Date.now() < buffUntil) fillStamina();
    }
    const button = document.createElement('button');
    button.className = 'tour-btn';
    button.textContent = '✦ ' + stationName + ' · Phòng chờ VIP';
    button.onclick = () => {
        gameHUD.closePanels();
        moonRailway.leaveForRespawn();
        crystalWings.stopFlight();
        playerGroup.position.copy(world(0, floor, -59));
        currentGroundY = playerGroup.position.y;
        jumpVelocityY = 0;
        isGrounded = true;
        playerLife.resetFall();
        worldSurface.resetCamera();
    };
    document.querySelector('#hud-travel .hud-destinations').append(button);
    function seatSupport(x, z, y) {
        const seat = massage?.item.seat;
        if (!seat || !isSitting || Math.abs(y - seat.y) > .35 || Math.hypot(x - seat.x, z - seat.z) > .32) return -Infinity;
        return seat.y;
    }
    return {model, stations, floor, lights, interact, update, seatSupport, finishMassage,
        get staminaLocked() { return Boolean(massage) || Date.now() < buffUntil; },
        get massageRemaining() { return Math.max(0,buffUntil-Date.now()); },
        travel: () => button.click()};
}
