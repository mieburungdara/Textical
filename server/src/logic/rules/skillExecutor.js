/**
 * AAA Skill Execution Engine
 * Processes skill effects and applies them to the simulation state.
 */
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

        switch (skill.type) {
            case "DAMAGE":
                this._executeDamageSkill(source, target, meta, sim);
                break;
            case "HEAL":
                this._executeHealSkill(source, target, meta, sim);
                break;
            case "BUFF":
                this._executeBuffSkill(source, target, meta, sim);
                break;
            default:
                sim.logger.addEvent("WARN", `Unknown skill type: ${skill.type}`);
        }

        // Consume resources if any
        if (meta.mana_cost) {
            source.consumeMana(meta.mana_cost, sim);
        }
    }

    _executeDamageSkill(source, target, meta, sim) {
        const multiplier = meta.multiplier || 1.0;
        const baseDamage = source.getStat("attack_damage");
        const finalDamage = Math.floor(baseDamage * multiplier);

        sim.logger.addEvent("ATTACK", `   Dealing ${finalDamage} damage (Mult: ${multiplier}x).`);
        target.takeDamage(finalDamage, sim);
    }

    _executeHealSkill(source, target, meta, sim) {
        const power = meta.power || 0;
        target.currentHealth = Math.min(target.stats.health_max, target.currentHealth + power);
        sim.logger.addEvent("HEAL", `   Healing ${target.data.name} for ${power} HP.`);
    }

    _executeBuffSkill(source, target, meta, sim) {
        sim.logger.addEvent("BUFF", `   Applying buff: ${meta.statKey} +${meta.statValue}`);
    }
}

module.exports = new SkillExecutor();
