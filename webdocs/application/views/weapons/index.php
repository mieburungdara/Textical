<style>
    .weapon-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.5rem;
    }

    .weapon-card {
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }

    .weapon-card:hover {
        transform: translateY(-8px) scale(1.02);
    }

    .weapon-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.8) 100%);
        z-index: 1;
    }

    .card-content {
        position: relative;
        z-index: 2;
        padding: 1.5rem;
    }

    .stat-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 1rem;
    }

    .mini-stat {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: 8px;
        padding: 6px 10px;
        font-size: 0.8rem;
    }

    .category-sidebar-premium {
        position: sticky;
        top: 2rem;
        background: rgba(15, 23, 42, 0.4);
        border-radius: 20px;
        padding: 1.5rem;
        border: 1px solid var(--border-soft);
    }

    .tree-toggle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 0.8rem 1rem;
        background: transparent;
        border: none;
        color: var(--text-primary);
        font-weight: 600;
        border-radius: 12px;
        transition: all 0.2s;
    }

    .tree-toggle:hover {
        background: rgba(255,255,255,0.05);
    }

    .tree-toggle[aria-expanded="true"] {
        background: rgba(59, 130, 246, 0.1);
        color: var(--accent);
    }

    .sub-type-link {
        display: block;
        padding: 0.5rem 1rem 0.5rem 2.5rem;
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 0.9rem;
        border-left: 2px solid transparent;
        transition: all 0.2s;
    }

    .sub-type-link:hover, .sub-type-link.active {
        color: white;
        background: rgba(255,255,255,0.03);
        border-left-color: var(--accent);
    }
</style>

<div class="hero-banner">
    <div class="container-fluid">
        <h1 class="display-4 fw-black mb-2 opacity-90 text-uppercase" style="letter-spacing: -2px;">Armament Codex</h1>
        <p class="text-secondary fs-5 fw-light mx-auto" style="max-width: 800px;">
            The definitive repository of legendary items, ancient relics, and masterwork weaponry crafted within the realm of Textical.
        </p>
        <div class="mt-4 d-flex justify-content-center gap-3">
            <button id="toggleEditMode" class="btn btn-outline-info rounded-pill px-4 btn-sm">
                <span id="editIcon">🔓</span> <span id="editText">Enable Edit Mode</span>
            </button>
        </div>
    </div>
</div>

<div class="container-fluid p-4 mt-2">
    <div class="row g-4">
        <!-- Sidebar Navigation -->
        <div class="col-lg-3">
            <div class="category-sidebar-premium mb-4">
                <div class="d-flex justify-content-between align-items-center mb-4 px-2">
                    <h5 class="mb-0 heading text-info small text-uppercase">Categories</h5>
                    <a href="#" id="resetFilter" class="text-secondary small text-decoration-none opacity-50">Reset</a>
                </div>

                <div class="accordion accordion-flush" id="weaponAccordion">
                    <?php foreach($categories as $catName => $catData): ?>
                    <div class="mb-2">
                        <button class="tree-toggle" type="button" data-bs-toggle="collapse" 
                                data-bs-target="#collapse<?php echo $catName; ?>" aria-expanded="false">
                            <span><?php echo $catData['icon']; ?> &nbsp; <?php echo $catName; ?></span>
                            <i class="bi bi-chevron-down opacity-50"></i>
                        </button>
                        <div id="collapse<?php echo $catName; ?>" class="collapse" data-bs-parent="#weaponAccordion">
                            <div class="pt-1">
                                <?php foreach($catData['types'] as $type): ?>
                                <a href="#" class="sub-type-link category-filter" data-type="<?php echo $type; ?>">
                                    <?php echo $type; ?>
                                </a>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>

        <!-- Main Display -->
        <div class="col-lg-9">
            <div class="search-box mb-5">
                <div class="row g-3">
                    <div class="col-md-8">
                        <div class="position-relative">
                            <input type="text" id="weaponSearch" class="premium-input w-100 ps-5" placeholder="Search by name, tags, or power...">
                            <span class="position-absolute top-50 start-0 translate-middle-y ms-3 opacity-25">🔍</span>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <select id="rarityFilter" class="premium-input w-100">
                            <option value="">All Qualities</option>
                            <option value="COMMON">Common</option>
                            <option value="UNCOMMON">Uncommon</option>
                            <option value="REFINED">Refined</option>
                            <option value="SUPERIOR">Superior</option>
                            <option value="RARE">Rare</option>
                            <option value="HEROIC">Heroic</option>
                            <option value="EPIC">Epic</option>
                            <option value="RELIC">Relic</option>
                            <option value="ANCIENT">Ancient</option>
                            <option value="MYTHIC">Mythic</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="weapon-grid" id="weaponContainer">
                <?php foreach($weapons as $w): ?>
                <div class="weapon-item" 
                     data-name="<?php echo strtolower($w['name']); ?>" 
                     data-rarity="<?php echo $w['rarity']; ?>"
                     data-type="<?php echo $w['weapon_type']; ?>">
                    
                    <div class="glass-card weapon-card h-100" onclick="showWeaponDetails(<?php echo htmlspecialchars(json_encode($w)); ?>)">
                        <div class="card-content">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="text-secondary small opacity-50">#<?php echo $w['id']; ?></span>
                                <div class="d-flex gap-2 align-items-center">
                                    <button class="edit-btn btn btn-sm btn-link text-info p-0 display-none" 
                                            onclick="event.stopPropagation(); openEditModal(<?php echo htmlspecialchars(json_encode($w)); ?>)">
                                        ✏️
                                    </button>
                                    <span class="rarity-pill <?php echo $w['rarity']; ?>"><?php echo $w['rarity']; ?></span>
                                </div>
                            </div>
                            
                            <h4 class="heading mb-1 text-white"><?php echo $w['name']; ?></h4>
                            <div class="d-flex gap-2">
                                <span class="small text-info opacity-75 fw-medium"><?php echo $w['weapon_type']; ?></span>
                                <span class="small text-secondary opacity-50">•</span>
                                <span class="small text-secondary fw-bold"><?php echo $w['isTwoHanded'] ? '2H' : '1H'; ?></span>
                            </div>

                            <p class="text-secondary small mt-3 mb-0 lh-sm">
                                <?php echo (strlen($w['description']) > 100) ? substr($w['description'], 0, 97) . '...' : $w['description']; ?>
                            </p>

                            <div class="stat-row">
                                <?php 
                                $count = 0;
                                foreach($w['stats'] as $key => $val): 
                                    if($count >= 4) break;
                                ?>
                                <div class="mini-stat">
                                    <span class="opacity-50 text-uppercase" style="font-size: 0.6rem;"><?php echo str_replace('_', ' ', $key); ?></span>
                                    <div class="fw-bold text-info"><?php echo $val; ?></div>
                                </div>
                                <?php $count++; endforeach; ?>
                            </div>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>

