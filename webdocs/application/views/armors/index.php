<style>
    .armor-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.5rem;
    }

    .armor-card {
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }

    .armor-card:hover {
        transform: translateY(-8px) scale(1.02);
    }

    .armor-card::before {
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

    .slot-badge {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 3px 12px;
        border-radius: 20px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        background: rgba(56, 189, 248, 0.1);
        border: 1px solid rgba(56, 189, 248, 0.2);
        color: #38bdf8;
    }

    .category-sidebar-premium {
        position: sticky;
        top: 2rem;
        background: rgba(15, 23, 42, 0.4);
        border-radius: 20px;
        padding: 1.5rem;
        border: 1px solid var(--border-soft);
    }

    .slot-filter {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0.6rem 1rem;
        color: var(--text-secondary);
        text-decoration: none;
        border-radius: 10px;
        transition: all 0.2s;
        cursor: pointer;
        border: none;
        background: transparent;
        width: 100%;
        font-size: 0.9rem;
    }

    .slot-filter:hover, .slot-filter.active {
        background: rgba(59, 130, 246, 0.1);
        color: white;
    }

    .slot-count {
        margin-left: auto;
        font-size: 0.7rem;
        background: rgba(255,255,255,0.05);
        padding: 2px 8px;
        border-radius: 10px;
        color: var(--text-secondary);
    }
</style>

<div class="hero-banner" style="background: radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.12) 0%, transparent 70%);">
    <div class="container-fluid">
        <h1 class="display-4 fw-black mb-2 opacity-90 text-uppercase" style="letter-spacing: -2px;">Armor Codex</h1>
        <p class="text-secondary fs-5 fw-light mx-auto" style="max-width: 800px;">
            Forged defenses and enchanted vestments — the protective gear that stands between heroes and oblivion.
        </p>
    </div>
</div>

<div class="container-fluid p-4 mt-2">
    <div class="row g-4">
        <!-- Sidebar -->
        <div class="col-lg-3">
            <div class="category-sidebar-premium mb-4">
                <div class="d-flex justify-content-between align-items-center mb-4 px-2">
                    <h5 class="mb-0 heading text-info small text-uppercase">Armor Slots</h5>
                    <a href="#" id="resetFilter" class="text-secondary small text-decoration-none opacity-50">Reset</a>
                </div>

                <button class="slot-filter active" data-slot="" onclick="filterBySlot(this, '')">
                    <span>📋</span>
                    <span class="fw-medium">All Armor</span>
                    <span class="slot-count"><?php echo count($armors); ?></span>
                </button>

                <?php foreach($slot_categories as $slotName => $slotData): ?>
                <button class="slot-filter" data-slot="<?php echo $slotName; ?>" onclick="filterBySlot(this, '<?php echo $slotName; ?>')">
                    <span><?php echo $slotData['icon']; ?></span>
                    <span class="fw-medium"><?php echo $slotName; ?></span>
                    <span class="slot-count"><?php echo $slotData['count']; ?></span>
                </button>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Main Display -->
        <div class="col-lg-9">
            <div class="search-box mb-4">
                <div class="row g-3">
                    <div class="col-md-8">
                        <div class="position-relative">
                            <input type="text" id="armorSearch" class="premium-input w-100 ps-5" placeholder="Search armor by name...">
                            <span class="position-absolute top-50 start-0 translate-middle-y ms-3 opacity-25">🔍</span>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <select id="rarityFilter" class="premium-input w-100">
                            <option value="">All Rarities</option>
                            <option value="COMMON">Common</option>
                            <option value="UNCOMMON">Uncommon</option>
                            <option value="RARE">Rare</option>
                            <option value="EPIC">Epic</option>
                            <option value="LEGENDARY">Legendary</option>
                        </select>
                    </div>
                </div>
            </div>

            <?php if (empty($armors)): ?>
            <div class="text-center py-5 opacity-50">
                <span class="display-1">🛡️</span>
                <h3 class="heading text-secondary mt-3">No Armor Found</h3>
                <p class="text-secondary">No armor items have been added to the database yet.</p>
            </div>
            <?php else: ?>
            <div class="armor-grid" id="armorContainer">
                <?php foreach($armors as $a): ?>
                <div class="armor-item"
                     data-name="<?php echo strtolower($a['name']); ?>"
                     data-rarity="<?php echo $a['rarity']; ?>"
                     data-slot="<?php echo $a['slotKey']; ?>">

                    <div class="glass-card armor-card h-100" onclick="showArmorDetails(<?php echo htmlspecialchars(json_encode($a)); ?>)">
                        <div class="card-content">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="text-secondary small opacity-50">#<?php echo $a['id']; ?></span>
                                <span class="rarity-pill <?php echo $a['rarity']; ?>"><?php echo $a['rarity']; ?></span>
                            </div>

                            <h4 class="heading mb-1 text-white"><?php echo $a['name']; ?></h4>
                            <div class="d-flex gap-2 align-items-center mb-2">
                                <span class="slot-badge"><?php echo $a['slotKey']; ?></span>
                            </div>

                            <p class="text-secondary small mt-3 mb-0 lh-sm">
                                <?php echo (strlen($a['description']) > 100) ? substr($a['description'], 0, 97) . '...' : $a['description']; ?>
                            </p>

                            <div class="stat-row">
                                <?php
                                $count = 0;
                                foreach($a['stats'] as $key => $val):
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
            <?php endif; ?>
        </div>
    </div>
</div>

<!-- Detail Modal -->
<div class="modal fade" id="armorModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content glass-card shadow-2xl" style="background: rgba(15, 23, 42, 0.95);">
            <div class="modal-header border-0 pb-0">
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-5">
                <div class="row">
                    <div class="col-md-5">
                        <div class="rounded-4 overflow-hidden mb-4 d-flex align-items-center justify-content-center"
                             style="background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%); min-height: 250px; border: 1px dashed var(--border-soft);">
                            <span class="display-1 opacity-25">🛡️</span>
                        </div>
                        <div id="modalRarityBadge" class="rarity-pill text-center mb-3">RARITY</div>
                        <div class="mini-stat text-center p-3">
                            <span class="text-secondary small text-uppercase d-block">Value</span>
                            <div class="fs-4 text-warning" id="modalValue">0 Gold</div>
                        </div>
                    </div>
                    <div class="col-md-7 ps-md-5">
                        <h1 class="display-6 heading mb-1" id="modalName">Name</h1>
                        <p class="mb-4"><span class="slot-badge" id="modalSlot">SLOT</span></p>

                        <h6 class="text-secondary text-uppercase small fw-bold mb-2">Description</h6>
                        <p class="text-secondary mb-5 fs-5 fw-light" id="modalDesc">Description...</p>

                        <h6 class="text-secondary text-uppercase small fw-bold mb-3">Attributes</h6>
                        <div id="modalStatsGrid" class="stat-row mb-4"></div>

                        <div id="modalTraitsSection" class="d-none">
                            <h6 class="text-warning text-uppercase small fw-bold mb-3">Traits</h6>
                            <div id="modalTraitsList" class="d-flex flex-wrap gap-2"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    let activeSlot = '';

    function showArmorDetails(a) {
        document.getElementById('modalName').innerText = a.name;
        document.getElementById('modalDesc').innerText = a.description;
        document.getElementById('modalSlot').innerText = a.slotKey;
        document.getElementById('modalValue').innerText = Number(a.baseValue).toLocaleString() + ' Gold';

        const rarityBadge = document.getElementById('modalRarityBadge');
        rarityBadge.innerText = a.rarity;
        rarityBadge.className = 'rarity-pill text-center mb-3 ' + a.rarity;

        const statsGrid = document.getElementById('modalStatsGrid');
        statsGrid.innerHTML = '';
        for (const [key, val] of Object.entries(a.stats)) {
            const div = document.createElement('div');
            div.className = 'mini-stat p-3';
            div.innerHTML = `
                <span class="text-secondary small text-uppercase">${key.replace(/_/g, ' ')}</span>
                <div class="fs-5 text-info fw-bold">${val}</div>
            `;
            statsGrid.appendChild(div);
        }

        const traitsSection = document.getElementById('modalTraitsSection');
        const traitsList = document.getElementById('modalTraitsList');
        traitsList.innerHTML = '';
        if (a.traits && a.traits.length > 0) {
            traitsSection.classList.remove('d-none');
            a.traits.forEach(t => {
                const badge = document.createElement('span');
                badge.className = 'badge rounded-pill bg-warning text-dark px-3 py-2';
                badge.title = t.description;
                badge.innerText = t.name;
                traitsList.appendChild(badge);
            });
        } else {
            traitsSection.classList.add('d-none');
        }

        const modal = new bootstrap.Modal(document.getElementById('armorModal'));
        modal.show();
    }

    function filterBySlot(btn, slot) {
        activeSlot = slot;
        document.querySelectorAll('.slot-filter').forEach(f => f.classList.remove('active'));
        btn.classList.add('active');
        filterItems();
    }

    document.addEventListener('DOMContentLoaded', function() {
        const searchInput = document.getElementById('armorSearch');
        const rarityFilter = document.getElementById('rarityFilter');

        searchInput.addEventListener('input', filterItems);
        rarityFilter.addEventListener('change', filterItems);

        document.getElementById('resetFilter').addEventListener('click', function(e) {
            e.preventDefault();
            searchInput.value = '';
            rarityFilter.value = '';
            activeSlot = '';
            document.querySelectorAll('.slot-filter').forEach(f => f.classList.remove('active'));
            document.querySelector('.slot-filter[data-slot=""]').classList.add('active');
            filterItems();
        });
    });

    function filterItems() {
        const searchTerm = document.getElementById('armorSearch').value.toLowerCase();
        const rarityTerm = document.getElementById('rarityFilter').value;
        const items = document.querySelectorAll('.armor-item');

        items.forEach(item => {
            const name = item.getAttribute('data-name');
            const rarity = item.getAttribute('data-rarity');
            const slot = item.getAttribute('data-slot');

            const matchesSearch = name.includes(searchTerm);
            const matchesRarity = !rarityTerm || rarity === rarityTerm;
            const matchesSlot = !activeSlot || slot === activeSlot;

            item.style.display = (matchesSearch && matchesRarity && matchesSlot) ? 'block' : 'none';
        });
    }
</script>
