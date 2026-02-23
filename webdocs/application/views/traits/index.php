<style>
    .trait-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: 1.5rem;
    }

    .trait-card {
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        cursor: pointer;
        position: relative;
        overflow: hidden;
        border-left: 4px solid transparent;
    }

    .trait-card:hover {
        transform: translateY(-6px) scale(1.01);
    }

    .trait-card.cat-OFFENSIVE { border-left-color: #ef4444; }
    .trait-card.cat-DEFENSIVE { border-left-color: #3b82f6; }
    .trait-card.cat-MAGIC { border-left-color: #a855f7; }
    .trait-card.cat-TACTICAL { border-left-color: #f59e0b; }
    .trait-card.cat-UTILITY { border-left-color: #10b981; }
    .trait-card.cat-GENERAL { border-left-color: #6b7280; }

    .card-content {
        position: relative;
        z-index: 2;
        padding: 1.5rem;
    }

    .category-pill {
        font-size: 0.65rem;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: 20px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }

    .category-pill.OFFENSIVE { color: #ef4444; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); }
    .category-pill.DEFENSIVE { color: #3b82f6; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); }
    .category-pill.MAGIC { color: #a855f7; background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.2); }
    .category-pill.TACTICAL { color: #f59e0b; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); }
    .category-pill.UTILITY { color: #10b981; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); }
    .category-pill.GENERAL { color: #6b7280; background: rgba(107, 114, 128, 0.1); border: 1px solid rgba(107, 114, 128, 0.2); }

    .category-sidebar-premium {
        position: sticky;
        top: 2rem;
        background: rgba(15, 23, 42, 0.4);
        border-radius: 20px;
        padding: 1.5rem;
        border: 1px solid var(--border-soft);
    }

    .cat-filter {
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

    .cat-filter:hover, .cat-filter.active {
        background: rgba(59, 130, 246, 0.1);
        color: white;
    }

    .cat-count {
        margin-left: auto;
        font-size: 0.7rem;
        background: rgba(255,255,255,0.05);
        padding: 2px 8px;
        border-radius: 10px;
        color: var(--text-secondary);
    }
</style>

<div class="hero-banner" style="background: radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.12) 0%, transparent 70%);">
    <div class="container-fluid">
        <h1 class="display-4 fw-black mb-2 opacity-90 text-uppercase" style="letter-spacing: -2px;">Trait Compendium</h1>
        <p class="text-secondary fs-5 fw-light mx-auto" style="max-width: 800px;">
            Innate abilities and essence traits that define the power of heroes, monsters, and legendary armaments.
        </p>
    </div>
</div>

<div class="container-fluid p-4 mt-2">
    <div class="row g-4">
        <!-- Sidebar -->
        <div class="col-lg-3">
            <div class="category-sidebar-premium mb-4">
                <div class="d-flex justify-content-between align-items-center mb-4 px-2">
                    <h5 class="mb-0 heading small text-uppercase" style="color: #a855f7;">Categories</h5>
                    <a href="#" id="resetFilter" class="text-secondary small text-decoration-none opacity-50">Reset</a>
                </div>

                <button class="cat-filter active" data-cat="" onclick="filterByCat(this, '')">
                    <span>📋</span>
                    <span class="fw-medium">All Traits</span>
                    <span class="cat-count"><?php echo count($traits); ?></span>
                </button>

                <?php foreach($categories as $catName => $catData): ?>
                <button class="cat-filter" data-cat="<?php echo $catName; ?>" onclick="filterByCat(this, '<?php echo $catName; ?>')">
                    <span><?php echo $catData['icon']; ?></span>
                    <span class="fw-medium"><?php echo ucfirst(strtolower($catName)); ?></span>
                    <span class="cat-count"><?php echo $catData['count']; ?></span>
                </button>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Main Display -->
        <div class="col-lg-9">
            <div class="search-box mb-4">
                <div class="position-relative">
                    <input type="text" id="traitSearch" class="premium-input w-100 ps-5" placeholder="Search traits by name or description...">
                    <span class="position-absolute top-50 start-0 translate-middle-y ms-3 opacity-25">🔍</span>
                </div>
            </div>

            <?php if (empty($traits)): ?>
            <div class="text-center py-5 opacity-50">
                <span class="display-1">✨</span>
                <h3 class="heading text-secondary mt-3">No Traits Found</h3>
                <p class="text-secondary">No trait templates have been seeded yet.</p>
            </div>
            <?php else: ?>
            <div class="trait-grid" id="traitContainer">
                <?php foreach($traits as $t): ?>
                <div class="trait-item"
                     data-name="<?php echo strtolower($t['name']); ?>"
                     data-desc="<?php echo strtolower($t['description']); ?>"
                     data-cat="<?php echo $t['category']; ?>">

                    <div class="glass-card trait-card h-100 cat-<?php echo $t['category']; ?>" onclick="showTraitDetails(<?php echo htmlspecialchars(json_encode($t)); ?>)">
                        <div class="card-content">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <span class="text-secondary small opacity-50">#<?php echo $t['id']; ?></span>
                                <span class="category-pill <?php echo $t['category']; ?>"><?php echo $t['category']; ?></span>
                            </div>

                            <h4 class="heading mb-2 text-white"><?php echo $t['name']; ?></h4>

                            <p class="text-secondary small mb-0 lh-base">
                                <?php echo $t['description']; ?>
                            </p>
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
<div class="modal fade" id="traitModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content glass-card shadow-2xl" style="background: rgba(15, 23, 42, 0.95);">
            <div class="modal-header border-0 pb-0">
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-5 text-center">
                <span class="display-1" id="modalIcon">✨</span>
                <div class="mt-3 mb-3">
                    <span class="category-pill" id="modalCategory">CATEGORY</span>
                </div>
                <h2 class="display-6 heading mb-3" id="modalName">Trait Name</h2>
                <p class="text-secondary fs-5 fw-light mb-4" id="modalDesc">Description...</p>

                <div id="modalUsersSection" class="d-none text-start mt-4 pt-4 border-top border-secondary border-opacity-25">
                    <h6 class="text-info text-uppercase small fw-bold mb-3">Used By</h6>
                    <div id="modalUsersList" class="d-flex flex-wrap gap-2"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    const catIcons = {
        'OFFENSIVE': '⚔️', 'DEFENSIVE': '🛡️', 'MAGIC': '🔮',
        'TACTICAL': '🎯', 'UTILITY': '🔧', 'GENERAL': '📦'
    };

    let activeCat = '';

    function showTraitDetails(t) {
        document.getElementById('modalName').innerText = t.name;
        document.getElementById('modalDesc').innerText = t.description;
        document.getElementById('modalIcon').innerText = catIcons[t.category] || '✨';

        const catBadge = document.getElementById('modalCategory');
        catBadge.innerText = t.category;
        catBadge.className = 'category-pill ' + t.category;

        // Hide users section for now (would need AJAX for full implementation)
        document.getElementById('modalUsersSection').classList.add('d-none');

        const modal = new bootstrap.Modal(document.getElementById('traitModal'));
        modal.show();
    }

    function filterByCat(btn, cat) {
        activeCat = cat;
        document.querySelectorAll('.cat-filter').forEach(f => f.classList.remove('active'));
        btn.classList.add('active');
        filterItems();
    }

    document.addEventListener('DOMContentLoaded', function() {
        const searchInput = document.getElementById('traitSearch');

        searchInput.addEventListener('input', filterItems);

        document.getElementById('resetFilter').addEventListener('click', function(e) {
            e.preventDefault();
            searchInput.value = '';
            activeCat = '';
            document.querySelectorAll('.cat-filter').forEach(f => f.classList.remove('active'));
            document.querySelector('.cat-filter[data-cat=""]').classList.add('active');
            filterItems();
        });
    });

    function filterItems() {
        const searchTerm = document.getElementById('traitSearch').value.toLowerCase();
        const items = document.querySelectorAll('.trait-item');

        items.forEach(item => {
            const name = item.getAttribute('data-name');
            const desc = item.getAttribute('data-desc');
            const cat = item.getAttribute('data-cat');

            const matchesSearch = name.includes(searchTerm) || desc.includes(searchTerm);
            const matchesCat = !activeCat || cat === activeCat;

            item.style.display = (matchesSearch && matchesCat) ? 'block' : 'none';
        });
    }
</script>
