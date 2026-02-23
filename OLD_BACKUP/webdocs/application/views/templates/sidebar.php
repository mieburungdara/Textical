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
            <li class="<?php echo ($this->uri->segment(1) == 'armors') ? 'active' : ''; ?>">
                <a href="<?php echo base_url('index.php/armors'); ?>" class="category-node <?php echo ($this->uri->segment(1) == 'armors') ? 'active' : ''; ?>">
                    <span class="fs-5">🛡️</span>
                    <span class="fw-medium">Armor</span>
                </a>
            </li>
            <li class="<?php echo ($this->uri->segment(1) == 'materials') ? 'active' : ''; ?>">
                <a href="<?php echo base_url('index.php/materials'); ?>" class="category-node <?php echo ($this->uri->segment(1) == 'materials') ? 'active' : ''; ?>">
                    <span class="fs-5">🧱</span>
                    <span class="fw-medium">Materials</span>
                </a>
            </li>
            <li class="<?php echo ($this->uri->segment(1) == 'traits') ? 'active' : ''; ?>">
                <a href="<?php echo base_url('index.php/traits'); ?>" class="category-node <?php echo ($this->uri->segment(1) == 'traits') ? 'active' : ''; ?>">
                    <span class="fs-5">✨</span>
                    <span class="fw-medium">Traits</span>
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
        <p class="small mb-0">v1.3.0 - PostgreSQL</p>
    </div>
</nav>

<div id="content">
