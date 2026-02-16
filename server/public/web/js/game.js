/**
 * Textical Web Client - Game State Module
 * Manages all game state and data
 */
const Game = {
    // Player data
    player: {
        id: null,
        username: '',
        displayName: '',
        gold: 0,
        silver: 0,
        energy: 100,
        maxEnergy: 100,
        currentRegion: 1,
        isInTavern: false,
        tavernTimeToday: 0
    },

    // Collections
    heroes: [],
    inventory: [],
    quests: [],
    recipes: [],
    formation: [],
    friends: [],

    // World data
    regions: [],
    worldState: null,
    currentRegionData: null,

    // Task state
    currentTask: null,

    // Market data
    marketListings: [],

    // Tavern data
    mercenaries: [],

    // UI State
    selectedHero: null,
    selectedRegion: null,
    currentPanel: 'town',

    /**
     * Initialize game state
     */
    async init() {
        // Load initial data
        await this.loadPlayerData();
        await this.loadWorldData();
    },

    /**
     * Load all player data from server
     */
    async loadPlayerData() {
        try {
            // Load player profile
            const profile = await API.getUserProfile();
            this.updatePlayer(profile);

            // Load heroes - API.request() already unwraps the response
            const heroesData = await API.getHeroes();
            console.log('[Game] Heroes response:', heroesData);
            console.log('[Game] Heroes response type:', typeof heroesData, Array.isArray(heroesData));
            this.heroes = Array.isArray(heroesData) ? heroesData : (heroesData.heroes || []);
            console.log('[Game] Heroes loaded:', this.heroes.length);
            
            // Detailed hero status logging
            console.log('[Game] ========== HERO STATUS DETAILED ==========');
            if (this.heroes.length === 0) {
                console.warn('[Game] ⚠️ NO HEROES FOUND - Check if user has heroes in database');
            } else {
                this.heroes.forEach((hero, index) => {
                    console.log(`[Game] --- Hero #${index + 1} ---`);
                    console.log(`  ID: ${hero.id}`);
                    console.log(`  Name: ${hero.name || 'UNDEFINED'}`);
                    console.log(`  Race: ${hero.race || 'UNDEFINED'}`);
                    console.log(`  Class ID: ${hero.classId || 'UNDEFINED'}`);
                    console.log(`  Class Level: ${hero.classLevel || 0}`);
                    console.log(`  Level: ${hero.level || 0}`);
                    console.log(`  XP: ${hero.experience || 0}`);
                    
                    // Stats
                    console.log(`  --- Stats ---`);
                    console.log(`  HP: ${hero.currentHp || 0}/${hero.maxHp || 0}`);
                    console.log(`  MP: ${hero.currentMp || 0}/${hero.maxMp || 0}`);
                    console.log(`  ATK: ${hero.attack || hero.atk || 0}`);
                    console.log(`  DEF: ${hero.defense || hero.def || 0}`);
                    console.log(`  SPD: ${hero.speed || hero.spd || 0}`);
                    
                    // Combat Class
                    if (hero.combatClass) {
                        console.log(`  --- Combat Class ---`);
                        console.log(`  Class Name: ${hero.combatClass.name || 'UNDEFINED'}`);
                        console.log(`  Class Type: ${hero.combatClass.type || 'UNDEFINED'}`);
                    } else {
                        console.warn(`  ⚠️ No combatClass data`);
                    }
                    
                    // Equipment
                    if (hero.equipment && hero.equipment.length > 0) {
                        console.log(`  --- Equipment (${hero.equipment.length} items) ---`);
                        hero.equipment.forEach(eq => {
                            console.log(`    Slot: ${eq.slotKey || 'UNKNOWN'}, Item ID: ${eq.itemInstanceId || 'N/A'}`);
                        });
                    } else {
                        console.log(`  --- Equipment: NONE ---`);
                    }
                    
                    // Skills
                    if (hero.skills && hero.skills.length > 0) {
                        console.log(`  --- Skills (${hero.skills.length} active) ---`);
                        hero.skills.forEach(s => {
                            if (s.skill) {
                                console.log(`    Skill: ${s.skill.name || 'UNDEFINED'} (ID: ${s.skill.id})`);
                            } else {
                                console.log(`    Skill: RAW DATA - ${JSON.stringify(s)}`);
                            }
                        });
                    } else {
                        console.log(`  --- Skills: NONE ---`);
                    }
                    
                    // Raw data for debugging
                    console.log(`  --- RAW HERO DATA ---`);
                    console.log(JSON.stringify(hero, null, 2));
                });
            }
            console.log('[Game] ========== END HERO STATUS ==========');
            
            // Load inventory - API.request() already unwraps the response
            const invData = await API.getInventory();
            this.inventory = Array.isArray(invData) ? invData : (invData.items || []);

            // Load quests - API.request() already unwraps the response
            const questsData = await API.getQuests();
            this.quests = Array.isArray(questsData) ? questsData : (questsData.quests || []);

            // Load recipes - API.request() already unwraps the response
            try {
                const recipesData = await API.getRecipes();
                this.recipes = Array.isArray(recipesData) ? recipesData : (recipesData.recipes || []);
            } catch (e) {
                console.warn('Could not load recipes:', e);
            }

            // Load current task - API.request() already unwraps the response
            try {
                const taskData = await API.getActiveTask();
                this.currentTask = taskData.task || taskData || null;
            } catch (e) {
                this.currentTask = null;
            }

            console.log('[Game] Player data loaded');
        } catch (error) {
            console.error('[Game] Failed to load player data:', error);
            throw error;
        }
    },

    /**
     * Load world data from server
     */
    async loadWorldData() {
        try {
            // Load regions - API.request() already unwraps the response
            const regionsData = await API.getRegions();
            this.regions = Array.isArray(regionsData) ? regionsData : (regionsData.regions || []);

            // Load world state
            try {
                this.worldState = await API.getWorldState();
            } catch (e) {
                console.warn('Could not load world state:', e);
            }

            // Load current region details
            if (this.player.currentRegion) {
                await this.loadRegionDetails(this.player.currentRegion);
            }

            console.log('[Game] World data loaded');
        } catch (error) {
            console.error('[Game] Failed to load world data:', error);
            throw error;
        }
    },

    /**
     * Load region details
     */
    async loadRegionDetails(regionId) {
        try {
            this.currentRegionData = await API.getRegionDetails(regionId);
        } catch (e) {
            console.warn('Could not load region details:', e);
        }
    },

    /**
     * Update player data
     */
    updatePlayer(data) {
        if (!data) return;
        
        this.player = {
            ...this.player,
            ...data
        };
    },

    /**
     * Update inventory
     */
    updateInventory(items) {
        this.inventory = items || [];
    },

    /**
     * Add item to inventory
     */
    addToInventory(item) {
        const existing = this.inventory.find(i => i.templateId === item.templateId);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
        } else {
            this.inventory.push(item);
        }
    },

    /**
     * Remove item from inventory
     */
    removeFromInventory(itemId, quantity = 1) {
        const index = this.inventory.findIndex(i => i.id === itemId);
        if (index !== -1) {
            const item = this.inventory[index];
            if (item.quantity && item.quantity > quantity) {
                item.quantity -= quantity;
            } else {
                this.inventory.splice(index, 1);
            }
        }
    },

    /**
     * Update hero data
     */
    updateHero(heroId, data) {
        const index = this.heroes.findIndex(h => h.id === heroId);
        if (index !== -1) {
            this.heroes[index] = { ...this.heroes[index], ...data };
        }
    },

    /**
     * Get hero by ID
     */
    getHero(heroId) {
        return this.heroes.find(h => h.id === heroId);
    },

    /**
     * Update current task
     */
    updateTask(task) {
        this.currentTask = task;
    },

    /**
     * Clear current task
     */
    clearTask() {
        this.currentTask = null;
    },

    /**
     * Update quests
     */
    updateQuests(quests) {
        this.quests = quests || [];
    },

    /**
     * Complete a quest
     */
    completeQuest(questId) {
        const index = this.quests.findIndex(q => q.id === questId);
        if (index !== -1) {
            this.quests.splice(index, 1);
        }
    },

    /**
     * Set current panel
     */
    setPanel(panelName) {
        this.currentPanel = panelName;
    },

    /**
     * Set selected hero
     */
    selectHero(heroId) {
        this.selectedHero = heroId;
    },

    /**
     * Set selected region
     */
    selectRegion(regionId) {
        this.selectedRegion = regionId;
    },

    /**
     * Check if player can perform action
     */
    canPerformAction() {
        // Check if busy with task
        if (this.currentTask && this.currentTask.status === 'RUNNING') {
            return false;
        }
        // Check energy
        if (this.player.energy <= 0) {
            return false;
        }
        return true;
    },

    /**
     * Get current location name
     */
    getCurrentLocationName() {
        if (this.player.isInTavern) {
            return 'Tavern';
        }
        if (this.currentRegionData) {
            return this.currentRegionData.name;
        }
        return 'Unknown';
    },

    /**
     * Format time for display
     */
    formatGameTime(day, hour) {
        const h = String(hour || 0).padStart(2, '0');
        return `Day ${day} - ${h}:00`;
    },

    /**
     * Calculate task progress percentage
     */
    getTaskProgress() {
        if (!this.currentTask || !this.currentTask.finishesAt) {
            return 0;
        }
        
        const now = Date.now();
        const start = new Date(this.currentTask.startedAt).getTime();
        const end = new Date(this.currentTask.finishesAt).getTime();
        
        if (now >= end) return 100;
        if (now <= start) return 0;
        
        return Math.round(((now - start) / (end - start)) * 100);
    },

    /**
     * Serialize state for debugging
     */
    serialize() {
        return {
            player: this.player,
            heroesCount: this.heroes.length,
            inventoryCount: this.inventory.length,
            questsCount: this.quests.length,
            currentTask: this.currentTask,
            currentPanel: this.currentPanel
        };
    }
};
