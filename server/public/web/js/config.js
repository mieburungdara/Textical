/**
 * Textical Web Client - Configuration Module
 * Contains all game constants and configuration
 */
const CONFIG = {
    // API Configuration
    API_BASE: window.location.origin + '/api',
    SOCKET_URL: window.location.origin,
    
    // Game Constants
    TICK_RATE: 60,
    MAX_VITALITY: 100,
    VITALITY_RECOVERY_RATE: 5, // per minute in tavern
    
    // Element Colors (for UI display)
    ELEMENT_COLORS: {
        FIRE: '#ef4444',
        WATER: '#3b82f6',
        EARTH: '#a16207',
        WIND: '#22d3ee',
        LIGHT: '#fef08a',
        DARK: '#6b21a8',
        NATURE: '#22c55e',
        LIGHTNING: '#fbbf24',
        NEUTRAL: '#9ca3af'
    },
    
    // Zone Colors (for map display)
    ZONE_COLORS: {
        GREEN: '#22c55e',
        YELLOW: '#eab308',
        ORANGE: '#f97316',
        RED: '#ef4444',
        BLACK: '#6b21a8',
        WATER: '#0ea5e9',
        ROYAL: '#a855f7',
        BOSS: '#dc2626',
        VILLAGE: '#3b82f6',
        SAFE: '#22c55e'
    },
    
    // Item Type Icons
    ITEM_TYPES: {
        WEAPON: '⚔️',
        ARMOR: '🛡️',
        HELMET: '🪖',
        ACCESSORY: '💍',
        POTION: '🧪',
        FOOD: '🍖',
        MATERIAL: '🪨',
        QUEST: '📜',
        MISC: '📦',
        KEY: '🔑',
        SCROLL: '📖',
        GEM: '💎'
    },
    
    // Stat Names
    STATS: {
        HP: 'Health Points',
        MP: 'Mana Points',
        ATK: 'Attack',
        DEF: 'Defense',
        SPD: 'Speed',
        CRIT: 'Critical Rate',
        EVA: 'Evasion'
    },
    
    // Rarity Colors
    RARITY_COLORS: {
        COMMON: '#9ca3af',
        UNCOMMON: '#22c55e',
        RARE: '#3b82f6',
        EPIC: '#a855f7',
        LEGENDARY: '#f59e0b',
        MYTHIC: '#ef4444'
    },
    
    // Class Icons
    CLASS_ICONS: {
        WARRIOR: '⚔️',
        MAGE: '🔮',
        RANGER: '🏹',
        ROGUE: '🗡️',
        PRIEST: '✝️',
        PALADIN: '🛡️',
        NECROMANCER: '💀',
        BARD: '🎵'
    },
    
    // Time Constants
    MS_PER_SECOND: 1000,
    MS_PER_MINUTE: 60000,
    MS_PER_HOUR: 3600000,
    
    // UI Constants
    INVENTORY_SLOTS: 40,
    MAX_HEROES: 8,
    MAX_QUESTS: 10,
    
    // Animation Durations (ms)
    ANIMATION: {
        FAST: 150,
        NORMAL: 250,
        SLOW: 500
    },
    
    // Socket Events
    SOCKET_EVENTS: {
        // Client -> Server
        AUTHENTICATE: 'authenticate',
        CHAT_MESSAGE: 'chat:message',
        REQUEST_SYNC: 'request:sync',
        
        // Server -> Client
        CONNECT: 'connect',
        DISCONNECT: 'disconnect',
        ERROR: 'error',
        SESSION_INVALID: 'session:invalid',
        TASK_UPDATE: 'task:update',
        BATTLE_UPDATE: 'battle:update',
        PLAYER_UPDATE: 'player:update',
        CHAT_MESSAGE_RECEIVED: 'chat:received',
        NOTIFICATION: 'notification',
        WORLD_UPDATE: 'world:update'
    },
    
    // API Endpoints
    ENDPOINTS: {
        // Auth
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REGISTER: '/auth/register',
        ME: '/auth/me',
        
        // User
        USER_PROFILE: '/user/profile',
        USER_STATS: '/user/stats',
        
        // Heroes
        HEROES: '/heroes',
        HERO_DETAIL: '/heroes/:id',
        HERO_EQUIP: '/heroes/:id/equip',
        HERO_UNEQUIP: '/heroes/:id/unequip',
        HERO_SKILLS: '/heroes/:id/skills',
        
        // Inventory
        INVENTORY: '/inventory',
        ITEM_USE: '/inventory/:id/use',
        ITEM_SELL: '/inventory/:id/sell',
        
        // Travel
        TRAVEL: '/travel',
        TRAVEL_STATUS: '/travel/status',
        
        // Battle
        BATTLE_START: '/battle/start',
        BATTLE_STATUS: '/battle/status',
        
        // Market
        MARKET_LISTINGS: '/market/listings',
        MARKET_BUY: '/market/buy',
        MARKET_SELL: '/market/sell',
        MARKET_MY_LISTINGS: '/market/my-listings',
        
        // Tavern
        TAVERN_ENTER: '/tavern/enter',
        TAVERN_EXIT: '/tavern/exit',
        TAVERN_MERCENARIES: '/tavern/mercenaries',
        TAVERN_RECRUIT: '/tavern/recruit',
        
        // Quests
        QUESTS: '/quests',
        QUEST_ACCEPT: '/quests/:id/accept',
        QUEST_COMPLETE: '/quests/:id/complete',
        QUEST_ABANDON: '/quests/:id/abandon',
        
        // World
        REGIONS: '/world/regions',
        REGION_DETAIL: '/world/regions/:id',
        WORLD_STATE: '/world/state',
        
        // Crafting
        RECIPES: '/crafting/recipes',
        CRAFT: '/crafting/craft',
        
        // Gathering
        GATHER_START: '/gathering/start',
        GATHER_STATUS: '/gathering/status',
        
        // Guild
        GUILD_INFO: '/guild/info',
        GUILD_MEMBERS: '/guild/members',
        GUILD_JOIN: '/guild/join',
        GUILD_LEAVE: '/guild/leave'
    },
    
    /**
     * Get endpoint URL with parameter substitution
     * @param {string} endpoint - Endpoint key from ENDPOINTS
     * @param {Object} params - Parameters to substitute
     * @returns {string} - Full URL
     */
    getEndpoint(endpoint, params = {}) {
        let url = this.ENDPOINTS[endpoint] || endpoint;
        
        // Substitute parameters
        Object.keys(params).forEach(key => {
            url = url.replace(`:${key}`, params[key]);
        });
        
        return this.API_BASE + url;
    },
    
    /**
     * Get element color
     * @param {string} element - Element name
     * @returns {string} - CSS color
     */
    getElementColor(element) {
        return this.ELEMENT_COLORS[element?.toUpperCase()] || this.ELEMENT_COLORS.NEUTRAL;
    },
    
    /**
     * Get zone color
     * @param {string} zone - Zone type
     * @returns {string} - CSS color
     */
    getZoneColor(zone) {
        return this.ZONE_COLORS[zone?.toUpperCase()] || this.ZONE_COLORS.GREEN;
    },
    
    /**
     * Get item type icon
     * @param {string} type - Item type
     * @returns {string} - Emoji icon
     */
    getItemIcon(type) {
        return this.ITEM_TYPES[type?.toUpperCase()] || this.ITEM_TYPES.MISC;
    },
    
    /**
     * Get rarity color
     * @param {string} rarity - Rarity level
     * @returns {string} - CSS color
     */
    getRarityColor(rarity) {
        return this.RARITY_COLORS[rarity?.toUpperCase()] || this.RARITY_COLORS.COMMON;
    },
    
    /**
     * Format number with commas
     * @param {number} num - Number to format
     * @returns {string} - Formatted string
     */
    formatNumber(num) {
        return num?.toLocaleString() || '0';
    },
    
    /**
     * Format time duration
     * @param {number} seconds - Duration in seconds
     * @returns {string} - Formatted string
     */
    formatDuration(seconds) {
        if (seconds < 60) {
            return `${Math.floor(seconds)}s`;
        } else if (seconds < 3600) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}m ${secs}s`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${mins}m`;
        }
    },
    
    /**
     * Format timestamp to local time
     * @param {string|Date} timestamp - ISO timestamp or Date
     * @returns {string} - Formatted local time
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
    },
    
    /**
     * Format timestamp to local date time
     * @param {string|Date} timestamp - ISO timestamp or Date
     * @returns {string} - Formatted local date time
     */
    formatDateTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.ELEMENT_COLORS);
Object.freeze(CONFIG.ZONE_COLORS);
Object.freeze(CONFIG.ITEM_TYPES);
Object.freeze(CONFIG.STATS);
Object.freeze(CONFIG.RARITY_COLORS);
Object.freeze(CONFIG.CLASS_ICONS);
Object.freeze(CONFIG.ANIMATION);
Object.freeze(CONFIG.SOCKET_EVENTS);
Object.freeze(CONFIG.ENDPOINTS);
