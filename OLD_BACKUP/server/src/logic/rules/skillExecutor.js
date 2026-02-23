/**
 * AAA Skill Execution Engine
 * Processes skill effects and applies them to the simulation state.
 */
const skillMasteryService = require('../../services/skill/SkillMasteryService');

class SkillExecutor {
    /**
     * Executes an active skill.
     * @param {BattleUnit} source - The unit using the skill
     * @param {BattleUnit} target - The main target of the skill
     * @param {Object} skill - The skill object (id, name, type, metadata)
     * @param {BattleSimulation} sim - The current simulation context
     */
    execute(source, target, skill, sim) {
        const meta = skill.metadata || {};
        
        sim.logger.addEvent("SKILL", `${source.data.name} uses ${skill.name} on ${target.data.name}!`);

        // Get mastery bonuses if available (attached by battleRules)
        const masteryBonuses = source._skillMasteryBonuses || null;

        switch (skill.type) {
            case "DAMAGE":
                this._executeDamageSkill(source, target, meta, sim, masteryBonuses);
                break;
            case "HEAL":
                this._executeHealSkill(source, target, meta, sim, masteryBonuses);
                break;
            case "BUFF":
                this._executeBuffSkill(source, target, meta, sim, masteryBonuses);
                break;
            default:
                sim.logger.addEvent("WARN", `Unknown skill type: ${skill.type}`);
        }

        // Clear cached bonuses after use
        source._skillMasteryBonuses = null;

        // Consume resources if any
        if (meta.mana_cost) {
            // AAA: Arcane Efficiency (v8.0)
            const intensity = sim.manaStaticIntensity || 1.0;
            let finalManaCost = meta.mana_cost;
            
            // Apply mastery cost reduction
            if (masteryBonuses && masteryBonuses.costReductionMultiplier < 1.0) {
                finalManaCost = Math.max(1, Math.floor(finalManaCost * masteryBonuses.costReductionMultiplier));
            }
            
            if (intensity > 1.0) {
                // Reduction formula: cost / (1 + (intensity - 1) * 0.4)
                finalManaCost = Math.ceil(finalManaCost / (1 + (intensity - 1) * 0.4));
            }
            
            source.consumeMana(finalManaCost, sim);
        }
    }

    _executeDamageSkill(source, target, meta, sim, masteryBonuses) {
        let multiplier = meta.multiplier || 1.0;
        const baseDamage = source.getStat("attack_damage");
        
        // Apply mastery damage bonus
        if (masteryBonuses && masteryBonuses.skillDamageMultiplier > 1.0) {
            multiplier *= masteryBonuses.skillDamageMultiplier;
            sim.logger.addEvent("MASTERY", `   Mastery bonus: ${(masteryBonuses.skillDamageMultiplier * 100 - 100).toFixed(0)}% damage!`);
        }
        
        const finalDamage = Math.floor(baseDamage * multiplier);

        sim.logger.addEvent("ATTACK", `   Dealing ${finalDamage} damage (Mult: ${multiplier}x).`);
        target.takeDamage(finalDamage, sim);
    }

    _executeHealSkill(source, target, meta, sim, masteryBonuses) {
        let power = meta.power || 0;
        
        // Apply mastery healing bonus (uses same damage multiplier for simplicity)
        if (masteryBonuses && masteryBonuses.skillDamageMultiplier > 1.0) {
            power = Math.floor(power * masteryBonuses.skillDamageMultiplier);
        }
        
        target.currentHealth = Math.min(target.stats.health_max, target.currentHealth + power);
        sim.logger.addEvent("HEAL", `   Healing ${target.data.name} for ${power} HP.`);
    }

    _executeBuffSkill(source, target, meta, sim, masteryBonuses) {
        let duration = meta.duration || 0;
        
        // Apply mastery duration bonus
        if (masteryBonuses && masteryBonuses.effectDurationMultiplier > 1.0) {
            duration = Math.floor(duration * masteryBonuses.effectDurationMultiplier);
            sim.logger.addEvent("MASTERY", `   Mastery bonus: +${((masteryBonuses.effectDurationMultiplier - 1) * 100).toFixed(0)}% duration!`);
        }
        
        sim.logger.addEvent("BUFF", `   Applying buff: ${meta.statKey} +${meta.statValue} (${duration} turns)`);
    }
}

module.exports = new SkillExecutor();
