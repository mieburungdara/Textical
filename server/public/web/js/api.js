/**
 * Textical Web Client - API Module
 * Handles all HTTP communication with the server
 */
const API = {
    // Session data
    sessionToken: null,
    userId: null,
    
    /**
     * Make an HTTP request
     * @param {string} url - URL to request
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} - Response data
     */
    async request(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        // Add session token if available (server uses x-session-token header)
        if (this.sessionToken) {
            defaultOptions.headers['x-session-token'] = this.sessionToken;
        }
        
        // Merge options
        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(url, finalOptions);
            
            // Parse JSON response
            const data = await response.json();
            
            // Check for errors
            if (!response.ok) {
                throw new Error(data.message || data.error || `HTTP ${response.status}`);
            }
            
            // Handle wrapped response format (server returns { success: true, data: {...} })
            if (data.success && data.data !== undefined) {
                return data.data;
            }
            
            return data;
        } catch (error) {
            console.error('[API] Request failed:', url, error);
            throw error;
        }
    },
    
    /**
     * Check if there's a stored session
     * @returns {boolean}
     */
    hasSession() {
        this.sessionToken = localStorage.getItem('sessionToken');
        this.userId = localStorage.getItem('userId');
        return !!(this.sessionToken && this.userId);
    },
    
    /**
     * Clear stored session
     */
    clearSession() {
        this.sessionToken = null;
        this.userId = null;
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('userId');
    },
    
    /**
     * Store session data
     * @param {string} token - Session token
     * @param {number} userId - User ID
     */
    storeSession(token, userId) {
        this.sessionToken = token;
        this.userId = userId;
        localStorage.setItem('sessionToken', token);
        localStorage.setItem('userId', userId);
    },
    
    // ==========================================
    // Authentication Endpoints
    // ==========================================
    
    /**
     * Login with username and password
     * @param {string} username 
     * @param {string} password 
     * @returns {Promise<Object>}
     */
    async login(username, password) {
        // Clear any existing session first
        this.clearSession();
        
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || result.error || `Login failed: ${response.status}`);
        }
        
        // Handle response format: { success: true, data: { user: {...}, session: { token: ... } } }
        const data = result.data || result;
        
        if (data.session && data.session.token) {
            const userId = data.user ? data.user.id : null;
            this.storeSession(data.session.token, userId);
        }
        
        return data;
    },
    
    /**
     * Logout current user
     * @returns {Promise<Object>}
     */
    async logout() {
        try {
            await this.request('/api/auth/logout', {
                method: 'POST'
            });
        } finally {
            this.clearSession();
        }
    },
    
    // ==========================================
    // User Endpoints
    // ==========================================
    
    /**
     * Get user profile
     * @returns {Promise<Object>}
     */
    async getUserProfile() {
        if (!this.userId) throw new Error('No user ID');
        return this.request(`/api/user/${this.userId}`);
    },
    
    // ==========================================
    // Hero Endpoints
    // ==========================================
    
    /**
     * Get all heroes
     * @returns {Promise<Object>}
     */
    async getHeroes() {
        if (!this.userId) {
            console.error('[API] getHeroes called without userId');
            throw new Error('No user ID');
        }
        console.log('[API] Fetching heroes for user:', this.userId);
        return this.request(`/api/user/${this.userId}/heroes`);
    },
    
    /**
     * Get hero by ID
     * @param {number} heroId 
     * @returns {Promise<Object>}
     */
    async getHero(heroId) {
        return this.request(`/api/hero/${heroId}/profile`);
    },
    
    // ==========================================
    // Inventory Endpoints
    // ==========================================
    
    /**
     * Get inventory
     * @returns {Promise<Object>}
     */
    async getInventory() {
        if (!this.userId) throw new Error('No user ID');
        return this.request(`/api/user/${this.userId}/inventory`);
    },
    
    /**
     * Use item
     * @param {number} itemId 
     * @returns {Promise<Object>}
     */
    async useItem(itemId) {
        return this.request('/api/inventory/use', {
            method: 'POST',
            body: JSON.stringify({ itemId })
        });
    },
    
    /**
     * Discard item
     * @param {number} itemId 
     * @returns {Promise<Object>}
     */
    async discardItem(itemId) {
        return this.request('/api/inventory/discard', {
            method: 'POST',
            body: JSON.stringify({ itemId })
        });
    },
    
    // ==========================================
    // Travel Endpoints
    // ==========================================
    
    /**
     * Start travel to region
     * @param {number} regionId 
     * @returns {Promise<Object>}
     */
    async travel(regionId) {
        return this.request('/api/action/travel', {
            method: 'POST',
            body: JSON.stringify({ targetRegionId: regionId, userId: this.userId })
        });
    },
    
    // ==========================================
    // Gathering Endpoints
    // ==========================================
    
    /**
     * Start gathering
     * @param {number} resourceId 
     * @returns {Promise<Object>}
     */
    async gather(resourceId) {
        return this.request('/api/action/gather', {
            method: 'POST',
            body: JSON.stringify({ resourceId, userId: this.userId })
        });
    },
    
    // ==========================================
    // Crafting Endpoints
    // ==========================================
    
    /**
     * Get crafting recipes
     * @returns {Promise<Object>}
     */
    async getRecipes() {
        if (!this.userId) throw new Error('No user ID');
        return this.request(`/api/user/${this.userId}/recipes`);
    },
    
    /**
     * Craft item
     * @param {number} recipeId 
     * @returns {Promise<Object>}
     */
    async craft(recipeId) {
        return this.request('/api/action/craft', {
            method: 'POST',
            body: JSON.stringify({ recipeId, userId: this.userId })
        });
    },
    
    // ==========================================
    // Equipment Endpoints
    // ==========================================
    
    /**
     * Equip item on hero
     * @param {number} heroId 
     * @param {number} itemId 
     * @param {string} slot 
     * @returns {Promise<Object>}
     */
    async equipItem(heroId, itemId, slot) {
        return this.request('/api/action/equip', {
            method: 'POST',
            body: JSON.stringify({ heroId, itemId, slot })
        });
    },
    
    /**
     * Unequip item from hero
     * @param {number} heroId 
     * @param {string} slot 
     * @returns {Promise<Object>}
     */
    async unequipItem(heroId, slot) {
        return this.request('/api/action/unequip', {
            method: 'POST',
            body: JSON.stringify({ heroId, slot })
        });
    },
    
    // ==========================================
    // Tavern Endpoints
    // ==========================================
    
    /**
     * Enter tavern
     * @returns {Promise<Object>}
     */
    async enterTavern() {
        return this.request('/api/tavern/enter', {
            method: 'POST',
            body: JSON.stringify({ userId: this.userId })
        });
    },
    
    /**
     * Exit tavern
     * @returns {Promise<Object>}
     */
    async exitTavern() {
        return this.request('/api/tavern/exit', {
            method: 'POST',
            body: JSON.stringify({ userId: this.userId })
        });
    },
    
    /**
     * Get available mercenaries
     * @returns {Promise<Object>}
     */
    async getMercenaries() {
        return this.request(`/api/tavern/mercenaries?userId=${this.userId}`);
    },
    
    /**
     * Recruit mercenary
     * @param {number} mercenaryId 
     * @returns {Promise<Object>}
     */
    async recruitMercenary(mercenaryId) {
        return this.request('/api/tavern/recruit', {
            method: 'POST',
            body: JSON.stringify({ mercenaryId, userId: this.userId })
        });
    },
    
    // ==========================================
    // Market Endpoints
    // ==========================================
    
    /**
     * Get market listings
     * @returns {Promise<Object>}
     */
    async getMarketListings() {
        return this.request('/api/market/listings');
    },
    
    /**
     * Buy item from market
     * @param {number} listingId 
     * @returns {Promise<Object>}
     */
    async buyMarketItem(listingId) {
        return this.request('/api/market/buy', {
            method: 'POST',
            body: JSON.stringify({ listingId, userId: this.userId })
        });
    },
    
    /**
     * List item on market
     * @param {number} itemId 
     * @param {number} price 
     * @returns {Promise<Object>}
     */
    async listMarketItem(itemId, price) {
        return this.request('/api/market/list', {
            method: 'POST',
            body: JSON.stringify({ itemId, price, userId: this.userId })
        });
    },
    
    /**
     * Sell item to NPC
     * @param {number} itemId 
     * @returns {Promise<Object>}
     */
    async sellToNPC(itemId) {
        return this.request('/api/market/sell-npc', {
            method: 'POST',
            body: JSON.stringify({ itemId, userId: this.userId })
        });
    },
    
    // ==========================================
    // Quest Endpoints
    // ==========================================
    
    /**
     * Get quests
     * @returns {Promise<Object>}
     */
    async getQuests() {
        // Quests might be part of user data or separate endpoint
        try {
            const profile = await this.getUserProfile();
            return { quests: profile.quests || profile.activeQuests || [] };
        } catch (error) {
            return { quests: [] };
        }
    },
    
    // ==========================================
    // World Endpoints
    // ==========================================
    
    /**
     * Get all regions
     * @returns {Promise<Object>}
     */
    async getRegions() {
        return this.request('/api/regions');
    },
    
    /**
     * Get region details
     * @param {number} regionId 
     * @returns {Promise<Object>}
     */
    async getRegionDetails(regionId) {
        return this.request(`/api/region/${regionId}`);
    },
    
    /**
     * Get world state
     * @returns {Promise<Object>}
     */
    async getWorldState() {
        return this.request('/api/world/state');
    },
    
    // ==========================================
    // Formation Endpoints
    // ==========================================
    
    /**
     * Get formation
     * @returns {Promise<Object>}
     */
    async getFormation() {
        if (!this.userId) throw new Error('No user ID');
        return this.request(`/api/user/${this.userId}/formation`);
    },
    
    /**
     * Update formation
     * @param {Array} formation 
     * @returns {Promise<Object>}
     */
    async updateFormation(formation) {
        return this.request('/api/action/formation/update', {
            method: 'POST',
            body: JSON.stringify({ userId: this.userId, formation })
        });
    },
    
    // ==========================================
    // Task Endpoints
    // ==========================================
    
    /**
     * Get active task
     * @returns {Promise<Object>}
     */
    async getActiveTask() {
        if (!this.userId) throw new Error('No user ID');
        return this.request(`/api/user/${this.userId}/task`);
    },
    
    // ==========================================
    // Social Endpoints
    // ==========================================
    
    /**
     * Get friends
     * @returns {Promise<Object>}
     */
    async getFriends() {
        if (!this.userId) throw new Error('No user ID');
        return this.request(`/api/user/${this.userId}/friends`);
    },
    
    // ==========================================
    // Achievement Endpoints
    // ==========================================
    
    /**
     * Get achievements
     * @returns {Promise<Object>}
     */
    async getAchievements() {
        if (!this.userId) throw new Error('No user ID');
        return this.request(`/api/user/${this.userId}/achievements`);
    }
};
