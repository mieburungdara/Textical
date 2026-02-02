let socket = new WebSocket('ws://localhost:3000');
let currentUser = null;
let selectedImageData = null;

const authScreen = document.getElementById('auth-screen');
const sidebar = document.getElementById('admin-sidebar');
const mainWrapper = document.getElementById('main-wrapper');
const monsterList = document.getElementById('monster-list');
const regionList = document.getElementById('region-list');
const raceGrid = document.getElementById('race-grid');
const syncStatus = document.getElementById('sync-status');

// Modals
const monsterModal = document.getElementById('monster-modal');
const regionModal = document.getElementById('region-modal');

// --- AUTH ---
document.getElementById('btn-dev-login').onclick = () => socket.send(JSON.stringify({ type: "admin_bypass_login" }));
document.getElementById('btn-login').onclick = () => {
    socket.send(JSON.stringify({ type: "login", username: document.getElementById('login-user').value, password: document.getElementById('login-pass').value }));
};

// --- NAVIGATION ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById(`page-${pageId}`).classList.remove('hidden');
    // Mark active link
    const links = document.querySelectorAll('.nav-link');
    links.forEach(l => { if(l.innerText.toLowerCase().includes(pageId)) l.classList.add('active'); });
}

// --- SYNC ACTIONS ---
document.getElementById('btn-import').onclick = () => {
    if(confirm("IMPORT: Overwrite DB with JSON files? Current unsaved DB changes will be lost.")) {
        syncStatus.innerHTML = "<span style='color:#ffd700'>Processing Import... Please wait.</span>";
        socket.send(JSON.stringify({ type: "admin_sync_import" }));
    }
};

document.getElementById('btn-export').onclick = () => {
    if(confirm("EXPORT: Overwrite JSON files with DB data? Mesin game akan menggunakan data ini.")) {
        syncStatus.innerHTML = "<span style='color:#ffd700'>Processing Export... Please wait.</span>";
        socket.send(JSON.stringify({ type: "admin_sync_export" }));
    }
};

// --- MONSTERS ---
function openMonsterEditor(m = null) {
    monsterModal.classList.remove('hidden');
    if(m) {
        document.getElementById('m-id').value = m.id; document.getElementById('m-id').disabled = true;
        document.getElementById('m-name').value = m.name; document.getElementById('m-hp').value = m.hp_base;
        document.getElementById('m-dmg').value = m.damage_base; document.getElementById('m-spd').value = m.speed_base;
        document.getElementById('m-exp').value = m.exp_reward;
    } else {
        document.getElementById('m-id').value = ""; document.getElementById('m-id').disabled = false;
        document.getElementById('m-name').value = "";
    }
}

document.getElementById('btn-save-monster').onclick = () => {
    const data = {
        id: document.getElementById('m-id').value, name: document.getElementById('m-name').value,
        hp: parseInt(document.getElementById('m-hp').value), dmg: parseInt(document.getElementById('m-dmg').value),
        spd: parseInt(document.getElementById('m-spd').value), exp: parseInt(document.getElementById('m-exp').value)
    };
    socket.send(JSON.stringify({ type: "admin_save_monster", data }));
    closeModal();
};

// --- REGIONS ---
function openRegionEditor(r = null) {
    regionModal.classList.remove('hidden');
    if(r) {
        document.getElementById('r-id').value = r.id; document.getElementById('r-id').disabled = true;
        document.getElementById('r-name').value = r.name; document.getElementById('r-type').value = r.type;
        document.getElementById('r-desc').value = r.description; document.getElementById('r-conn').value = r.connections;
    } else {
        document.getElementById('r-id').value = ""; document.getElementById('r-id').disabled = false;
        document.getElementById('r-name').value = ""; document.getElementById('r-conn').value = "";
    }
}

document.getElementById('btn-save-region').onclick = () => {
    const data = {
        id: document.getElementById('r-id').value, name: document.getElementById('r-name').value,
        type: document.getElementById('r-type').value, description: document.getElementById('r-desc').value,
        connections: document.getElementById('r-conn').value
    };
    socket.send(JSON.stringify({ type: "admin_save_region", data }));
    closeModal();
};

// --- RACES ---
function renderRaces(races) {
    raceGrid.innerHTML = "";
    races.forEach(r => {
        const card = document.createElement('div');
        card.style = "background:#161616; padding:15px; border-radius:8px; border:1px solid #333;";
        card.innerHTML = `
            <strong style="color:#4caf50">${r.id.toUpperCase()}</strong>
            <textarea id="race-data-${r.id}" style="height:100px; font-family:monospace; font-size:11px; margin-top:10px; background:#222; color:#fff; border:1px solid #444; width:100%;">${JSON.stringify(JSON.parse(r.bonusData), null, 2)}</textarea>
        `;
        raceGrid.appendChild(card);
    });
}

document.getElementById('btn-save-all-races').onclick = () => {
    const raceCards = raceGrid.querySelectorAll('textarea');
    const data = Array.from(raceCards).map(ta => ({
        id: ta.id.replace('race-data-', ''),
        bonusData: JSON.stringify(JSON.parse(ta.value))
    }));
    socket.send(JSON.stringify({ type: "admin_save_all_races", data }));
};

// --- VISUALIZER LOGIC ---
let replayData = null;
let currentTickIdx = 0;
let isPlaying = false;
let playbackTimer = null;

