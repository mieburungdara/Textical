<nav id="sidebar">
    <div class="sidebar-header mb-4">
        <h3 class="heading mb-0 text-white" style="letter-spacing: 2px;">TEXTICAL</h3>
        <small class="text-secondary text-uppercase fw-bold" style="font-size: 0.6rem; letter-spacing: 1px;">Documentation Hub</small>
    </div>

    <div class="px-2">
        <p class="text-secondary small fw-bold px-3 mb-2 opacity-50">DATABASE</p>
        <ul class="list-unstyled components">
            <li class="<?php echo ($this->uri->segment(1) == 'weapons') ? 'active' : ''; ?>">
                <a href="<?php echo base_url('index.php/weapons'); ?>" class="category-node <?php echo ($this->uri->segment(1) == 'weapons') ? 'active' : ''; ?>">
                    <span class="fs-5">⚔️</span>
                    <span class="fw-medium">Armaments</span>
                </a>
            </li>
            <li>
                <a href="#" class="category-node disabled opacity-50">
                    <span class="fs-5">🛡️</span>
                    <span class="fw-medium">Armor (Soon)</span>
                </a>
            </li>
            <li>
                <a href="#" class="category-node disabled opacity-50">
                    <span class="fs-5">🧪</span>
                    <span class="fw-medium">Bestiary (Soon)</span>
                </a>
            </li>
        </ul>

        <p class="text-secondary small fw-bold px-3 mt-4 mb-2 opacity-50">DEV TOOLS</p>
        <ul class="list-unstyled components">
            <li>
                <a href="<?php echo base_url('index.php/weapons/export_json'); ?>" class="category-node">
                    <span class="fs-5">🔄</span>
                    <span class="fw-medium">Sync Game Data</span>
                </a>
            </li>
        </ul>
    </div>

    <div class="sidebar-footer mt-auto pt-4 border-top border-secondary opacity-25 px-3">
        <p class="small mb-0">v1.2.5 - Stable</p>
    </div>
</nav>

<div id="content">
