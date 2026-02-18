const CombatRules = require('./combatRules');
const traitService = require('../services/traitService'); 
const TacticalSensor = require('./rules/TacticalSensor');
const SkillResolver = require('./rules/SkillResolver');
const DeathResolver = require('./rules/DeathResolver');
const skillExecutor = require('./rules/skillExecutor');
const CombatFormulaResolver = require('./rules/CombatFormulaResolver');
const CombatEventBroadcaster = require('./rules/CombatEventBroadcaster');
const MovementResolver = require('./rules/MovementResolver');
const skillMasteryService = require('../services/skill/SkillMasteryService');

/**
 * BattleRules (v4.5 - SRP Optimized)
 * Delegates combat phases and calculations to specialized sub-systems.
 */
class BattleRules {
    constructor(sim) {
        this.sim = sim;
        // Composition Pattern
        this.sensor = new TacticalSensor(sim);
        this.skills = new SkillResolver(sim);
        this.death = new DeathResolver(sim);
    }

    performAttack(attacker, defender, isReaction = false) {
        if (!isReaction && traitService.executeHook("onPreAction", attacker, this.sim) === false) return;
        attacker.reveal(this.sim);

        // AAA: Final Range Safeguard - Double check distance at moment of impact
        const actualDist = this.sim.grid.getDistance(attacker.gridPos, defender.gridPos);
        const baseRange = attacker.getStat("attack_range") || 1;
        const maxRange = baseRange > 1 ? baseRange : 1.5; 
        
        if (actualDist > (maxRange + 0.2)) {
            this.sim.logger.addEvent("ENGINE", `[ATTACK_CANCEL] ${attacker.data.name} target out of range (${actualDist.toFixed(1)} > ${maxRange}).`, { actorId: attacker.instanceId });
            return;
        }

        // 1. Tactical Sensing (Directional & Cover)
        const relPos = this.sensor.getRelativePosition(attacker, defender); 
        const hasCover = this.sensor.checkCover(attacker, defender);
        
        let directionalDmgMult = 1.0;
        let directionalAccBonus = 0;
        let directionalCritBonus = 0;
        let bypassBlock = false;
        
        switch (relPos) {
            case "BACK":
                directionalDmgMult = 1.5;
                directionalAccBonus = 20;
                directionalCritBonus = 0.25; 
                bypassBlock = true;
                break;
            case "SIDE":
                directionalDmgMult = 1.1;
                directionalAccBonus = 5;
                directionalCritBonus = 0.10;
                break;
            case "FRONT":
            default:
                directionalDmgMult = 1.0;
                directionalAccBonus = 0;
                directionalCritBonus = 0;
                bypassBlock = false;
        }
        
        let coverDefBonus = hasCover ? 15 : 0;

        if (!defender.isReady || defender.isReady()) {
            defender.facing = this.sensor.getDirection(defender.gridPos, attacker.gridPos);
        }

        // 2. Micro-Phases
        const atkMods = traitService.executeHook("onPreAttack", attacker, defender, this.sim) || {};
        const defMods = traitService.executeHook("onPreDefend", defender, attacker, this.sim) || {};

        if (atkMods.cancelAction || defMods.cancelAction) return;

        attacker.recordDurabilityLoss("MAIN_HAND");

        // 3. Accuracy & Dodge Calculation (Delegated)
        const hitChance = CombatFormulaResolver.calculateHitChance(attacker, defender, directionalAccBonus);
        const roll = Math.random() * 100;
        
        if (roll > hitChance) {
            traitService.executeHook("onDodge", defender, attacker, this.sim);
            this.sim.logger.addEvent("MISS", `${defender.data.name} dodged!`, { 
                targetId: defender.instanceId,
                hitChance: hitChance,
                roll: roll.toFixed(2),
                isReaction
            });
            return;
        }

        // 4. Block/Parry Logic (Delegated)
        const blockResult = CombatFormulaResolver.calculateBlockParry(defender, attacker, bypassBlock, this.sim);
        
        if (blockResult.parried) {
            this.sim.logger.addEvent("PARRY", `${defender.data.name} parried!`, { 
                actorId: defender.instanceId,
                targetId: attacker.instanceId,
                isReaction
            });
            return; 
        }

        // 5. Critical Hit Calculation (Delegated)
        const critResult = CombatFormulaResolver.calculateCriticalHit(attacker, defender, directionalCritBonus);

        // 6. Damage Calculation
        const finalDmgMult = (atkMods.dmgMult || 1.0) * directionalDmgMult * 
                           blockResult.damageMult * (critResult.isCritical ? critResult.damageMult : 1.0);
        
        let result = CombatRules.calculateDamage(attacker, defender, finalDmgMult, 0, this.sim);
        
        if (critResult.isCritical) {
            result.isCrit = true;
            traitService.executeHook("onCrit", attacker, defender, result.damage, this.sim);
        }

        // 7. Mitigation & Hit Hooks
        const impactMods = traitService.executeHook("onTakeDamage", defender, attacker, result.damage, this.sim) || {};
        const finalDamage = Math.floor(Math.max(1, (impactMods.finalDamage !== undefined ? impactMods.finalDamage : result.damage) - coverDefBonus));

        defender.takeDamage(finalDamage, this.sim);
        
        defender.recordDurabilityLoss("CHEST");
        defender.recordDurabilityLoss("LEGS");
        defender.recordDurabilityLoss("HEAD");
        defender.recordDurabilityLoss("ACCESSORY");

        CombatEventBroadcaster.broadcastAllyEvent(this.sim, "onAllyDamage", defender, finalDamage);
        this.sim.unitDeeds[attacker.instanceId] = (this.sim.unitDeeds[attacker.instanceId] || 0) + finalDamage;

        traitService.executeHook("onPostHit", defender, attacker, finalDamage, this.sim);
        traitService.executeHook("onPostAttack", attacker, defender, finalDamage, this.sim);
        traitService.executeHook("onLifesteal", attacker, finalDamage, this.sim);

        // 8. Knockback / Impact (Delegated)
        MovementResolver.handleKnockback(this.sim, this.sensor, attacker, defender);

        this.sim.logger.addEvent("ATTACK", `${attacker.data.name} hit ${defender.data.name}`, {
            actorId: attacker.instanceId,
            targetId: defender.instanceId,
            actorPos: { x: attacker.gridPos.x, y: attacker.gridPos.y },
            targetPos: { x: defender.gridPos.x, y: defender.gridPos.y }, 
            damage: finalDamage,
            relPos: relPos,
            isCrit: critResult.isCritical,
            isBlocked: blockResult.blocked,
            hitChance: hitChance,
            isReaction,
            nextAction: attacker.nextActionTick,
            range: attacker.getStat("attack_range") || 1.5
        });

        if (defender.currentHealth <= 0) {
            traitService.executeHook("onKill", attacker, defender, this.sim);
            CombatEventBroadcaster.broadcastAllyEvent(this.sim, "onAllyKill", attacker, defender);
        }
        if (!isReaction) traitService.executeHook("onPostAction", attacker, this.sim);
    }

