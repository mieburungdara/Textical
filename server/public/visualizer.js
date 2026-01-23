const canvas = document.getElementById('battleCanvas');
const ctx = canvas.getContext('2d');
const logDiv = document.getElementById('logs');
const errorDiv = document.getElementById('error-msg');

const authScreen = document.getElementById('auth-screen');
const dashScreen = document.getElementById('dashboard-screen');
const battleContainer = document.getElementById('battle-container');

const heroList = document.getElementById('hero-list');
const invList = document.getElementById('inv-list');
const displayUser = document.getElementById('display-username');
const displayGold = document.getElementById('display-gold');

const selectFather = document.getElementById('select-father');
const selectMother = document.getElementById('select-mother');
const btnBreed = document.getElementById('btn-breed');

const CELL_SIZE = 64;
const GRID_W = 8;
const GRID_H = 10;

let socket = new WebSocket('ws://localhost:3000');
let currentUser = null;
let currentHeroes = [];

socket.onopen = () => console.log("Connected to Game Server");
socket.onclose = () => showError("Disconnected from server. Please refresh.");

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

btnBreed.onclick = () => {
    const fId = selectFather.value;
    const mId = selectMother.value;
    if (!fId || !mId) return showError("Select parents");
    socket.send(JSON.stringify({ type: "breed_heroes", account: currentUser, fatherId: fId, motherId: mId }));
};

document.getElementById('start-btn').onclick = () => {
    if (!currentUser) return;
    battleContainer.classList.remove('hidden');
    socket.send(JSON.stringify({ type: "start_battle", account: currentUser }));
};

socket.onmessage = async (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "login_success") {
        currentUser = msg.user.username;
        currentHeroes = msg.user.heroes;
        showDashboard(msg.user);
    } else if (msg.type === "battle_replay") {
        await playReplay(msg);
    } else if (msg.type === "error") {
        showError(msg.message);
    }
};

function showDashboard(user) {
    authScreen.classList.add('hidden');
    dashScreen.classList.remove('hidden');
    displayUser.innerText = `Commander ${user.username}`;
    displayGold.innerText = `Gold: ${user.gold}`;

    heroList.innerHTML = "";
    selectFather.innerHTML = '<option value="">Select Father</option>';
    selectMother.innerHTML = '<option value="">Select Mother</option>';

    user.heroes.forEach(h => {
        const row = document.createElement('div');
        row.className = "item-row";
        const equip = JSON.parse(h.equipment || "{}");
        const weapon = equip.weapon ? "⚔️" : "✋";
        row.innerHTML = `<span>${h.gender === "MALE" ? "♂️" : "♀️"} ${h.name} [${weapon}]</span>`;
        heroList.appendChild(row);

        const opt = document.createElement('option');
        opt.value = h.id;
        opt.innerText = h.name;
        if (h.gender === "MALE") selectFather.appendChild(opt);
        else selectMother.appendChild(opt);
    });

    invList.innerHTML = "";
    user.inventory.forEach(item => {
        if (item.isEquipped) return;
        const row = document.createElement('div');
        row.className = "item-row";
        
        const equipBtn = document.createElement('button');
        equipBtn.innerText = "Equip";
        equipBtn.style.width = "auto";
        equipBtn.style.padding = "2px 10px";
        equipBtn.onclick = () => {
            const heroId = prompt("Enter Hero Index (0, 1, 2...) to equip this item:");
            if (heroId !== null && user.heroes[heroId]) {
                socket.send(JSON.stringify({
                    type: "equip_item",
                    account: currentUser,
                    heroId: user.heroes[heroId].id,
                    itemId: item.id,
                    slot: "weapon" // Default for now
                }));
            }
        };

        row.innerHTML = `<span>${item.templateId} x${item.quantity}</span>`;
        row.appendChild(equipBtn);
        invList.appendChild(row);
    });
}

// ... (playReplay and Draw functions remain same) ...
async function playReplay(replay) {
    const logs = replay.logs;
    const terrain = replay.terrain_grid;
    battleContainer.classList.remove('hidden');
    logDiv.innerHTML = "";
    for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        drawTerrain(terrain);
        drawUnits(log.unit_states);
        if (log.type !== "WAIT") {
            const p = document.createElement('div');
            p.innerText = `[${log.tick}] ${log.message}`;
            logDiv.prepend(p);
        }
        if (i < logs.length - 1 && logs[i+1].tick !== log.tick) await new Promise(r => setTimeout(r, 100));
    }
}

function drawTerrain(grid) {
    const colors = { 0: "#2d5a27", 3: "#ff4500", 5: "#1b3d11" };
    for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
            ctx.fillStyle = colors[grid[y][x]] || "#111";
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
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
        ctx.fillStyle = id.includes("e_") ? "red" : "cyan";
        ctx.fill();
        ctx.stroke();
    }
}

function showError(text) {
    errorDiv.innerText = text;
    setTimeout(() => errorDiv.innerText = "", 3000);
}
