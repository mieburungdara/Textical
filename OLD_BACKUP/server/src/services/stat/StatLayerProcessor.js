/**
 * StatLayerProcessor
 * Specialized processors for individual stat calculation layers.
 */
const StatCurveCalculator = require('./StatCurveCalculator');
const { EnhancedStat } = require('../../logic/stat');

class StatLayerProcessor {
    /**
     * Apply growth curves to stats.
     * @param {Object} stats - Secondary stats map.
     * @param {Object} primary - Primary stats map.
     * @param {Object} heroData - Hero data.
     * @param {Object} context - Calculation context.
     * @param {Object} systems - External systems (enhancedStatGrowthSystem, ModifierPriority, etc).
     */
    static applyGrowth(stats, primary, heroData, context, systems) {
        const { enhancedStatGrowthSystem, ModifierPriority, StatCurveCalculator, StatModifier, StatModifierType, GrowthCurveType } = systems;
        
        enhancedStatGrowthSystem.applyBaseGrowth(stats, context.level);
        enhancedStatGrowthSystem.applyGrowth(stats, heroData.combatClass, context.level);
    }

    /**
     * Apply equipment stats and modifiers.
     * @param {Object} stats - Secondary stats map.
     * @param {Array} equipment - Hero equipment list.
     * @param {Object} context - Calculation context.
     * @param {Function} applyMod - Modifier applicator.
     * @param {Object} helpers - Helper functions (applyDurabilityPenalty).
     */
    static applyEquipment(stats, equipment, context, applyMod, helpers) {
        for (const eq of equipment) {
            const instance = eq.itemInstance;
            if (!instance) continue;
            
            if (instance.currentDurability <= 0) {
                helpers.applyDurabilityPenalty(stats, applyMod, `EquipBroken:${instance.template.name}`);
                continue;
            }
            
            const maxDurability = instance.maxDurability || 100;
            const durabilityFactor = Math.max(0.5, instance.currentDurability / maxDurability);
            
            let valid = true;
            if (instance.template.category === "PICKAXE" && context.contextType !== "MINING") valid = false;
            if (instance.template.category === "AXE" && context.contextType !== "LUMBERING") valid = false;
            if (instance.template.category === "FISHING_ROD" && context.contextType !== "FISHING") valid = false;
            if (instance.template.category === "HERBALISM_SICKLE" && context.contextType !== "HERBALISM") valid = false;

            if (!valid) continue;

            const qualityMultipliers = {
                'COMMON': 1.0,
                'UNCOMMON': 1.1,
                'RARE': 1.15,
                'EPIC': 1.25,
                'MASTERWORK': 1.3,
                'LEGENDARY': 1.5
            };
            const qualityMult = qualityMultipliers[instance.quality] || 1.0;
            
            const powerScale = instance.powerScale || 1.0;
            const totalMultiplier = qualityMult * powerScale * durabilityFactor;

            instance.template.stats?.forEach(s => {
                const finalValue = s.statValue * totalMultiplier;
                applyMod(s.statKey, finalValue, 0, `Equip:${instance.template.name}`, {
                    priority: 20
                });
            });

            instance.template.traits?.forEach(it => {
                it.trait.stats?.forEach(ts => {
                    const finalValue = ts.statValue * totalMultiplier;
                    applyMod(ts.statKey, finalValue, 0, `Trait:${it.trait.name}`, {
                        priority: 15
                    });
                });
            });

            instance.instanceTraits?.forEach(it => {
                it.trait.stats?.forEach(ts => {
                    const finalValue = ts.statValue * totalMultiplier;
                    applyMod(ts.statKey, finalValue, 0, `Affix:${it.trait.name}`, {
                        priority: 18
                    });
                });
            });

            // Apply enchantment bonuses
            instance.enchantments?.forEach(ench => {
                const template = ench.enchantment;
                if (!template) return;
                
                const level = ench.level || 1;
                const flatBonus = (template.statValuePerLevel || 0) * level;
                const percentBonus = (template.percentBonusPerLevel || 0) * level;
                
                // Apply flat bonus
                if (flatBonus > 0) {
                    applyMod(template.statKey, flatBonus, 0, `Enchant:${template.name}`, {
                        priority: 19 // Between traits (18) and equipment (20)
                    });
                }
                
                // Apply percentage bonus
                if (percentBonus > 0) {
                    applyMod(template.statKey, percentBonus, 1, `Enchant:${template.name}`, {
                        priority: 19
                    });
                }
            });
        }
    }

    /**
     * Apply active buffs to stats.
     * @param {Object} stats - Secondary stats map.
     * @param {Array} buffs - Hero buffs list.
     * @param {Function} applyMod - Modifier applicator.
     */
    static applyBuffs(stats, buffs, applyMod) {
        const now = new Date();
        
        buffs.forEach(b => {
            if (b.expiresAt && new Date(b.expiresAt) <= now) return;
            
            applyMod(b.statKey, b.statValue, b.isPercent ? 1 : 0, `Buff:${b.name}`, {
                priority: 30,
                condition: b.condition ? JSON.parse(b.condition) : null
            });
        });
    }

    /**
     * Apply active skills to stats.
     * @param {Object} stats - Secondary stats map.
     * @param {Array} skills - Hero skills list.
     * @param {Function} applyMod - Modifier applicator.
     */
    static applySkills(stats, skills, applyMod) {
        skills.forEach(hs => {
            if (hs.skill.category === "PASSIVE" && hs.skill.statKey) {
                applyMod(hs.skill.statKey, hs.skill.statValue, hs.skill.isPercent ? 1 : 0, `Skill:${hs.skill.name}`, {
                    priority: 25
                });
            }
        });
    }
}

module.exports = StatLayerProcessor;