const canvas = document.getElementById('battle-canvas');
const ctx = canvas.getContext('2d');
const GRID_SIZE = 50;
const TILE_SIZE = 600 / GRID_SIZE;

async function loadReplay() {
    const battleId = document.getElementById('viz-battle-id').value;
    if (!battleId) return alert("Please enter a Battle ID.");

    try {
        const response = await fetch(`/api/battle/replay/${battleId}`);
        const result = await response.json();
        
        if (result.success) {
            replayData = result.data;
            currentTickIdx = 0;
            document.getElementById('viz-range').max = replayData.length - 1;
            document.getElementById('viz-range').value = 0;
            renderCurrentTick();
            updateLog();
        } else {
            alert("Error: " + result.message);
        }
    } catch (e) {
        alert("Failed to fetch replay.");
    }
}

function renderCurrentTick() {
    if (!replayData) return;
    const tick = replayData[currentTickIdx];
    
    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 600, 600);
    
    // Draw Grid
    ctx.strokeStyle = '#222';
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath(); ctx.moveTo(i * TILE_SIZE, 0); ctx.lineTo(i * TILE_SIZE, 600); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * TILE_SIZE); ctx.lineTo(600, i * TILE_SIZE); ctx.stroke();
    }

    // Draw Units
    tick.units.forEach(u => {
        ctx.fillStyle = u.team === 0 ? '#4caf50' : '#f44336';
        ctx.fillRect(u.pos.x * TILE_SIZE, u.pos.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        
        // HP Bar
        const hpPercent = u.hp / u.maxHp;
        ctx.fillStyle = '#333';
        ctx.fillRect(u.pos.x * TILE_SIZE, u.pos.y * TILE_SIZE - 4, TILE_SIZE, 3);
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(u.pos.x * TILE_SIZE, u.pos.y * TILE_SIZE - 4, TILE_SIZE * hpPercent, 3);
    });

    document.getElementById('viz-tick').innerText = `Tick: ${tick.tick} / ${replayData[replayData.length-1].tick}`;
}

function updateLog() {
    if (!replayData) return;
    const logEl = document.getElementById('viz-log');
    const tick = replayData[currentTickIdx];
    
    if (tick.events.length > 0) {
        logEl.innerHTML = tick.events.map(e => `<div>[${e.type}] ${e.msg}</div>`).join('') + "<hr>" + logEl.innerHTML;
    }
}

function playbackStep(dir) {
    currentTickIdx = Math.max(0, Math.min(replayData.length - 1, currentTickIdx + dir));
    document.getElementById('viz-range').value = currentTickIdx;
    renderCurrentTick();
    updateLog();
}

function togglePlayback() {
    isPlaying = !isPlaying;
    const btn = document.getElementById('btn-play');
    btn.innerText = isPlaying ? "PAUSE" : "PLAY";
    btn.style.background = isPlaying ? "#f44336" : "#4caf50";

    if (isPlaying) {
        playbackTimer = setInterval(() => {
            if (currentTickIdx >= replayData.length - 1) {
                togglePlayback();
                return;
            }
            playbackStep(1);
        }, 100);
    } else {
        clearInterval(playbackTimer);
    }
}

document.getElementById('viz-range').oninput = (e) => {
    currentTickIdx = parseInt(e.target.value);
    renderCurrentTick();
    updateLog();
};

// --- GLOBAL ---
function closeModal() {
    monsterModal.classList.add('hidden');
    regionModal.classList.add('hidden');
}

// --- SERVER MESSAGE HANDLER ---
socket.onmessage = async (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "login_success" && msg.user.username === "admin") {
        authScreen.classList.add('hidden'); sidebar.classList.remove('hidden'); mainWrapper.classList.remove('hidden');
        socket.send(JSON.stringify({ type: "admin_fetch_data" }));
    } 
    else if (msg.type === "admin_data_load") {
        renderMonsters(msg.monsters); renderRegions(msg.regions); renderRaces(msg.races);
    }
    else if (msg.type === "sync_result") {
        const s = msg.stats;
        syncStatus.innerHTML = `<span style='color:#4caf50'>SUCCESS:</span> ${s.monsters} Monsters, ${s.regions} Regions, ${s.races} Races, ${s.items} Items synced.`;
        setTimeout(() => syncStatus.innerText = "Ready.", 5000);
    }
    else if (msg.type === "success") {
        syncStatus.innerText = msg.message;
        setTimeout(() => syncStatus.innerText = "Ready.", 3000);
    }
};

function renderMonsters(monsters) {
    monsterList.innerHTML = "";
    monsters.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td><code>${m.id}</code></td><td>${m.name}</td><td>${m.hp_base}</td><td>${m.damage_base}</td>
            <td><button class="btn-secondary" style="font-size:10px;" onclick='openMonsterEditor(${JSON.stringify(m)})'>EDIT</button></td>`;
        monsterList.appendChild(tr);
    });
}

function renderRegions(regions) {
    regionList.innerHTML = "";
    regions.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td><code>${r.id}</code></td><td>${r.name}</td><td>${r.type}</td><td>${r.connections}</td>
            <td><button class="btn-secondary" style="font-size:10px;" onclick='openRegionEditor(${JSON.stringify(r)})'>EDIT</button></td>`;
        regionList.appendChild(tr);
    });
}
