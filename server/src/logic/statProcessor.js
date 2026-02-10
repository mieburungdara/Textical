const { EnhancedStat, StatSet, StatModifierType } = require('./statSystem');

/**
 * Stat Processor - Calculates hero and monster stats from base values, jobs, and equipment
 * (v3.0 - Professional Standard)
 */
class StatProcessor {
    /**
     * Calculate comprehensive hero stats
     * @param {Object} heroData - Hero data with base stats, job, equipment, etc.
     * @param {Object} context - Calculation context (level, buffs, etc.)
     * @returns {Object} StatSet object with all calculated stats
     */
    static calculateHeroStats(heroData, context = {}) {
        const stats = new StatSet(heroData.name || 'Hero');
        
        // Define base stat mapping
        const statMap = {
            // Health & Resources
            'health_max': { base: heroData.hp_base || 100, min: 1 },
            'mana_max': { base: heroData.mp_base || heroData.mana_base || 100, min: 0 },
            
            // Primary Attributes
            'strength': { base: heroData.str || 10 },
            'dexterity': { base: heroData.dex || 10 },
            'intelligence': { base: heroData.int || 10 },
            'vitality': { base: heroData.vit || 10 },
            'luck': { base: heroData.luk || 5 },
            
            // Combat Stats
            'attack_damage': { base: heroData.damage_base || 10 },
            'defense': { base: heroData.defense_base || 0 },
            'speed': { base: heroData.speed_base || 5 },
            'attack_range': { base: heroData.range_base || 1 },
            'accuracy': { base: heroData.accuracy_base || 100 },
            'dodge_rate': { base: heroData.dodge_chance || 0.05, max: 0.95 },
            'crit_chance': { base: heroData.crit_chance || 0.05, max: 1.0 },
            'crit_damage': { base: heroData.crit_damage || 1.5, min: 1.0 },
            'block_chance': { base: heroData.block_chance || 0, max: 0.8 },
            'block_power': { base: heroData.block_power_base || 0.5, max: 0.95 },
            
            // New Derived Stats
            'initiative': { base: heroData.initiative_base || 0 },
            'armor_penetration': { base: heroData.armor_penetration || 0 },
            'skill_power': { base: heroData.skill_power_base || 10 },
            'tenacity': { base: heroData.tenacity_base || 0, max: 0.9 },
            'lifesteal': { base: heroData.lifesteal_base || 0 },
            'spell_vamp': { base: heroData.spell_vamp || 0 },
            'cooldown_reduction': { base: heroData.cooldown_reduction || 0, max: 0.75 },
            'move_speed': { base: heroData.move_speed || 100 },
            'attack_speed': { base: heroData.attack_speed || 1.0 }
        };

        // Initialize all stats
        for (const [key, config] of Object.entries(statMap)) {
            stats.addStat(key, config.base, {
                minValue: config.min,
                maxValue: config.max,
                name: key
            });
        }

        // 1. Apply Job/Class Multipliers
        const combatClass = heroData.combatClass || heroData.current_job;
        if (combatClass) {
            const classSource = `Class:${combatClass.name}`;
            this._applyClassBonuses(stats, combatClass, classSource);
        }

        // 2. Apply Equipment Stats
        if (heroData.equipment) {
            this._applyEquipmentStats(stats, heroData.equipment);
        }

        // 3. Apply Traits
        if (heroData.traits) {
            this._applyTraitBonuses(stats, heroData.traits);
        }

        // 4. Apply Buffs
        if (heroData.activeBuffs || heroData.buffs) {
            this._applyBuffs(stats, heroData.activeBuffs || heroData.buffs);
        }

        return stats;
    }

