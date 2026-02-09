// Textical Admin Panel - Common JavaScript

// API Helper
const api = {
    baseUrl: '/api/admin',
    token: 'admin-default-token',

    init() {
        // No authentication required for admin panel
    },

    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'x-admin-token': this.token
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: { ...headers, ...options.headers }
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Request failed');
        }

        return data.data;
    },

    getDashboard() {
        return this.request('/dashboard');
    },

    getUsers(page = 1, search = '', sort = 'id-desc') {
        return this.request(`/users?page=${page}&limit=50&search=${encodeURIComponent(search)}&sort=${sort}`);
    },

    getUserById(id) {
        return this.request(`/users/${id}`);
    },

    updateUser(id, data) {
        return this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    deleteUser(id) {
        return this.request(`/users/${id}`, { method: 'DELETE' });
    },

    adjustUserSilver(id, amount) {
        return this.request(`/users/${id}/adjust-silver`, {
            method: 'POST',
            body: JSON.stringify({ amount })
        });
    },

    getHeroes(page = 1, search = '') {
        return this.request(`/heroes?page=${page}&limit=50&search=${encodeURIComponent(search)}`);
    },

    getHeroById(id) {
        return this.request(`/heroes/${id}`);
    },

    getMonsters(page = 1, search = '') {
        return this.request(`/monsters?page=${page}&limit=50&search=${encodeURIComponent(search)}`);
    },

    getRegions(page = 1, search = '') {
        return this.request(`/regions?page=${page}&limit=50&search=${encodeURIComponent(search)}`);
    },

    getItems(page = 1, search = '', category = '') {
        return this.request(`/items?page=${page}&limit=50&search=${encodeURIComponent(search)}&category=${category}`);
    },

    getQuests(page = 1, search = '') {
        return this.request(`/quests?page=${page}&limit=50&search=${encodeURIComponent(search)}`);
    },

    getSkills(page = 1, search = '') {
        return this.request(`/skills?page=${page}&limit=50&search=${encodeURIComponent(search)}`);
    },

    getTraits(page = 1, search = '', category = '') {
        return this.request(`/traits?page=${page}&limit=50&search=${encodeURIComponent(search)}&category=${category}`);
    },

    getFactions(page = 1, search = '') {
        return this.request(`/factions?page=${page}&limit=50&search=${encodeURIComponent(search)}`);
    }
};

// Utility Functions
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID').format(amount || 0);
}

function truncateText(text, maxLength = 50) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function showAlert(message, type = 'info') {
    const alertId = 'alert-' + Date.now();
    const alertHtml = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3" role="alert" style="z-index: 9999;">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', alertHtml);
    
    setTimeout(() => {
        const alert = document.getElementById(alertId);
        if (alert) {
            bootstrap.Alert.getInstance(alert)?.close();
        }
    }, 3000);
}

// Pagination
function updatePagination(section, pagination, containerId = null) {
    const infoId = containerId ? `${containerId}PaginationInfo` : `${section}PaginationInfo`;
    const navId = containerId ? `${containerId}Pagination` : `${section}Pagination`;
    
    const info = document.getElementById(infoId);
    const nav = document.getElementById(navId);
    
    if (!info || !nav) return;
    
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(pagination.page * pagination.limit, pagination.total);
    
    info.textContent = `Showing ${pagination.total > 0 ? start : 0} to ${end} of ${pagination.total}`;
    
    let html = '';
    if (pagination.page > 1) {
        html += `<li class="page-item"><a class="page-link" href="#" onclick="changePage('${section}', ${pagination.page - 1}); return false;">Prev</a></li>`;
    }
    
    for (let i = 1; i <= pagination.pages; i++) {
        html += `<li class="page-item ${i === pagination.page ? 'active' : ''}"><a class="page-link" href="#" onclick="changePage('${section}', ${i}); return false;">${i}</a></li>`;
    }
    
    if (pagination.page < pagination.pages) {
        html += `<li class="page-item"><a class="page-link" href="#" onclick="changePage('${section}', ${pagination.page + 1}); return false;">Next</a></li>`;
    }
    
    nav.innerHTML = html;
}

function changePage(section, page) {
    // This will be overridden by each page's script
    if (typeof loadSectionData === 'function') {
        loadSectionData(section, page);
    }
}

function refreshData(section) {
    if (typeof loadSectionData === 'function') {
        loadSectionData(section, 1);
    }
}

// Modal helpers
function showModal(modalId) {
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

function hideModal(modalId) {
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }
}

// Rarity class helper
function getRarityClass(rarity) {
    const classes = {
        COMMON: 'bg-secondary',
        UNCOMMON: 'bg-success',
        RARE: 'bg-primary',
        EPIC: 'bg-purple',
        LEGENDARY: 'bg-warning text-dark',
        MYTHIC: 'bg-danger'
    };
    return classes[rarity] || 'bg-secondary';
}

function getTraitCategoryClass(category) {
    const classes = {
        COMBAT: 'bg-danger',
        GENERAL: 'bg-secondary',
        GENETIC: 'bg-info'
    };
    return classes[category] || 'bg-secondary';
}

// Initialize API
api.init();

// Export for use in other scripts
window.api = api;
window.formatNumber = formatNumber;
window.formatCurrency = formatCurrency;
window.truncateText = truncateText;
window.showAlert = showAlert;
window.updatePagination = updatePagination;
window.changePage = changePage;
window.refreshData = refreshData;
window.showModal = showModal;
window.hideModal = hideModal;
window.getRarityClass = getRarityClass;
window.getTraitCategoryClass = getTraitCategoryClass;
