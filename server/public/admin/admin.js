const API_URL = 'http://localhost:3000/api/admin';
let currentTab = 'monsters';
let currentData = [];
let monsterCategories = [];
let selectedCategoryId = null;

window.onload = () => loadTab('monsters');

async function loadTab(tab) {
    currentTab = tab;
    selectedCategoryId = null;
    
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    const items = document.querySelectorAll('.sidebar .menu-item');
    items.forEach(i => { if(i.innerText.toLowerCase().includes(tab)) i.classList.add('active'); });
    
    document.getElementById('category-pane').style.display = (tab === 'monsters') ? 'block' : 'none';

    if (tab === 'monsters') {
        const res = await fetch(`${API_URL}/monster-categories`);
        monsterCategories = await res.json();
        renderCategoryList();
    }
    fetchData();
}

async function fetchData() {
    const res = await fetch(`${API_URL}/${currentTab}`);
    currentData = await res.json();
    filterAndRender();
}

function renderCategoryList() {
    const list = document.getElementById('category-list');
    list.innerHTML = `<div class="cat-item ${!selectedCategoryId ? 'selected' : ''}" onclick="selectCategory(null)">ALL</div>`;
    
    monsterCategories.forEach(cat => {
        const div = document.createElement('div');
        div.className = `cat-item ${selectedCategoryId === cat.id ? 'selected' : ''}`;
        div.innerHTML = `<span>${cat.name}</span> <small style="display:block; font-size:9px; opacity:0.5">ID: ${cat.id}</small>`;
        div.onclick = () => selectCategory(cat.id);
        list.appendChild(div);
    });
}

function selectCategory(id) {
    selectedCategoryId = id;
    renderCategoryList();
    filterAndRender();
}

function filterAndRender() {
    const filtered = selectedCategoryId 
        ? currentData.filter(m => m.categoryId === selectedCategoryId)
        : currentData;
    renderTable(filtered);
}

function renderTable(data) {
    const tbody = document.getElementById('table-body');
    const thead = document.querySelector('#data-table thead tr');
    tbody.innerHTML = "";
    
    if (currentTab === 'monsters') {
        thead.innerHTML = '<th>ID</th><th>Name</th><th>Category ID</th><th>Action</th>';
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span style="color:#ff5555">${item.id}</span></td>
                <td>${item.name}</td>
                <td><span class="badge" style="background:#333; padding:2px 5px; border-radius:3px">${item.categoryId}</span></td>
                <td><button class="btn btn-primary" onclick="openEditModal('${item.id}')">EDIT</button></td>
            `;
            tbody.appendChild(row);
        });
    }
}

// ... (Modal & Save Logic same as before, ensuring it sends categoryId) ...
function openEditModal(id) {
    const item = currentData.find(d => d.id === id);
    const container = document.getElementById('form-fields');
    container.innerHTML = "";
    Object.keys(item).sort().forEach(key => {
        if(key === 'categoryId') {
            let options = monsterCategories.map(c => `<option value="${c.id}" ${item[key] === c.id ? 'selected' : ''}>${c.name}</option>`).join('');
            container.innerHTML += `<div class="form-group"><label>CATEGORY</label><select id="edit-categoryId">${options}</select></div>`;
        } else {
            container.innerHTML += `<div class="form-group"><label>${key.toUpperCase()}</label><input id="edit-${key}" value="${item[key]}" ${key === 'id' ? 'disabled' : ''}></div>`;
        }
    });
    document.getElementById('editor-modal').style.display = 'flex';
    document.querySelector('#editor-modal .btn-primary').onclick = () => saveData(id);
}

async function saveData(id) {
    const newData = {};
    document.querySelectorAll('#form-fields input, #form-fields select').forEach(input => {
        const key = input.id.replace('edit-', '');
        let val = input.value;
        if (!isNaN(val) && val !== "" && key !== 'id' && key !== 'filePath' && key !== 'categoryId') val = Number(val);
        newData[key] = val;
    });
    await fetch(`${API_URL}/${currentTab}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newData) });
    document.getElementById('editor-modal').style.display = 'none';
    fetchData();
}
function closeModal() { document.getElementById('editor-modal').style.display = 'none'; }