    /**
     * Calculate monster stats
     * @param {Object} monsterData - Monster template data
     * @returns {Object} Calculated stats as an object (for backward compatibility or stat set)
     */
    static calculateMonsterStats(monsterData) {
        const stats = new StatSet(monsterData.name || 'Monster');
        
        const statFields = [
            'hp_base', 'damage_base', 'defense_base', 'speed_base', 'range_base',
            'accuracy_base', 'dodge_rate', 'crit_chance', 'crit_damage',
            'block_chance', 'block_power_base', 'initiative_base', 'lifesteal_base',
            'cooldown_reduction', 'move_speed', 'attack_speed'
        ];

        // Mapping monster DB fields to standard stat keys
        const fieldMapping = {
            'hp_base': 'health_max',
            'damage_base': 'attack_damage',
            'defense_base': 'defense',
            'speed_base': 'speed',
            'range_base': 'attack_range',
            'accuracy_base': 'accuracy',
            'block_power_base': 'block_power'
        };

        statFields.forEach(field => {
            const key = fieldMapping[field] || field;
            const val = monsterData[field] !== undefined ? monsterData[field] : 0;
            stats.addStat(key, val, { name: key });
        });

        // Apply monster traits if any
        if (monsterData.traits) {
            this._applyTraitBonuses(stats, monsterData.traits);
        }

        return stats;
    }

    /**
     * Internal: Apply class growth and multipliers
     * @private
     */
    static _applyClassBonuses(stats, combatClass, source) {
        // Handle hp_mult style legacy multipliers
        if (combatClass.hp_mult) {
            const stat = stats.getStat('health_max');
            if (stat) stat.addModifier({ value: combatClass.hp_mult - 1, type: StatModifierType.PERCENT_ADD, source });
        }
        if (combatClass.damage_mult) {
            const stat = stats.getStat('attack_damage');
            if (stat) stat.addModifier({ value: combatClass.damage_mult - 1, type: StatModifierType.PERCENT_ADD, source });
        }
        
        // Handle growth style properties
        if (combatClass.hpGrowth) {
            const stat = stats.getStat('health_max');
            if (stat) stat.addModifier({ value: combatClass.hpGrowth, type: StatModifierType.FLAT, source });
        }
        if (combatClass.atkGrowth) {
            const stat = stats.getStat('attack_damage');
            if (stat) stat.addModifier({ value: combatClass.atkGrowth, type: StatModifierType.FLAT, source });
        }
        if (combatClass.defGrowth) {
            const stat = stats.getStat('defense');
            if (stat) stat.addModifier({ value: combatClass.defGrowth, type: StatModifierType.FLAT, source });
        }
    }

    /**
     * Internal: Apply equipment stats
     * @private
     */
    static _applyEquipmentStats(stats, equipment) {
        const eqList = Array.isArray(equipment) ? equipment : Object.values(equipment);
        
        eqList.forEach(eq => {
            const itemData = eq.data || eq.template || eq.itemTemplate;
            if (!itemData || !itemData.stats) return;

            const source = `Equip:${itemData.name}`;
            itemData.stats.forEach(s => {
                const stat = stats.getStat(s.statKey);
                if (stat) {
                    stat.addModifier({
                        value: s.statValue,
                        type: StatModifierType.FLAT,
                        source
                    });
                }
            });
        });
    }

    /**
     * Internal: Apply trait bonuses
     * @private
     */
    static _applyTraitBonuses(stats, traits) {
        traits.forEach(t => {
            const traitData = t.trait || t;
            if (!traitData || !traitData.stats) return;

            const source = `Trait:${traitData.name}`;
            traitData.stats.forEach(s => {
                const stat = stats.getStat(s.statKey);
                if (stat) {
                    stat.addModifier({
                        value: s.statValue,
                        type: s.statValue < 1 && s.statValue > -1 ? StatModifierType.PERCENT_ADD : StatModifierType.FLAT,
                        source
                    });
                }
            });
        });
    }

    /**
     * Internal: Apply temporal buffs
     * @private
     */
    static _applyBuffs(stats, buffs) {
        buffs.forEach(b => {
            const stat = stats.getStat(b.statKey);
            if (stat) {
                stat.addModifier({
                    value: b.statValue,
                    type: b.isPercent ? StatModifierType.PERCENT_ADD : StatModifierType.FLAT,
                    source: `Buff:${b.name || 'Unknown'}`
                });
            }
        });
    }
}

module.exports = StatProcessor;