const formationService = require('../formationService');

class BattleUnitFactory {
    /**
     * Prepare a hero unit for battle simulation.
     * @param {Object} heroProfile - Hero profile/combat profile.
     * @param {Object} envContext - Environment context.
     * @param {Object} gridPos - Grid position {x, y}.
     * @returns {Object} Unit configuration for simulation.
     */
    prepareHeroUnit(heroProfile, envContext, gridPos) {
        let baseRange = heroProfile.totalStats.RANGE || 1;
            
        // Apply Class-Based Range Bonuses
        if (heroProfile.classId === 1107) baseRange += 1; // Archer bonus
        if (heroProfile.classId === 2113) baseRange += 2; // Sniper bonus

        // Race-Based Affinity Modifiers
        let raceAccMod = 1.0;
        let raceSpdMod = 1.0;
        const raceName = heroProfile.race?.name?.toUpperCase() || "";
        
        if (raceName === "ELF" || raceName === "DRAGON") {
            if (envContext.manaStaticIntensity > 1.5) {
                raceSpdMod = 1.2;
            }
        } else if (raceName === "DWARF" || raceName === "ORC") {
            if (envContext.manaStaticIntensity > 1.8) {
                raceAccMod = 0.9;
            }
        }

        const stats = {
            health_max: heroProfile.totalStats.HP || 100,
            mana_max: heroProfile.totalStats.MP || 50,
            hp_regen: heroProfile.totalStats.HP_REGEN || 0,
            mana_regen: (heroProfile.totalStats.MANA_REGEN || 0) * envContext.manaStaticIntensity,
            attack_damage: heroProfile.totalStats.ATK || 10,
            defense: heroProfile.totalStats.DEF || 5,
            speed: Math.floor((heroProfile.totalStats.SPD || 10) * raceSpdMod),
            attack_range: baseRange,
            crit_chance: 0.05,
            crit_damage: 1.5,
            dodge_rate: 5,
            accuracy: Math.floor(100 * envContext.accMod * raceAccMod),
            initiative: 0,
            block_chance: 0.1,
            block_power: 0.5
        };

        return {
            config: {
                instance_id: `hero_${heroProfile.name.replace(/\s+/g, '_')}_${Math.random().toString(36).substr(2, 5)}`,
                db_id: heroProfile.id,
                heroId: heroProfile.id,
                isMain: heroProfile.isMain,
                name: heroProfile.name,
                bt_tree: "SimpleAI",
                traits: heroProfile.activeTraits,
                abilities: heroProfile.abilities,
                equippedItems: heroProfile.equippedItems
            },
            position: gridPos,
            stats
        };
    }

    /**
     * Prepare a monster unit for battle simulation.
     * @param {Object} monsterTemplate - Monster template.
     * @param {Object} envContext - Environment context.
     * @param {Object} gridPos - Grid position {x, y}.
     * @returns {Object} Unit configuration for simulation.
     */
    prepareMonsterUnit(monsterTemplate, envContext, gridPos) {
        const stats = {
            health_max: monsterTemplate.hp_base,
            mana_max: 100,
            attack_damage: monsterTemplate.damage_base,
            defense: Math.floor(monsterTemplate.damage_base * 0.2),
            speed: 8,
            attack_range: 1,
            crit_chance: 0.02,
            crit_damage: 1.2,
            dodge_rate: 2,
            accuracy: Math.floor(90 * envContext.accMod),
            initiative: 0,
            block_chance: 0.05,
            block_power: 0.3
        };

        return {
            config: {
                instance_id: `monster_${monsterTemplate.id}_${Math.random().toString(36).substr(2, 5)}`,
                id: monsterTemplate.id,
                name: monsterTemplate.name,
                bt_tree: monsterTemplate.behaviorTree, 
                traits: monsterTemplate.traits ? monsterTemplate.traits.map(t => t.trait.name) : [],
                exp_reward: 20
            },
            position: gridPos,
            stats
        };
    }
}

module.exports = new BattleUnitFactory();
