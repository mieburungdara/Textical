/**
 * EnhancedScalingComponent
 * Handles primary to secondary attribute mapping and complex synergies.
 */
class EnhancedScalingComponent {
    /**
     * Apply basic attribute scaling
     */
    applyAttributeScaling(primary, stats, applyMod) {
        const s = primary.str.getValue();
        const d = primary.dex.getValue();
        const i = primary.int.getValue();
        const def_p = primary.def?.getValue() || 0;

        // STR Scaling (Offensive)
        applyMod('attack_damage', s * 0.5, 0, "Attribute:STR");
        
        // DEX Scaling (includes former LUK: crit_chance)
        applyMod('accuracy', d * 1.5, 0, "Attribute:DEX");
        applyMod('dodge_rate', d * 0.002, 0, "Attribute:DEX"); // 0.2% per DEX
        applyMod('speed', d * 0.1, 0, "Attribute:DEX");
        applyMod('attack_speed', d * 0.005, 0, "Attribute:DEX");
        applyMod('crit_chance', d * 0.005, 0, "Attribute:DEX (was LUK)"); // 0.5% per DEX
        
        // INT Scaling
        applyMod('skill_power', i * 1.5, 0, "Attribute:INT");
        applyMod('mana_max', i * 5, 0, "Attribute:INT");
        applyMod('spell_vamp', i * 0.001, 0, "Attribute:INT"); // 0.1% per INT
        
        // DEF Scaling (Primary Defense Attribute)
        if (def_p > 0) {
            applyMod('defense', def_p * 1.0, 0, "Attribute:DEF"); // Unified Physical/Armor
            applyMod('tenacity', def_p * 0.005, 0, "Attribute:DEF"); // Unified Magical/Tenacity (0.5% per DEF)
        }
    }

    /**
     * Apply complex scaling synergies between attributes
     */
    applyComplexScaling(primary, stats, applyMod) {
        const s = primary.str.getValue();
        const d = primary.dex.getValue();
        const i = primary.int.getValue();
        const def_p = primary.def?.getValue() || 0;

        // STR + DEX = Crit Damage synergy
        if (s > 0 && d > 0) {
            const critDamageBonus = (s * d) * 0.0001;
            applyMod('crit_damage', critDamageBonus, 0, "Synergy:STR+DEX");
        }

        // New DEF synergies can be added here

        // LUK + DEX synergy removed - LUK merged into DEX
    }

    /**
     * Apply job-based bonuses
     */
    applyJobScaling(heroData, stats, applyMod) {
        if (!heroData.job || !heroData.jobLevel) return;

        const jobName = heroData.job.name?.toUpperCase() || '';
        const level = heroData.jobLevel;

        // Block Power Archetype Configuration
        // block_power = jobLevel × baseMultiplier × archetypeMultiplier
        // Base: 1% per job level (0.01)
        const BLOCK_POWER_BASE = 0.01;
        
        const archetypeMultipliers = {
            // Tank - 100% (full)
            TANK: 1.0,
            // Melee DPS - 50%
            MELEE_DPS: 0.5,
            // Ranged DPS - 25%
            RANGED_DPS: 0.25,
            // Mage/Caster - 10%
            CASTER: 0.1,
            // Healer - 25%
            HEALER: 0.25
        };

        // Class to archetype mapping
        const classArchetypeMap = {
            // Tank
            WARRIOR: 'TANK',
            KNIGHT: 'TANK',
            PALADIN: 'TANK',
            GUARDIAN: 'TANK',
            
            // Melee DPS
            BERSERKER: 'MELEE_DPS',
            ROGUE: 'MELEE_DPS',
            ASSASSIN: 'MELEE_DPS',
            
            // Ranged DPS
            RANGER: 'RANGED_DPS',
            ARCHER: 'RANGED_DPS',
            HUNTER: 'RANGED_DPS',
            
            // Caster
            MAGE: 'CASTER',
            WIZARD: 'CASTER',
            SORCERER: 'CASTER',
            
            // Healer
            CLERIC: 'HEALER',
            PRIEST: 'HEALER',
            DRUID: 'HEALER'
        };

        const archetype = classArchetypeMap[jobName];
        if (archetype) {
            const multiplier = archetypeMultipliers[archetype];
            const blockPowerValue = level * BLOCK_POWER_BASE * multiplier;
            applyMod('block_power', blockPowerValue, 0, `Job:${jobName}:${archetype}`);
        }

        // Specialized Job Bonuses (non-combat jobs)
        if (jobName === 'BLACKSMITH') {
            applyMod('defense', level * 2, 0, `Job:${jobName}`);
            applyMod('block_power', level * 0.005, 0, `Job:${jobName}`);
        } else if (jobName === 'MINER') {
            applyMod('health_max', level * 5, 0, `Job:${jobName}`);
            applyMod('attack_damage', level * 0.5, 0, `Job:${jobName}`);
        } else if (jobName === 'ALCHEMIST') {
            applyMod('mana_max', level * 3, 0, `Job:${jobName}`);
            applyMod('skill_power', level * 1, 0, `Job:${jobName}`);
        } else if (jobName === 'LUMBERJACK') {
            applyMod('attack_damage', level * 1, 0, `Job:${jobName}`);
            applyMod('speed', level * 0.05, 0, `Job:${jobName}`);
        }
    }

    /**
     * Get formula metadata for UI display.
     */
    getFormulaMetadata() {
        return {
            STR: "0.5 ATK per point",
            DEX: "1.5 ACC, 0.2% Dodge, 0.1 SPD, 0.5% ASPD, 0.5% Crit per point",
            INT: "1.5 Skill Power, 5 MP, 0.1% Spell Vamp per point",
            DEF: "1.0 Defense (Armor), 0.5% Tenacity per point",
            SYNERGY_CRIT: "STR * DEX * 0.0001 bonus Crit Damage"
        };
    }
}

module.exports = new EnhancedScalingComponent();