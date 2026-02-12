/**
 * BattleRegistry
 * 
 * Registry untuk menyimpan active battle simulations.
 * Digunakan untuk sistem Health Potion yang membutuhkan akses
 * ke battle unit selama battle berlangsung.
 * 
 * Architecture: Async Battle Support
 * - Battles yang dimulai dengan startAsyncBattle() akan disimpan di registry
 * - API calls dapat mengakses battle untuk menggunakan potions
 * - Battle selesai dengan endBattle() yang cleanup registry
 */

class BattleRegistry {
    constructor() {
        // Map<battleId, BattleSimulation>
        this.activeBattles = new Map();
        
        // Map<userId, battleId> - untuk tracking user yang sedang dalam battle
        this.userBattles = new Map();
        
        // Cleanup interval (remove expired battles)
        this.cleanupInterval = null;
    }
    
    /**
     * Start async battle dan simpan ke registry
     * @param {string} battleId 
     * @param {BattleSimulation} simulation 
     * @param {number} userId 
     */
    register(battleId, simulation, userId) {
        this.activeBattles.set(battleId, simulation);
        this.userBattles.set(userId, battleId);
        
        console.log(`[BATTLE_REGISTRY] Battle ${battleId} started for user ${userId}`);
        
        return this;
    }
    
    /**
     * Get battle simulation by ID
     * @param {string} battleId 
     * @returns {BattleSimulation|null}
     */
    get(battleId) {
        return this.activeBattles.get(battleId) || null;
    }
    
    /**
     * Get battle by user ID
     * @param {number} userId 
     * @returns {BattleSimulation|null}
     */
    getByUser(userId) {
        const battleId = this.userBattles.get(userId);
        if (battleId) {
            return this.activeBattles.get(battleId) || null;
        }
        return null;
    }
    
    /**
     * Get battle ID by user ID
     * @param {number} userId 
     * @returns {string|null}
     */
    getBattleIdByUser(userId) {
        return this.userBattles.get(userId) || null;
    }
    
    /**
     * Check jika user sedang dalam battle
     * @param {number} userId 
     * @returns {boolean}
     */
    isUserInBattle(userId) {
        return this.userBattles.has(userId);
    }
    
    /**
     * End battle dan cleanup dari registry
     * @param {string} battleId 
     * @returns {Object|null} Battle result data
     */
    endBattle(battleId) {
        const simulation = this.activeBattles.get(battleId);
        if (!simulation) {
            console.warn(`[BATTLE_REGISTRY] Battle ${battleId} not found for ending`);
            return null;
        }
        
        // Get battle result sebelum cleanup
        const result = {
            battleId,
            winner: simulation.winnerTeam,
            durationTicks: simulation.currentTick,
            units: simulation.units.map(u => ({
                instanceId: u.instanceId,
                heroId: u.heroId,
                name: u.data.name,
                isDead: u.isDead,
                potionUsed: u.potionUsedInBattle
            }))
        };
        
        // Cleanup dari registry
        this.activeBattles.delete(battleId);
        
        // Remove user associations
        for (const [userId, bId] of this.userBattles.entries()) {
            if (bId === battleId) {
                this.userBattles.delete(userId);
            }
        }
        
        console.log(`[BATTLE_REGISTRY] Battle ${battleId} ended. Result: ${result.winner === 0 ? 'VICTORY' : 'DEFEAT'}`);
        
        return result;
    }
    
    /**
     * End battle by user ID
     * @param {number} userId 
     * @returns {Object|null}
     */
    endBattleByUser(userId) {
        const battleId = this.userBattles.get(userId);
        if (battleId) {
            return this.endBattle(battleId);
        }
        return null;
    }
    
    /**
     * Get all active battles count
     * @returns {number}
     */
    size() {
        return this.activeBattles.size;
    }
    
    /**
     * Get all active battle IDs
     * @returns {string[]}
     */
    getAllBattleIds() {
        return Array.from(this.activeBattles.keys());
    }
    
    /**
     * Cleanup expired battles (if any timeout mechanism)
     * Note: Ini mainly untuk cleanup jika ada battle yang stuck
     */
    cleanup() {
        const now = Date.now();
        const timeout = 30 * 60 * 1000; // 30 minutes timeout
        
        for (const [battleId, simulation] of this.activeBattles) {
            const startTime = simulation.startTime || now;
            if (now - startTime > timeout) {
                console.warn(`[BATTLE_REGISTRY] Battle ${battleId} timed out, force ending`);
                this.endBattle(battleId);
            }
        }
    }
    
    /**
     * Start cleanup interval
     * @param {number} intervalMs - Cleanup interval dalam milliseconds
     */
    startCleanup(intervalMs = 60000) {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, intervalMs);
        
        return this;
    }
    
    /**
     * Stop cleanup interval
     */
    stopCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
    
    /**
     * Get registry stats
     * @returns {Object}
     */
    getStats() {
        return {
            activeBattles: this.activeBattles.size,
            usersInBattles: this.userBattles.size,
            battleIds: this.getAllBattleIds()
        };
    }
}

// Singleton instance
const battleRegistry = new BattleRegistry();

// Start cleanup interval (1 minute)
battleRegistry.startCleanup(60000);

module.exports = battleRegistry;
