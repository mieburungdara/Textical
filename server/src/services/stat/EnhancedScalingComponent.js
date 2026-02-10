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
        const v = primary.vit.getValue();
        const l = primary.luk.getValue();

        // STR Scaling
        applyMod('attack_damage', s * 0.5, 0, "Attribute:STR");
        applyMod('block_power', s * 0.01, 0, "Attribute:STR");
        
        // DEX Scaling
        applyMod('accuracy', d * 1.5, 0, "Attribute:DEX");
        applyMod('dodge_rate', d * 0.002, 0, "Attribute:DEX"); // 0.2% per DEX
        applyMod('speed', d * 0.1, 0, "Attribute:DEX");
        applyMod('attack_speed', d * 0.005, 0, "Attribute:DEX");
        
        // INT Scaling
        applyMod('skill_power', i * 1.5, 0, "Attribute:INT");
        applyMod('mana_max', i * 5, 0, "Attribute:INT");
        applyMod('spell_vamp', i * 0.001, 0, "Attribute:INT"); // 0.1% per INT
        
        // VIT Scaling
        applyMod('health_max', v * 10, 0, "Attribute:VIT");
        applyMod('tenacity', v * 0.002, 0, "Attribute:VIT"); // 0.2% per VIT
        applyMod('vitality_max', v * 2, 0, "Attribute:VIT");
        
        // LUK Scaling
        applyMod('crit_chance', l * 0.005, 0, "Attribute:LUK"); // 0.5% per LUK
        applyMod('item_find_chance', l * 0.01, 0, "Attribute:LUK");
    }

    /**
     * Apply complex scaling synergies between attributes
     */
    applyComplexScaling(primary, stats, applyMod) {
        const s = primary.str.getValue();
        const d = primary.dex.getValue();
        const i = primary.int.getValue();
        const v = primary.vit.getValue();
        const l = primary.luk.getValue();

        // STR + DEX = Crit Damage synergy
        if (s > 0 && d > 0) {
            const critDamageBonus = (s * d) * 0.0001;
            applyMod('crit_damage', critDamageBonus, 0, "Synergy:STR+DEX");
        }

        // INT + VIT = Health Regen synergy
        if (i > 0 && v > 0) {
            const regenBonus = (i + v) * 0.05;
            applyMod('hp_regen', regenBonus, 0, "Synergy:INT+VIT");
        }

        // LUK + DEX = Dodge synergy
        if (l > 0 && d > 0) {
            const dodgeBonus = (l * d) * 0.00005;
            applyMod('dodge_rate', dodgeBonus, 0, "Synergy:LUK+DEX");
        }
    }

    /**
     * Apply job-based bonuses
     */
    applyJobScaling(heroData, stats, applyMod) {
        if (!heroData.job || !heroData.jobLevel) return;

        const jobName = heroData.job.name?.toUpperCase() || '';
        const level = heroData.jobLevel;

        // Specialized Job Bonuses
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
}

module.exports = new EnhancedScalingComponent();