<!-- View Modal -->
<div class="modal fade" id="weaponModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content glass-card shadow-2xl" style="background: rgba(15, 23, 42, 0.95);">
            <div class="modal-header border-0 pb-0">
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-5">
                <div class="row">
                    <div class="col-md-5">
                        <div id="modalImageContainer" class="rounded-4 overflow-hidden mb-4 d-flex align-items-center justify-content-center" 
                             style="background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%); min-height: 250px; border: 1px dashed var(--border-soft);">
                            <!-- Injected Image or Icon -->
                        </div>
                        <div id="modalRarityBadge" class="rarity-pill text-center mb-3">RARITY</div>
                        <div class="mini-stat text-center p-3">
                            <span class="text-secondary small text-uppercase block">Value</span>
                            <div class="fs-4 text-warning" id="modalValue">0 Gold</div>
                        </div>
                    </div>
                    <div class="col-md-7 ps-md-5">
                        <h1 class="display-6 heading mb-1" id="modalName">Name</h1>
                        <p class="text-info opacity-75 fw-bold mb-4" id="modalTypeInfo">Weapon Type</p>
                        
                        <h6 class="text-secondary text-uppercase small fw-bold mb-2">Ancient Inscription</h6>
                        <p class="text-secondary mb-5 fs-5 fw-light italic" id="modalDesc">Description...</p>

                        <h6 class="text-secondary text-uppercase small fw-bold mb-3">Attributes & Mastery</h6>
                        <div id="modalStatsGrid" class="stat-row mb-4">
                            <!-- Injected -->
                        </div>

                        <div id="modalTraitsSection" class="mb-4 d-none">
                            <h6 class="text-warning text-uppercase small fw-bold mb-3">Essence Traits</h6>
                            <div id="modalTraitsList" class="d-flex flex-wrap gap-2">
                                <!-- Injected -->
                            </div>
                        </div>

                        <div id="modalPassivesSection" class="mb-4 d-none">
                            <h6 class="text-info text-uppercase small fw-bold mb-3">Intrinsic Passives</h6>
                            <div id="modalPassivesList" class="d-flex flex-column gap-3">
                                <!-- Injected -->
                            </div>
                        </div>

                        <div id="modalTagsSection" class="d-none">
                            <h6 class="text-secondary text-uppercase small fw-bold mb-3">Mechanic Tags</h6>
                            <div id="modalTagsList" class="d-flex flex-wrap gap-2">
                                <!-- Injected -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Edit Modal -->
