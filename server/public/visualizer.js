const canvas = document.getElementById('battleCanvas');
const ctx = canvas.getContext('2d');
const logDiv = document.getElementById('logs');
const errorDiv = document.getElementById('error-msg');

// Screens
const authScreen = document.getElementById('auth-screen');
const dashScreen = document.getElementById('dashboard-screen');
const battleContainer = document.getElementById('battle-container');

// Elements
const heroList = document.getElementById('hero-list');
const invList = document.getElementById('inv-list');
const displayUser = document.getElementById('display-username');
const displayGold = document.getElementById('display-gold');

// Breeding Elements
const selectFather = document.getElementById('select-father');
const selectMother = document.getElementById('select-mother');
const btnBreed = document.getElementById('btn-breed');

const CELL_SIZE = 64;
const GRID_W = 8;
const GRID_H = 10;

let socket = new WebSocket('ws://localhost:3000');
let currentUser = null;

socket.onopen = () => console.log("Connected to Game Server");
socket.onclose = () => showError("Disconnected from server. Please refresh.");

// --- AUTHENTICATION HANDLERS ---

document.getElementById('btn-login').onclick = () => {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    if(!user || !pass) return showError("Please fill all fields");
    socket.send(JSON.stringify({ type: "login", username: user, password: pass }));
};

document.getElementById('btn-register').onclick = () => {
    const user = document.getElementById('reg-user').value;
    const pass = document.getElementById('reg-pass').value;
    if(!user || !pass) return showError("Please fill all fields");
    socket.send(JSON.stringify({ type: "register", username: user, password: pass }));
};

document.getElementById('btn-logout').onclick = () => {
    location.reload();
};

// --- BREEDING HANDLER ---

btnBreed.onclick = () => {
    const fatherId = selectFather.value;
    const motherId = selectMother.value;
    if (!fatherId || !motherId) return showError("Select both parents!");

    socket.send(JSON.stringify({
        type: "breed_heroes",
        account: currentUser,
        fatherId: fatherId,
        motherId: motherId
    }));
};

document.getElementById('start-btn').onclick = () => {
    if (!currentUser) return;
    logDiv.innerHTML = "";
    battleContainer.classList.remove('hidden');
    addLog(`Requesting battle for ${currentUser}...`);
    socket.send(JSON.stringify({ type: "start_battle", account: currentUser }));
};

// --- SERVER MESSAGE HANDLER ---

socket.onmessage = async (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === "register_success") {
        alert(`Account '${msg.username}' created! Please login.`);
    }
    else if (msg.type === "login_success") {
        currentUser = msg.user.username;
        showDashboard(msg.user);
    }
    else if (msg.type === "breed_success") {
        alert(`New Hero Born: ${msg.hero.name}!`);
        // Refresh dashboard (lazy refresh for demo)
        socket.send(JSON.stringify({ type: "login", username: currentUser, password: "" })); // Request refresh
    }
    else if (msg.type === "error") {
        showError(msg.message || "Unknown error");
    }
    else if (msg.type === "battle_replay") {
        await playReplay(msg);
    }
};

// --- UI FUNCTIONS ---

function showError(text) {
    errorDiv.innerText = text;
    setTimeout(() => errorDiv.innerText = "", 3000);
}

function addLog(text, color="#aaa") {
    const p = document.createElement('div');
    p.style.color = color;
    p.style.borderBottom = "1px solid #222";
    p.innerText = text;
    logDiv.prepend(p);
}

function showDashboard(user) {
    authScreen.classList.add('hidden');
    dashScreen.classList.remove('hidden');
    
    displayUser.innerText = `Commander ${user.username}`;
    displayGold.innerText = `Gold: ${user.gold}`;

    // Render Heroes & Populate Breeding Selects
    heroList.innerHTML = "";
    selectFather.innerHTML = '<option value="">Select Father (Male)</option>';
    selectMother.innerHTML = '<option value="">Select Mother (Female)</option>';

    if(user.heroes.length === 0) heroList.innerText = "No heroes recruited.";
    
    user.heroes.forEach(h => {
        const row = document.createElement('div');
        row.className = "item-row";
        const stats = JSON.parse(h.baseStats);
        const genderIcon = h.gender === "MALE" ? "♂️" : "♀️";
        row.innerHTML = `<span>${genderIcon} ${h.name} (Gen ${h.generation})</span> <span style="color:#4caf50">HP: ${stats.hp_base}</span>`;
        heroList.appendChild(row);

        // Add to breeding selects based on gender
        const opt = document.createElement('option');
        opt.value = h.id;
        opt.innerText = `${h.name} (Gen ${h.generation})`;
        if (h.gender === "MALE") selectFather.appendChild(opt);
        else selectMother.appendChild(opt);
    });

    // Render Inventory
    invList.innerHTML = "";
    if(user.inventory.length === 0) invList.innerText = "Empty bag.";
    user.inventory.forEach(item => {
        const row = document.createElement('div');
        row.className = "item-row";
        row.innerHTML = `<span>${item.templateId}</span> <span>x${item.quantity}</span>`;
        invList.appendChild(row);
    });
}

// --- VISUALIZER (PlayReplay, drawTerrain, drawUnits remain the same) ---
async function playReplay(replay) {
    const logs = replay.logs;
    const terrain = replay.terrain_grid;
    battleContainer.classList.remove('hidden');
    addLog("--- BATTLE START ---", "#4caf50");
    for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        drawTerrain(terrain);
        drawUnits(log.unit_states);
        if (log.type !== "WAIT") addLog(`[${log.tick}] ${log.message}`);
        if (i < logs.length - 1 && logs[i+1].tick !== log.tick) await new Promise(r => setTimeout(r, 150));
        else await new Promise(r => setTimeout(r, 10));
    }
    addLog(`WINNER: TEAM ${replay.winner}`, "#ffd700");
}

function drawTerrain(grid) {
    const colors = { 0: "#2d5a27", 3: "#ff4500", 5: "#1b3d11" };
    for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
            ctx.fillStyle = colors[grid[y][x]] || "#111";
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            ctx.strokeStyle = "rgba(255,255,255,0.05)";
            ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }
}

function drawUnits(states) {
    for (let id in states) {
        const u = states[id];
        const px = u.pos.x * CELL_SIZE + CELL_SIZE/2;
        const py = u.pos.y * CELL_SIZE + CELL_SIZE/2;
        ctx.beginPath();
        ctx.arc(px, py, 20, 0, Math.PI * 2);
        ctx.fillStyle = id.includes("orc") ? "#ff4444" : "#00ffff";
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.fillRect(px - 25, py - 35, 50, 6);
        ctx.fillStyle = "#44ff44";
        ctx.fillRect(px - 25, py - 35, Math.max(0, (u.hp / 100) * 50), 6); 
    }
}