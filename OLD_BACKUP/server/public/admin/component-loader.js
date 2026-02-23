// Component Loader for Admin Panel
// Loads modular components: sidebar, header, footer

const ComponentLoader = {
    basePath: 'components',
    
    async loadComponent(id, filename) {
        const container = document.getElementById(id);
        if (!container) {
            console.error(`[ComponentLoader] Container #${id} not found`);
            return null;
        }
        
        const url = `${this.basePath}/${filename}`;
        console.log(`[ComponentLoader] Loading ${filename} from ${url}`);
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}: ${response.status} ${response.statusText}`);
            }
            const html = await response.text();
            container.innerHTML = html;
            console.log(`[ComponentLoader] Successfully loaded ${filename}`);
            
            // Check if nav links exist
            const navLinks = container.querySelectorAll('.nav-link[data-page]');
            console.log(`[ComponentLoader] Found ${navLinks.length} nav links in ${filename}`);
            
            return container;
        } catch (error) {
            console.error(`[ComponentLoader] Error loading ${filename}:`, error);
            container.innerHTML = `<div class="alert alert-danger">Failed to load ${filename}: ${error.message}</div>`;
            return null;
        }
    },
    
    async loadAll() {
        console.log('[ComponentLoader] Starting to load all components...');
        
        // Load sidebar, header, footer in sequence
        await this.loadComponent('sidebarContainer', '_sidebar.html');
        await this.loadComponent('headerContainer', '_header.html');
        await this.loadComponent('footerContainer', '_footer.html');
        
        console.log('[ComponentLoader] All admin components loaded successfully');
        
        // Dispatch custom event to notify that components are ready
        window.dispatchEvent(new CustomEvent('componentsLoaded'));
    }
};

// Export for global use
window.ComponentLoader = ComponentLoader;
window.loadComponent = (id, filename) => ComponentLoader.loadComponent(id, filename);