<div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content glass-card" style="background: rgba(15, 23, 42, 0.98);">
            <form id="editForm">
                <div class="modal-header border-0 px-4 pt-4">
                    <h5 class="heading text-white mb-0">Edit Armament</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <input type="hidden" name="id" id="editId">
                    <div class="row g-3">
                        <div class="col-md-8">
                            <label class="text-secondary small fw-bold">NAME</label>
                            <input type="text" name="name" id="editName" class="premium-input w-100">
                        </div>
                        <div class="col-md-4">
                            <label class="text-secondary small fw-bold">RARITY</label>
                            <select name="rarity" id="editRarity" class="premium-input w-100">
                                <option value="COMMON">Common</option>
                                <option value="UNCOMMON">Uncommon</option>
                                <option value="REFINED">Refined</option>
                                <option value="SUPERIOR">Superior</option>
                                <option value="RARE">Rare</option>
                                <option value="HEROIC">Heroic</option>
                                <option value="EPIC">Epic</option>
                                <option value="RELIC">Relic</option>
                                <option value="ANCIENT">Ancient</option>
                                <option value="MYTHIC">Mythic</option>
                            </select>
                        </div>
                        <div class="col-12">
                            <label class="text-secondary small fw-bold">IMAGE URL</label>
                            <input type="text" name="imageUrl" id="editImageUrl" class="premium-input w-100" placeholder="https://example.com/weapon.png">
                        </div>
                        <div class="col-12">
                            <label class="text-secondary small fw-bold">DESCRIPTION</label>
                            <textarea name="description" id="editDesc" class="premium-input w-100" rows="2"></textarea>
                        </div>
                        <div class="col-md-4">
                            <label class="text-secondary small fw-bold">WEAPON TYPE</label>
                            <select name="weaponTypeId" id="editTypeId" class="premium-input w-100">
                                <?php foreach($all_types as $type): ?>
                                <option value="<?php echo $type['id']; ?>"><?php echo $type['name']; ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label class="text-secondary small fw-bold">HANDEDNESS</label>
                            <select name="isTwoHanded" id="editHanded" class="premium-input w-100">
                                <option value="0">One-Handed</option>
                                <option value="1">Two-Handed</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label class="text-secondary small fw-bold">BASE VALUE</label>
                            <input type="number" name="baseValue" id="editValue" class="premium-input w-100">
                        </div>
                    </div>

                    <div class="mt-4 pt-3 border-top border-secondary">
                        <h6 class="heading text-info small text-uppercase mb-3">Attributes</h6>
                        <div id="editStatsGrid" class="row g-3">
                            <!-- Stats inputs will be injected here -->
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-0 p-4">
                    <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary rounded-pill px-5">Save Changes</button>
                </div>
            </form>
        </div>
    </div>
</div>

<style>
    .display-none { display: none !important; }
</style>

