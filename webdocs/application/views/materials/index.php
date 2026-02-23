<style>
    .material-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.25rem;
    }

    .material-card {
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }

    .material-card:hover {
        transform: translateY(-6px) scale(1.02);
    }

    .card-content {
        position: relative;
        z-index: 2;
        padding: 1.25rem;
    }

    .subcat-badge {
        font-size: 0.65rem;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: 20px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        color: var(--text-secondary);
    }

    .value-tag {
        font-size: 0.75rem;
        color: #fbbf24;
        font-weight: 600;
    }

    .category-sidebar-premium {
        position: sticky;
        top: 2rem;
        background: rgba(15, 23, 42, 0.4);
        border-radius: 20px;
        padding: 1.5rem;
        border: 1px solid var(--border-soft);
    }

    .subcat-filter {
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

    .subcat-filter:hover, .subcat-filter.active {
        background: rgba(59, 130, 246, 0.1);
        color: white;
    }

    .subcat-count {
        margin-left: auto;
        font-size: 0.7rem;
        background: rgba(255,255,255,0.05);
        padding: 2px 8px;
        border-radius: 10px;
        color: var(--text-secondary);
    }
</style>

<div class="hero-banner" style="background: radial-gradient(circle at 50% 50%, rgba(234, 179, 8, 0.12) 0%, transparent 70%);">
    <div class="container-fluid">
        <h1 class="display-4 fw-black mb-2 opacity-90 text-uppercase" style="letter-spacing: -2px;">Material Codex</h1>
        <p class="text-secondary fs-5 fw-light mx-auto" style="max-width: 800px;">
            A catalogue of raw materials, reagents, and crafting components harvested from across the realm of Textical.
        </p>
    </div>
</div>

<div class="container-fluid p-4 mt-2">
    <div class="row g-4">
        <!-- Sidebar -->
        <div class="col-lg-3">
            <div class="category-sidebar-premium mb-4">
                <div class="d-flex justify-content-between align-items-center mb-4 px-2">
                    <h5 class="mb-0 heading text-warning small text-uppercase">Categories</h5>
                    <a href="#" id="resetFilter" class="text-secondary small text-decoration-none opacity-50">Reset</a>
                </div>

                <button class="subcat-filter active" data-subcat="" onclick="filterBySubcat(this, '')">
                    <span>📋</span>
                    <span class="fw-medium">All Materials</span>
                    <span class="subcat-count"><?php echo count($materials); ?></span>
                </button>

                <?php foreach($subcategories as $subName => $subData): ?>
                <button class="subcat-filter" data-subcat="<?php echo $subName; ?>" onclick="filterBySubcat(this, '<?php echo $subName; ?>')">
                    <span><?php echo $subData['icon']; ?></span>
                    <span class="fw-medium"><?php echo $subName; ?></span>
                    <span class="subcat-count"><?php echo $subData['count']; ?></span>
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
                            <input type="text" id="materialSearch" class="premium-input w-100 ps-5" placeholder="Search materials by name...">
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

            <div class="material-grid" id="materialContainer">
                <?php foreach($materials as $m): ?>
                <div class="material-item"
                     data-name="<?php echo strtolower($m['name']); ?>"
                     data-rarity="<?php echo $m['rarity']; ?>"
                     data-subcat="<?php echo $m['subcategory']; ?>">

                    <div class="glass-card material-card h-100" onclick="showMaterialDetails(<?php echo htmlspecialchars(json_encode($m)); ?>)">
                        <div class="card-content">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="text-secondary small opacity-50">#<?php echo $m['id']; ?></span>
                                <span class="rarity-pill <?php echo $m['rarity']; ?>"><?php echo $m['rarity']; ?></span>
                            </div>

                            <h5 class="heading mb-1 text-white"><?php echo $m['name']; ?></h5>

                            <div class="d-flex gap-2 align-items-center mb-3">
                                <span class="subcat-badge"><?php echo $m['subcategory']; ?></span>
                            </div>

                            <p class="text-secondary small mb-3 lh-sm" style="min-height: 2.5em;">
                                <?php echo (strlen($m['description']) > 80) ? substr($m['description'], 0, 77) . '...' : $m['description']; ?>
                            </p>

                            <div class="d-flex justify-content-between align-items-center">
                                <span class="value-tag">💰 <?php echo number_format($m['baseValue']); ?> Gold</span>
                                <span class="text-secondary small opacity-50">Stack: <?php echo $m['maxStack']; ?></span>
                            </div>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</div>

<!-- Detail Modal -->
<div class="modal fade" id="materialModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content glass-card shadow-2xl" style="background: rgba(15, 23, 42, 0.95);">
            <div class="modal-header border-0 pb-0">
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-5">
                <div class="text-center mb-4">
                    <span class="display-1" id="modalIcon">🧱</span>
                </div>
                <div id="modalRarityBadge" class="rarity-pill text-center mb-3 mx-auto" style="width: fit-content;">RARITY</div>
                <h2 class="display-6 heading text-center mb-1" id="modalName">Name</h2>
                <p class="text-center mb-4">
                    <span class="subcat-badge" id="modalSubcat">TYPE</span>
                </p>
                <p class="text-secondary text-center fs-5 fw-light mb-4" id="modalDesc">Description...</p>
                <div class="row g-3">
                    <div class="col-6">
                        <div class="mini-stat text-center p-3" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px;">
                            <span class="text-secondary small text-uppercase d-block">Value</span>
                            <div class="fs-4 text-warning fw-bold" id="modalValue">0</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="mini-stat text-center p-3" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px;">
                            <span class="text-secondary small text-uppercase d-block">Max Stack</span>
                            <div class="fs-4 text-info fw-bold" id="modalStack">0</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    const subcatIcons = {
        'ORE': '⛏️', 'WOOD': '🪵', 'CLOTH': '🧵', 'LEATHER': '🦴',
        'HERB': '🌿', 'ESSENCE': '💎', 'FRAGMENT': '🔮', 'DUST': '✨',
        'BONE': '💀', 'FOOD': '🍖', 'OTHER': '📦'
    };

    let activeSubcat = '';

    function showMaterialDetails(m) {
        document.getElementById('modalName').innerText = m.name;
        document.getElementById('modalDesc').innerText = m.description;
        document.getElementById('modalValue').innerText = Number(m.baseValue).toLocaleString() + ' Gold';
        document.getElementById('modalStack').innerText = m.maxStack;
        document.getElementById('modalSubcat').innerText = m.subcategory;
        document.getElementById('modalIcon').innerText = subcatIcons[m.subcategory] || '📦';

        const rarityBadge = document.getElementById('modalRarityBadge');
        rarityBadge.innerText = m.rarity;
        rarityBadge.className = 'rarity-pill text-center mb-3 mx-auto ' + m.rarity;
        rarityBadge.style.width = 'fit-content';

        const modal = new bootstrap.Modal(document.getElementById('materialModal'));
        modal.show();
    }

    function filterBySubcat(btn, subcat) {
        activeSubcat = subcat;
        document.querySelectorAll('.subcat-filter').forEach(f => f.classList.remove('active'));
        btn.classList.add('active');
        filterItems();
    }

    document.addEventListener('DOMContentLoaded', function() {
        const searchInput = document.getElementById('materialSearch');
        const rarityFilter = document.getElementById('rarityFilter');

        searchInput.addEventListener('input', filterItems);
        rarityFilter.addEventListener('change', filterItems);

        document.getElementById('resetFilter').addEventListener('click', function(e) {
            e.preventDefault();
            searchInput.value = '';
            rarityFilter.value = '';
            activeSubcat = '';
            document.querySelectorAll('.subcat-filter').forEach(f => f.classList.remove('active'));
            document.querySelector('.subcat-filter[data-subcat=""]').classList.add('active');
            filterItems();
        });
    });

    function filterItems() {
        const searchTerm = document.getElementById('materialSearch').value.toLowerCase();
        const rarityTerm = document.getElementById('rarityFilter').value;
        const items = document.querySelectorAll('.material-item');

        items.forEach(item => {
            const name = item.getAttribute('data-name');
            const rarity = item.getAttribute('data-rarity');
            const subcat = item.getAttribute('data-subcat');

            const matchesSearch = name.includes(searchTerm);
            const matchesRarity = !rarityTerm || rarity === rarityTerm;
            const matchesSubcat = !activeSubcat || subcat === activeSubcat;

            item.style.display = (matchesSearch && matchesRarity && matchesSubcat) ? 'block' : 'none';
        });
    }
</script>
