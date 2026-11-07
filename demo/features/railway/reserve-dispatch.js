/* Each departure is a continuous siding move followed by ordinary main-line service. */
function installReserveDispatch({rail, station, reserves, root, world, cameraObstacles, solids}) {
    const queue = [];
    const dialog = createTerminalDialog('modal-reserve-dispatch');
    const bridges = new THREE.Group();
    bridges.name = 'TerminalReserveTurnouts';
    rail.group.add(bridges);
    const ray = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const spacing = rail.minimumHeadway;
    const trainLength = 45;
    const gateOffset = 320;
    const serviceFor = reserve => rail.services.find(service => service.id === reserve.trackId);
    const distanceAhead = (origin, target, length) => ((target - origin) % length + length) % length;
    let departure = null;

    function makeRoute(reserve) {
        const direction = Math.sign(reserve.x);
        const service = serviceFor(reserve);
        const anchor = direction > 0 ? station.distance : station.returnDistance;
        const mergeAt = 204 + (Math.abs(reserve.x) - 30) * 2.5;
        const points = [];
        const lengths = [];
        let length = 0;
        let start = 0;
        for (let step = -38; step <= mergeAt + 1; step += 2) {
            const offset = Math.min(step, mergeAt);
            const main = rail.pose(anchor + offset, service).position;
            const point = world(reserve.x, 18.08, direction * offset);
            const blend = THREE.MathUtils.smootherstep(offset, 104, mergeAt);
            point.lerp(main, blend);
            if (offset > 104) point.y = main.y;
            if (points.length) length += point.distanceTo(points.at(-1));
            points.push(point);
            lengths.push(length);
            if (offset === 30) start = length;
        }
        const merge = (anchor + mergeAt + service.length) % service.length;
        const pose = pathPose(points, lengths, distance => rail.pose(merge + distance, service).position);
        return {points, length, start, merge, service, pose, firstTrack:62, sign:1};
    }

    function pathPose(points, lengths, continuePath) {
        const length=lengths.at(-1);
        function point(distance) {
            if (distance >= length) return continuePath(distance-length);
            let low = 0, high = lengths.length - 1;
            while (high - low > 1) {
                const middle = (low + high) >> 1;
                if (lengths[middle] <= distance) low = middle;
                else high = middle;
            }
            const t = THREE.MathUtils.clamp((distance - lengths[low]) / (lengths[high] - lengths[low]), 0, 1);
            return points[low].clone().lerp(points[high], t);
        }
        return distance => {
            const front = point(distance + 4);
            const rear = point(distance - 4);
            const direction = front.clone().sub(rear);
            const position = rear.lerp(front, .5);
            position.y += .16;
            return {position, yaw: Math.atan2(direction.x, direction.z), pitch: -Math.atan2(direction.y, Math.hypot(direction.x, direction.z))};
        };
    }

    function makeInbound(reserve) {
        const dir=-Math.sign(reserve.x),service=serviceFor(reserve);
        const anchor=dir<0?station.distance:station.returnDistance;
        const start=world(reserve.x,18.08,dir*106);
        const front=world(reserve.x,18.08,dir*107).sub(start).normalize();
        const firstOffset=150+(Math.abs(reserve.x)-30)*2;
        const entryCandidates=[];
        for(let offset=firstOffset;offset<=firstOffset+680;offset+=6){
            const merge=(anchor-offset+service.length)%service.length;
            const end=rail.pose(merge,service).position;
            const tangent=rail.pose(merge-4,service).position.sub(rail.pose(merge+4,service).position).normalize();
            const ahead=end.clone().sub(start).dot(front);
            if(ahead<60||tangent.dot(front)<.55)continue;
            const reach=Math.min(115,ahead*.35);
            const curve=new THREE.CubicBezierCurve3(start,start.clone().addScaledVector(front,reach),end.clone().addScaledVector(tangent,-reach),end);
            const curveLength=curve.getLength();
            const points=curve.getSpacedPoints(Math.ceil(curveLength/2));
            const clear=points.every((p,i)=>i===points.length-1||p.y>rail.terrainHeight(p.x,p.z)-.02);
            if(clear){
                entryCandidates.push({merge,points,score:curveLength+Math.abs(end.y-start.y)*2});
                if(entryCandidates.length>=8)break;
            }
        }
        entryCandidates.sort((a,b)=>a.score-b.score);
        const entry=entryCandidates[0];
        if(!entry)throw new Error('No safe rear turnout for '+reserve.id);
        const points=[];
        for(let step=-38;step<106;step+=2)points.push(world(reserve.x,18.08,dir*step));
        points.push(...entry.points);
        const lengths=[0];
        for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+points[i].distanceTo(points[i-1]));
        const length=lengths.at(-1),dock=lengths[4];
        const backwards=pathPose(points,lengths,distance=>rail.pose(entry.merge-distance,service).position);
        return {points,length:length-dock,merge:entry.merge,service,firstTrack:62,sign:-1,pose(distance){
            const p = backwards(length - distance);
            p.yaw += Math.PI;
            p.pitch *= -1;
            return p;
        }};
    }

    function buildTrack(route) {
        const {points, service, merge, sign, firstTrack} = route;
        const parts = new Map();
        const angle = new THREE.Matrix4();
        function beam(material, position, width, height, depth, yaw = 0, pitch = 0) {
            const geometry = new THREE.BoxGeometry(width, height, depth);
            angle.makeRotationFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
            angle.setPosition(position);
            geometry.applyMatrix4(angle);
            if (!parts.has(material)) parts.set(material, {positions: [], normals: [], indices: []});
            const bin = parts.get(material);
            const offset = bin.positions.length / 3;
            bin.positions.push(...geometry.attributes.position.array);
            bin.normals.push(...geometry.attributes.normal.array);
            for (const index of geometry.index.array) bin.indices.push(offset + index);
            geometry.dispose();
        }
        for (let i = firstTrack; i < points.length - 1; i++) {
            const a = points[i], b = points[i + 1];
            const center = a.clone().lerp(b, .5);
            const direction = b.clone().sub(a);
            const yaw = Math.atan2(direction.x, direction.z);
            const pitch = -Math.atan2(direction.y, Math.hypot(direction.x, direction.z));
            const main = rail.pose(merge - sign * (points.length - 1 - i) * 2, service).position;
            const offset = Math.hypot(center.x - main.x, center.z - main.z);
            if (offset < .6) continue;
            for (const side of [-1, 1]) {
                const p = center.clone().add(new THREE.Vector3(Math.cos(yaw) * side * 2.15, .26, -Math.sin(yaw) * side * 2.15));
                beam(rail.materials.steel, p, .17, .22, direction.length() + .025, yaw, pitch);
            }
            beam(rail.materials.wood, center.clone().add(new THREE.Vector3(0, .1, 0)), 5.5, .16, .45, yaw, pitch);
            if (i < 66 || offset < 4.5) continue;
            beam(rail.materials.stone, center.clone().add(new THREE.Vector3(0, -.68, 0)), 7.4, 1.05, direction.length() + .055, yaw, pitch);
            if (i % 12 === 0) {
                const ground = rail.terrainHeight(center.x, center.z);
                const height = center.y - ground - 1.1;
                if (height > .5) beam(rail.materials.stone, new THREE.Vector3(center.x, ground + height / 2, center.z), 1.9, height, 2.15, yaw);
            }
        }
        for (const [material, bin] of parts) {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(bin.positions, 3));
            geometry.setAttribute('normal', new THREE.Float32BufferAttribute(bin.normals, 3));
            geometry.setIndex(bin.indices);
            bridges.add(new THREE.Mesh(geometry, material));
        }
    }

    const signalColors = {parked: 0xe05b51, queued: 0xefbd61, joining: 0x5ce69c, active: 0x498a9d, returnQueued: 0xefbd61, returning: 0x5ce69c};
    const labels = {parked:'Đang nghỉ tại bến', queued:'Chờ nhập tuyến', joining:'Đang nhập tuyến', active:'Đang chạy tuyến chính', returnQueued:'Chờ về bến', returning:'Đang vào bến từ phía sau'};
    function createGates(reserve) {
        return [-85, 85].map(z => {
            const barrier = new THREE.Mesh(new THREE.BoxGeometry(6, .32, .3), rail.materials.gold);
            barrier.name = 'ReserveGate_' + reserve.id;
            barrier.position.set(reserve.x, 19.25, z);
            root.add(barrier);
            cameraObstacles.push(barrier);
            const collider = {name:barrier.name, minX:reserve.x-3,maxX:reserve.x+3,minY:18.55,maxY:19.5,minZ:z-.2,maxZ:z+.2};
            solids.push(collider);
            for (const dx of [-3.55,3.55]) {
                const post = new THREE.Mesh(new THREE.BoxGeometry(.32, 1.7, .4), rail.materials.steel);
                post.position.set(reserve.x+dx,18.9,z);
                root.add(post);
            }
            return {barrier,collider};
        });
    }
    function setGates(reserve, open) {
        for (const gate of reserve.gates) {
            gate.barrier.visible = !open;
            gate.collider.disabled = open;
        }
    }
    function setStatus(reserve, status) {
        reserve.status = status;
        reserve.signal.material.color.setHex(signalColors[status]);
        setGates(reserve, status === 'joining' || status === 'returning');
    }
    for (const reserve of reserves) {
        reserve.route = makeRoute(reserve);
        reserve.inbound = makeInbound(reserve);
        buildTrack(reserve.route);
        buildTrack(reserve.inbound);
        reserve.gates = createGates(reserve);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(.23, 10, 8), new THREE.MeshBasicMaterial());
        const post = new THREE.Mesh(new THREE.CylinderGeometry(.08, .13, 2, 8), rail.materials.steel);
        const side = Math.sign(reserve.x);
        lamp.position.set(reserve.x + side * 4.5, 20.15, side * 78);
        post.position.copy(lamp.position).y -= 1.13;
        root.add(lamp, post);
        reserve.signal = lamp;
        setStatus(reserve, 'parked');
    }

    function request(reserve) {
        if (!reserves.includes(reserve) || reserve.status !== 'parked') return false;
        setStatus(reserve, 'queued');
        queue.push(reserve);
        showNotification('Tàu ' + reserve.name + ' đang chờ tín hiệu nhập tuyến chính.');
        return true;
    }
    function cancel(reserve) {
        const index = queue.indexOf(reserve);
        if (index < 0) return;
        queue.splice(index, 1);
        setStatus(reserve, 'parked');
        return true;
    }

    function pointAt(event) {
        if (!root.visible || !gameState.isPlaying || gameState.inDialogue || rail.aboard || document.querySelector('.modal-overlay.active')) return false;
        if (playerGroup.position.distanceTo(root.position) > 115) return false;
        const rect = renderer.domElement.getBoundingClientRect();
        if (window.gameMouse?.captured) mouse.set(0, 0);
        else mouse.set((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2);
        root.updateWorldMatrix(true, true);
        camera.updateMatrixWorld();
        ray.setFromCamera(mouse, camera);
        ray.far = 65;
        const parked = reserves.filter(reserve => reserve.parked);
        const hit = ray.intersectObjects(parked.flatMap(reserve => reserve.display), false)[0];
        if (!hit) return false;
        const obstruction = ray.intersectObjects(cameraObstacles.filter(mesh => mesh.visible), false)[0];
        if (obstruction && obstruction.distance < hit.distance - .04) return false;
        const reserve = parked.find(item => item.display.includes(hit.object));
        const queued = reserve.status === 'queued';
        dialog.open('Tàu dự bị ' + reserve.name, queued ? 'Đang chờ đoàn phía trước đi qua và tín hiệu an toàn.' : 'Tàu sẽ rời bến khi có khoảng trống an toàn trên đường ray.', [
            queued ? ['Hủy yêu cầu', () => { cancel(reserve); dialog.close(); }] : ['Chạy tuyến chính', () => { dialog.close(); request(reserve); }],
            ['Bảng điều độ', openFleet],
        ]);
        return true;
    }

    function neighbors(reserve, distance) {
        const length = reserve.route.service.length;
        let ahead = length, behind = length, leader = null;
        for (const train of rail.trains) {
            if (train.trackId !== reserve.trackId) continue;
            const gap = distanceAhead(distance, train.distance, length);
            if (gap < ahead) { ahead = gap; leader = train; }
            behind = Math.min(behind, distanceAhead(train.distance, distance, length));
        }
        return {ahead, behind, leader};
    }
    function ready(reserve) {
        const {ahead, behind} = neighbors(reserve, reserve.route.merge);
        return ahead >= spacing && ahead <= 460 && behind > gateOffset + spacing + 32;
    }
    function start(reserve) {
        queue.splice(queue.indexOf(reserve), 1);
        reserve.parked = false;
        setStatus(reserve, 'joining');
        reserve.display.forEach(mesh => { mesh.visible = false; });
        reserve.group.updateWorldMatrix(true, true);
        for (const vehicle of reserve.vehicles) {
            rail.group.attach(vehicle);
            vehicle.visible = true;
        }
        departure = {reserve, train: {id: 'reserve-' + reserve.id, name: 'Tàu ' + reserve.name, vehicles: reserve.vehicles, speed: 0, state: 'moving'}, distance: reserve.route.start, inbound: false};
    }
    function signalGap(train) {
        if (!departure || train.trackId !== departure.reserve.trackId) return Infinity;
        const {reserve,inbound,distance} = departure;
        const {merge,service} = inbound ? reserve.inbound : reserve.route;
        if(inbound && distance > trainLength + 14) return Infinity;
        return distanceAhead(train.distance, merge - (inbound ? 0 : gateOffset), service.length);
    }
    function accelerate(train) {
        const pending = departure && !departure.inbound ? [departure.reserve, ...queue] : queue;
        return pending.some(reserve => {
            if (reserve.trackId !== train.trackId) return false;
            const {leader, ahead} = neighbors(reserve, reserve.route.merge);
            return leader === train && ahead < 255;
        });
    }
    function update(dt) {
        const overlay=document.querySelector('.modal-overlay.active');
        if (!gameState.isPlaying || gameState.inDialogue || overlay && overlay!==fleet.overlay) return;
        if (departure?.inbound) { updateReturn(dt); return; }
        if (!departure) {
            const next = queue.find(ready);
            if (next) start(next);
            else return;
        }
        const {reserve, train} = departure;
        const route = reserve.route;
        const onMain = Math.max(0, departure.distance - route.length);
        const ahead = neighbors(reserve, route.merge + onMain).ahead;
        const available = Math.max(0, ahead + Math.max(0, route.length - departure.distance) - spacing);
        const target = Math.min(22, Math.sqrt(8 * available));
        const speed = Math.min(target, train.speed + 4 * dt);
        const distance = Math.min(route.length + trainLength + 9, departure.distance + Math.min(available, speed * dt));
        const poses = train.vehicles.map((_, i) => route.pose(distance - i * 15));
        const nearMain = rail.trains.filter(other => other.vehicles[0].position.distanceToSquared(poses[0].position) < 160 ** 2);
        if (nearMain.some(other => other.vehicles.some(car => poses.some(p => p.position.distanceToSquared(car.position) < 14 ** 2)))) {
            train.speed = 0;
            return;
        }
        departure.distance = distance;
        train.speed = speed;
        train.vehicles.forEach((vehicle, i) => {
            const p = poses[i];
            vehicle.position.copy(p.position);
            vehicle.rotation.set(p.pitch, p.yaw, 0, 'YXZ');
        });
        if (distance < route.length + trainLength + 9) return;
        const mainDistance = (route.merge + distance - route.length) % route.service.length;
        const gap = neighbors(reserve, mainDistance);
        if (gap.ahead < spacing - .001 || gap.behind < spacing - .001) return;
        reserve.train = rail.admitReserve(reserve, mainDistance, speed);
        setStatus(reserve, 'active');
        departure = null;
        showNotification('Tàu ' + reserve.name + ' đã vào tuyến chính.');
    }
    function requestRest(reserve) {
        if (!reserves.includes(reserve) || reserve.status !== 'active' || !rail.trains.includes(reserve.train) || rail.aboard && rail.activeTrain === reserve.train) return false;
        reserve.train.returnToDepot = true;
        setStatus(reserve, 'returnQueued');
        return true;
    }

    function keepRunning(reserve) {
        if (reserve.status !== 'returnQueued') return false;
        reserve.train.returnToDepot = false;
        setStatus(reserve, 'active');
        return true;
    }

    function returnGap(train) {
        if (departure || !train.returnToDepot || rail.aboard && rail.activeTrain === train) return Infinity;
        const reserve = reserves.find(r => r.train === train && r.status === 'returnQueued');
        return reserve ? distanceAhead(train.distance, reserve.inbound.merge, train.length) : Infinity;
    }

    function tryReturn(train) {
        const gap=returnGap(train);
        if (!Number.isFinite(gap) || Math.min(gap, train.length-gap) > .002) return false;
        const reserve = reserves.find(r => r.train === train);
        const speed = Math.min(18, train.speed);
        if (!rail.releaseReserve(train)) return false;
        setStatus(reserve, 'returning');
        departure = {reserve, train, distance: 0, inbound: true};
        train.speed = speed;
        return true;
    }

    function updateReturn(dt) {
        const {reserve, train} = departure;
        const route = reserve.inbound;
        const remaining = Math.max(0, route.length - departure.distance);
        const speed = Math.min(18, train.speed + 4 * dt, Math.sqrt(8 * remaining));
        const distance = Math.min(route.length, departure.distance + Math.max(.02, speed) * dt);
        const poses = train.vehicles.map((_, i) => route.pose(distance - i * 15));
        if (rail.trains.some(other => other.vehicles[0].position.distanceToSquared(poses[0].position) < 160 ** 2 &&
            other.vehicles.some(car => poses.some(p => p.position.distanceToSquared(car.position) < (other.trackId===train.trackId?14:9) ** 2)))) {
            train.speed = 0;
            return;
        }
        departure.distance = distance;
        train.speed = speed;
        train.vehicles.forEach((vehicle, i) => {
            const p = poses[i];
            vehicle.position.copy(p.position);
            vehicle.rotation.set(p.pitch, p.yaw, 0, 'YXZ');
        });
        rail.updateGangways(train);
        if (distance < route.length) return;
        rail.parkReserve(reserve, train);
        reserve.train = null;
        reserve.parked = true;
        setStatus(reserve, 'parked');
        departure = null;
        showNotification('Tàu ' + reserve.name + ' đã về đường nghỉ.');
    }

    const fleet = createTerminalDialog('modal-terminal-fleet');
    fleet.overlay.querySelector('.terminal-dialog').classList.add('terminal-fleet');
    const toolbar = document.createElement('button');
    toolbar.type = 'button';
    toolbar.className = 'hud-action';
    toolbar.textContent = '🚦';
    toolbar.title = 'U · Điều độ tàu';
    toolbar.setAttribute('aria-label','Điều độ tàu');
    toolbar.onclick = openFleet;
    document.querySelector('.hud-actions').append(toolbar);
    window.addEventListener('keydown',event=>{
        if(event.key.toLowerCase()!=='u'||event.repeat||event.ctrlKey||event.altKey||event.metaKey||event.target.closest?.('input, textarea, select'))return;
        const overlay=document.querySelector('.modal-overlay.active');
        if(overlay===fleet.overlay)fleet.close();
        else if(!overlay&&openFleet())event.preventDefault();
    });

    function openFleet() {
        if (!gameState.isPlaying || gameState.inDialogue || rail.aboard) return false;
        fleet.open('Điều độ toàn bộ đoàn tàu', 'Sáu đoàn chính luôn phục vụ. Tàu dự bị về bến theo đường nhập từ phía sau.', [
            ['Cho tất cả tàu dự bị chạy', () => { for (const r of reserves) if (r.status === 'returnQueued') keepRunning(r); else request(r); openFleet(); }],
            ['Cho tất cả tàu dự bị về nghỉ', () => { for (const r of reserves) if (r.status === 'queued') cancel(r); else requestRest(r); openFleet(); }]
        ]);
        refreshFleet();
        return true;
    }

    let fleetSignature = '';
    function refreshFleet() {
        if (!fleet.overlay.classList.contains('active')) return;
        const main=rail.trains.filter(t => !t.id.startsWith('reserve-'));
        const next=main.map(t=>t.state+':'+Boolean(t.waitingForSignal)).join(',')+';'+reserves.map(r=>r.status).join(',');
        if(fleetSignature===next)return;
        fleetSignature=next;
        const actions = fleet.overlay.querySelector('.terminal-dialog-actions');
        let list = fleet.overlay.querySelector('.terminal-fleet-list');
        if (!list) {
            list = document.createElement('div');
            list.className = 'terminal-fleet-list';
            actions.before(list);
        }
        list.replaceChildren();
        const addRow = (name, color, info, text, action) => {
            const row = document.createElement('div'), title = document.createElement('strong'), state = document.createElement('span');
            title.textContent = name;
            title.style.borderColor = color;
            state.textContent = info;
            row.append(title, state);
            if (action) {
                const button = document.createElement('button');
                button.type = 'button';
                button.textContent = text;
                button.onclick = () => { action(); openFleet(); };
                row.append(button);
            }
            list.append(row);
        };
        for (const train of main) addRow(train.name, train.color,
            (train.state === 'stopped' ? 'Đang dừng ga' : train.waitingForSignal ? 'Chờ tín hiệu' : 'Đang chạy') + ' · Đoàn chính');
        for (const r of reserves) {
            const controls = {parked:['Chạy tuyến chính',()=>request(r)], queued:['Hủy lệnh chạy',()=>cancel(r)], active:['Về nghỉ',()=>requestRest(r)], returnQueued:['Tiếp tục chạy',()=>keepRunning(r)]};
            addRow('Tàu ' + r.name, r.color, (r.trackId === 'return' ? 'Chiều ngược' : 'Chiều xuôi') + ' · ' + labels[r.status], ...(controls[r.status] || []));
        }
    }

    return {queue, bridges, request, requestRest, openFleet, refreshFleet, returnGap, tryReturn, pointAt, update, signalGap, accelerate, get joining() { return departure; }};
}