<script>
    let isEditMode = false;

    function showWeaponDetails(w) {
        if (isEditMode) return;

        document.getElementById('modalName').innerText = w.name;
        document.getElementById('modalDesc').innerText = w.description;
        document.getElementById('modalTypeInfo').innerText = (w.isTwoHanded == 1 ? 'Two-Handed ' : 'One-Handed ') + w.weapon_type;
        document.getElementById('modalValue').innerText = w.baseValue + ' Gold';
        
        const rarityBadge = document.getElementById('modalRarityBadge');
        rarityBadge.innerText = w.rarity;
        rarityBadge.className = 'rarity-pill text-center mb-3 ' + w.rarity;

        const imgContainer = document.getElementById('modalImageContainer');
        if (w.imageUrl) {
            imgContainer.innerHTML = `<img src="${w.imageUrl}" class="img-fluid" style="max-height: 250px; object-fit: contain;">`;
        } else {
            imgContainer.innerHTML = `<span class="display-1 opacity-25">⚔️</span>`;
        }

        const statsGrid = document.getElementById('modalStatsGrid');
        statsGrid.innerHTML = '';
        for (const [key, val] of Object.entries(w.stats)) {
            const div = document.createElement('div');
            div.className = 'mini-stat p-3';
            div.innerHTML = `
                <span class="text-secondary small text-uppercase">${key.replace(/_/g, ' ')}</span>
                <div class="fs-5 text-info fw-bold">${val}</div>
            `;
            statsGrid.appendChild(div);
        }

        // Traits
        const traitsSection = document.getElementById('modalTraitsSection');
        const traitsList = document.getElementById('modalTraitsList');
        traitsList.innerHTML = '';
        if (w.traits && w.traits.length > 0) {
            traitsSection.classList.remove('d-none');
            w.traits.forEach(t => {
                const badge = document.createElement('span');
                badge.className = 'badge rounded-pill bg-warning text-dark px-3 py-2';
                badge.title = t.description;
                badge.innerText = t.name;
                traitsList.appendChild(badge);
            });
        } else {
            traitsSection.classList.add('d-none');
        }

        // Passives
        const passivesSection = document.getElementById('modalPassivesSection');
        const passivesList = document.getElementById('modalPassivesList');
        passivesList.innerHTML = '';
        if (w.type_details.passives && w.type_details.passives.length > 0) {
            passivesSection.classList.remove('d-none');
            w.type_details.passives.forEach(p => {
                const div = document.createElement('div');
                div.className = 'glass-card p-3 border-info-subtle';
                div.style.background = 'rgba(56, 189, 248, 0.05)';
                div.innerHTML = `
                    <div class="text-info fw-bold small text-uppercase">${p.name}</div>
                    <div class="text-secondary small">${p.description}</div>
                `;
                passivesList.appendChild(div);
            });
        } else {
            passivesSection.classList.add('d-none');
        }

        // Tags
        const tagsSection = document.getElementById('modalTagsSection');
        const tagsList = document.getElementById('modalTagsList');
        tagsList.innerHTML = '';
        if (w.type_details.tags && w.type_details.tags.length > 0) {
            tagsSection.classList.remove('d-none');
            w.type_details.tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'badge bg-secondary opacity-75';
                span.innerText = '#' + tag;
                tagsList.appendChild(span);
            });
        } else {
            tagsSection.classList.add('d-none');
        }

        const modal = new bootstrap.Modal(document.getElementById('weaponModal'));
        modal.show();
    }

    function openEditModal(w) {
        document.getElementById('editId').value = w.id;
        document.getElementById('editName').value = w.name;
        document.getElementById('editDesc').value = w.description;
        document.getElementById('editRarity').value = w.rarity;
        document.getElementById('editTypeId').value = w.weaponTypeId;
        document.getElementById('editHanded').value = w.isTwoHanded;
        document.getElementById('editValue').value = w.baseValue;
        document.getElementById('editImageUrl').value = w.imageUrl || '';

        const statsGrid = document.getElementById('editStatsGrid');
        statsGrid.innerHTML = '';
        for (const [key, val] of Object.entries(w.stats)) {
            const div = document.createElement('div');
            div.className = 'col-md-6';
            div.innerHTML = `
                <label class="text-secondary extra-small fw-bold text-uppercase">${key.replace(/_/g, ' ')}</label>
                <input type="number" step="any" name="stats[${key}]" value="${val}" class="premium-input w-100 py-1">
            `;
            statsGrid.appendChild(div);
        }

        const modal = new bootstrap.Modal(document.getElementById('editModal'));
        modal.show();
    }

    document.getElementById('editForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);

        fetch('<?php echo base_url("index.php/weapons/update"); ?>', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Failed to save changes.');
            }
        });
    });

    document.getElementById('toggleEditMode').addEventListener('click', function() {
        isEditMode = !isEditMode;
        this.classList.toggle('btn-outline-info');
        this.classList.toggle('btn-info');
        this.classList.toggle('text-white');
        
        document.getElementById('editText').innerText = isEditMode ? 'Exit Edit Mode' : 'Enable Edit Mode';
        document.getElementById('editIcon').innerText = isEditMode ? '🔒' : '🔓';
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.classList.toggle('display-none');
        });

        document.querySelectorAll('.weapon-card').forEach(card => {
            card.style.cursor = isEditMode ? 'default' : 'pointer';
        });
    });

    document.addEventListener('DOMContentLoaded', function() {
        const searchInput = document.getElementById('weaponSearch');
        const rarityFilter = document.getElementById('rarityFilter');
        const items = document.querySelectorAll('.weapon-item');
        const categoryFilters = document.querySelectorAll('.category-filter');
        const resetFilter = document.getElementById('resetFilter');

        let activeCategory = '';

        function filterItems() {
            const searchTerm = searchInput.value.toLowerCase();
            const rarityTerm = rarityFilter.value;

            items.forEach(item => {
                const name = item.getAttribute('data-name');
                const rarity = item.getAttribute('data-rarity');
                const type = item.getAttribute('data-type');

                const matchesSearch = name.includes(searchTerm);
                const matchesRarity = !rarityTerm || rarity === rarityTerm;
                const matchesCat = !activeCategory || type === activeCategory;

                item.style.display = (matchesSearch && matchesRarity && matchesCat) ? 'block' : 'none';
            });
        }

        searchInput.addEventListener('input', filterItems);
        rarityFilter.addEventListener('change', filterItems);

        categoryFilters.forEach(f => {
            f.addEventListener('click', (e) => {
                e.preventDefault();
                categoryFilters.forEach(l => l.classList.remove('active'));
                f.classList.add('active');
                activeCategory = f.getAttribute('data-type');
                filterItems();
            });
        });

        resetFilter.addEventListener('click', (e) => {
            e.preventDefault();
            searchInput.value = '';
            rarityFilter.value = '';
            activeCategory = '';
            categoryFilters.forEach(l => l.classList.remove('active'));
            filterItems();
        });
    });
</script>
