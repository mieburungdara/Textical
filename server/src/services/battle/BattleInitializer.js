const BaseService = require('../BaseService');
const consumableService = require('../consumableService');
const StandardBattleInitializer = require('./initializers/StandardBattleInitializer');
const HordeBattleInitializer = require('./initializers/HordeBattleInitializer');
const PvpBattleInitializer = require('./initializers/PvpBattleInitializer');

class BattleInitializer extends BaseService {
    constructor() {
        super();
        this.standardInitializer = new StandardBattleInitializer(this.db);
        this.hordeInitializer = new HordeBattleInitializer(this.db);
        this.pvpInitializer = new PvpBattleInitializer(this.db);
    }

    /**
     * Snapshot inventory potions for a user before battle.
     * @param {number} userId - User ID.
     * @returns {Promise<Object>} Potion snapshot.
     */
    async snapshotUserPotions(userId) {
        const potions = await consumableService.getUserPotions(userId);
        
        return {
            healthPotions: potions.healthPotions || 0,
            healingPotions: potions.healingPotions || 0,
            manaPotions: potions.manaPotions || 0,
            snapshotAt: Date.now()
        };
    }

    /**
     * Setup a horde battle simulation.
     * @param {number} userId - Attacking User ID.
     * @param {Array<number>} monsterTemplateIds - List of monster template IDs.
     * @returns {Promise<Object>} Simulation result and snapshot.
     */
    async setupHordeSimulation(userId, monsterTemplateIds) {
        return this.hordeInitializer.execute(
            userId, 
            monsterTemplateIds, 
            this.snapshotUserPotions.bind(this)
        );
    }

    /**
     * Setup a standard PvE battle simulation.
     * @param {number} userId - User ID.
     * @param {number} monsterTemplateId - Monster Template ID.
     * @returns {Promise<Object>} Simulation context.
     */
    async setupSimulation(userId, monsterTemplateId) {
        return this.standardInitializer.execute(
            userId, 
            monsterTemplateId, 
            this.snapshotUserPotions.bind(this)
        );
    }

    /**
     * Setup a PvP battle simulation.
     * @param {number} attackerId - Attacker User ID.
     * @param {number} defenderId - Defender User ID.
     * @param {number} regionId - Region ID context.
     * @returns {Promise<Object>} Simulation result.
     */
    async setupPvpSimulation(attackerId, defenderId, regionId) {
        return this.pvpInitializer.execute(attackerId, defenderId, regionId);
    }
}

module.exports = new BattleInitializer();

module.exports = new BattleInitializer();
