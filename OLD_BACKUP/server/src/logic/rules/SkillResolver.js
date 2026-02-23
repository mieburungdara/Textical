const traitService = require('../../services/traitService');
const CombatRules = require('../combatRules');

/**
 * SkillResolver
 * Dynamically handles specialized skill logic.
 */
class SkillResolver {
    constructor(sim) {
        this.sim = sim;
        this.specialHandlers = {
            "Shadow Flicker": this._handleShadowFlicker.bind(this),
            "Gravity Anchor": this._handleGravityAnchor.bind(this),
            "Blood Link": this._handleBloodLink.bind(this),
            "Chain Overload": this._handleChainOverload.bind(this)
        };
    }

    resolve(actor, skill, targetPos) {
        // 1. Check for specialized logic first
        if (this.specialHandlers[skill.name]) {
            const consumed = this.specialHandlers[skill.name](actor, skill, targetPos);
            if (consumed) return; // Specialized skill took total control
        }

        // 2. Standard AOE / Single Target Logic
        const tiles = this.sim.grid.getTilesInPattern(targetPos, skill.aoe_pattern || "SQUARE", skill.aoe_size || 0);
        tiles.forEach(tile => {
            const victim = this.sim.grid.unitGrid[tile.y]?.[tile.x];
            if (!victim || victim.isDead) return;

            const isBeneficial = (skill.type === "SUPPORT" || skill.type === "HEAL");
            const isTargetEnemy = victim.teamId !== actor.teamId;

            if ((isBeneficial && !isTargetEnemy) || (!isBeneficial && isTargetEnemy)) {
                this._applySkillToVictim(actor, victim, skill, tile);
            }
        });
    }

    _applySkillToVictim(actor, victim, skill, tile) {
        const atkMods = traitService.executeHook("onPreAttack", actor, victim, this.sim, skill) || {};
        const defMods = traitService.executeHook("onPreDefend", victim, actor, this.sim, skill) || {};

        let synergyMult = 1.0;
        // Logic specific to Chain Overload can still use helper checks
        if (skill.name === "Chain Overload") {
            const isWet = victim.activeEffects.some(e => e.type === "WET") || this.sim.grid.terrainGrid[tile.y][tile.x] === 2;
            if (isWet) synergyMult = 2.0;
        }

        const dmgMult = (skill.damage_multiplier || 1.0) * (atkMods.dmgMult || 1.0) * synergyMult;
        const result = CombatRules.calculateDamage(actor, victim, dmgMult, skill.element || 0);
        
        const impactMods = traitService.executeHook("onTakeDamage", victim, actor, result.damage, this.sim, skill) || {};
        const finalVal = impactMods.finalDamage !== undefined ? impactMods.finalDamage : result.damage;
        
        if (skill.type === "HEAL" || skill.type === "SUPPORT") {
            victim.currentHealth = Math.min(victim.stats.health_max, victim.currentHealth + finalVal);
            traitService.executeHook("onHealthRegen", victim, finalVal, this.sim);
        } else {
            victim.takeDamage(finalVal, this.sim); // ADDED this.sim
            this.sim.rules._broadcastAllyEvent("onAllyDamage", victim, finalVal);
            traitService.executeHook("onPostHit", victim, actor, finalVal, this.sim, skill);
        }
        
        traitService.executeHook("onPostAttack", actor, victim, finalVal, this.sim, skill);
        if (skill.status_effect) victim.applyEffect({ ...skill.status_effect }, this.sim);
    }

    _handleShadowFlicker(actor, skill, targetPos) {
        if (!this.sim.grid.isTileOccupied(targetPos.x, targetPos.y)) {
            this.sim.rules._broadcastAdjacencyLost(actor);
            this.sim.grid.unitGrid[actor.gridPos.y][actor.gridPos.x] = null;
            actor.gridPos = { ...targetPos };
            this.sim.grid.unitGrid[actor.gridPos.y][actor.gridPos.x] = actor;
            this.sim.rules._broadcastAdjacencyGained(actor);
            const Stealth = require('../status/definitions/Stealth');
            actor.applyEffect(new Stealth(2), this.sim);
            return true;
        }
        return false;
    }

    _handleGravityAnchor(actor, skill, targetPos) {
        const tiles = this.sim.grid.getTilesInPattern(targetPos, "SQUARE", 1);
        tiles.forEach(t => {
            const v = this.sim.grid.unitGrid[t.y]?.[t.x];
            if (v && v.teamId !== actor.teamId) {
                v.setActionDelay(40, this.sim);
                const Leaden = require('../status/definitions/Leaden');
                v.applyEffect(new Leaden(3), this.sim);
            }
        });
        return false; // Let standard damage logic run if needed
    }

    _handleBloodLink(actor, skill, targetPos) {
        const target = this.sim.grid.unitGrid[targetPos.y]?.[targetPos.x];
        if (target && target.teamId === actor.teamId) {
            const Linked = require('../status/definitions/Linked');
            target.applyEffect(new Linked(3, actor.instanceId), this.sim);
        }
        return true;
    }

    _handleChainOverload(actor, skill, targetPos) {
        return false; // Managed inside standard AOE loop via synergy check
    }
}

module.exports = SkillResolver;
