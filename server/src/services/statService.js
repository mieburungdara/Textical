const { Stat, StatModifier } = require('../logic/statSystem');
const raceBonuses = require('../data/race_bonuses.json');
const Registry = require('../data/registry');

class StatService {
    calculateHeroStats(heroData) {
        // 1. Initialize Primary Attributes
        const primary = {
            str: new Stat(heroData.str || 10),
            dex: new Stat(heroData.dex || 10),
            int: new Stat(heroData.int || 10),
            vit: new Stat(heroData.vit || 10)
        };

        // 2. Initialize Secondary Stats with AAA Additions
        const stats = {
            health_max: new Stat(heroData.hp_base || 100),
            mana_max: new Stat(heroData.mana_base || 20),
            attack_damage: new Stat(heroData.damage_base || 10),
            defense: new Stat(heroData.defense_base || 0),
            speed: new Stat(heroData.speed_base || 5),
            attack_range: new Stat(heroData.range_base || 1),
            dodge_rate: new Stat(heroData.dodge_chance || 0),
            crit_chance: new Stat(heroData.crit_chance || 0.05),
            crit_damage: new Stat(heroData.crit_damage || 1.5),
            hp_regen: new Stat(heroData.hp_regen || 0),
            mana_regen: new Stat(heroData.mana_regen || 2),
            block_chance: new Stat(heroData.block_chance || 0),
            
            // --- NEW AAA SECONDARY STATS ---
            accuracy: new Stat(heroData.accuracy_base || 100), // Base 100%
            armor_penetration: new Stat(heroData.ar_pen_base || 0), // Flat reduction
            skill_power: new Stat(heroData.skill_power_base || 10), // Base skill DMG
            tenacity: new Stat(heroData.tenacity_base || 0), // Status duration reduction
            block_power: new Stat(heroData.block_power_base || 0.5), // Default 50% reduction
            initiative: new Stat(heroData.initiative_base || 0), // Starting AP
            lifesteal_rate: new Stat(heroData.lifesteal_base || 0) // % heal on hit
        };

        const applyMod = (statKey, val, type, src) => {
            if (val != null && stats[statKey]) {
                stats[statKey].addModifier(new StatModifier(val, type, src));
            }
        };

        const applyPrimaryMod = (attrKey, val, type, src) => {
            if (val != null && primary[attrKey]) {
                primary[attrKey].addModifier(new StatModifier(val, type, src));
            }
        };

        // 3. Process External Modifiers (Race, Trait, Items)
        // Note: For brevity, we assume external sources can modify both primary and secondary
        if (heroData.race && raceBonuses[heroData.race]) {
            const rb = raceBonuses[heroData.race];
            if (rb.str) applyPrimaryMod('str', rb.str - 10, StatModifier.Type.FLAT, "Race");
            if (rb.dex) applyPrimaryMod('dex', rb.dex - 10, StatModifier.Type.FLAT, "Race");
            if (rb.int) applyPrimaryMod('int', rb.int - 10, StatModifier.Type.FLAT, "Race");
            if (rb.vit) applyPrimaryMod('vit', rb.vit - 10, StatModifier.Type.FLAT, "Race");
        }

        // 4. AAA SCALING LOGIC (Mapping Primary to Secondary)
        const s = primary.str.getValue();
        const d = primary.dex.getValue();
        const i = primary.int.getValue();
        const v = primary.vit.getValue();

        // STR -> ATK & Block Power
        applyMod('attack_damage', s * 0.5, StatModifier.Type.FLAT, "Attribute:STR");
        applyMod('block_power', s * 0.01, StatModifier.Type.FLAT, "Attribute:STR");

        // DEX -> Accuracy, Dodge, Speed
        applyMod('accuracy', d * 2, StatModifier.Type.FLAT, "Attribute:DEX");
        applyMod('dodge_rate', d * 0.5, StatModifier.Type.FLAT, "Attribute:DEX");
        applyMod('speed', d * 0.1, StatModifier.Type.FLAT, "Attribute:DEX");

        // INT -> Skill Power, Mana
        applyMod('skill_power', i * 1.5, StatModifier.Type.FLAT, "Attribute:INT");
        applyMod('mana_max', i * 5, StatModifier.Type.FLAT, "Attribute:INT");

        // VIT -> HP, Tenacity
        applyMod('health_max', v * 10, StatModifier.Type.FLAT, "Attribute:VIT");
        applyMod('tenacity', v * 0.5, StatModifier.Type.FLAT, "Attribute:VIT");

        // 5. Finalize Stats
        const finalStats = Object.fromEntries(Object.entries(stats).map(([k, s]) => [k, s.getValue()]));
        
        // Include primary attributes in output for UI
        finalStats.attributes = {
            str: s, dex: d, int: i, vit: v
        };

        return finalStats;
    }
}

module.exports = new StatService();