    async performSkill(actor, skill, targetPos) {
        actor.recordDurabilityLoss("MAIN_HAND");
        const target = this.sim.grid.unitGrid[targetPos.y]?.[targetPos.x];
        
        if (skill.cooldown) {
            actor.setSkillCooldown(skill.id, skill.cooldown, this.sim);
        }

        // Record skill usage for mastery tracking (after skill resolves)
        // We'll call this asynchronously to not block combat
        this._recordSkillMastery(actor, skill).catch(err => {
            this.sim.logger.warn(`[SkillMastery] Failed to record mastery: ${err.message}`);
        });

        if (target) {
            skillExecutor.execute(actor, target, skill, this.sim);
        } else {
            this.skills.resolve(actor, skill, targetPos);
        }
    }

    /**
     * Record skill usage for mastery system
     */
    async _recordSkillMastery(actor, skill) {
        if (!actor.data.userId || !actor.data.heroId || !skill.id) {
            return; // Skip if not a hero or no skill ID
        }

        try {
            // Record usage and get result
            const result = await skillMasteryService.recordSkillUse(
                actor.data.userId,
                actor.data.heroId,
                skill.id
            );

            // Cache the bonuses on the actor for use during skill execution
            const bonuses = await skillMasteryService.getCombatBonuses(actor.data.heroId, skill.id);
            actor._skillMasteryBonuses = bonuses;

            if (result && result.leveledUp) {
                this.sim.logger.addEvent("MASTERY", 
                    `${actor.data.name}'s ${skill.name} reached ${result.newLevel}!`, 
                    { 
                        heroId: actor.data.heroId, 
                        skillId: skill.id, 
                        skillName: skill.name,
                        newLevel: result.newLevel,
                        useCount: result.useCount
                    }
                );
            }
        } catch (error) {
            // Don't let mastery errors break combat
            this.sim.logger.warn(`[SkillMastery] Error: ${error.message}`);
        }
    }

    resolveDeaths() {
        this.death.resolve();
    }

    checkWinCondition() {
        const aliveTeams = new Set(this.sim.units.filter(u => !u.isDead).map(u => u.teamId));
        if (aliveTeams.size <= 1) {
            this.sim.isFinished = true;
            this.sim.winnerTeam = Array.from(aliveTeams)[0] ?? -1;
            this.sim.units.forEach(u => traitService.executeHook("onBattleEnd", u, this.sim));
            return true;
        }
        return false;
    }
}

module.exports = BattleRules;
