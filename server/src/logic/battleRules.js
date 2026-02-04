const CombatRules = require('./combatRules');
const traitService = require('../services/traitService'); 
const TacticalSensor = require('./rules/TacticalSensor');
const SkillResolver = require('./rules/SkillResolver');
const DeathResolver = require('./rules/DeathResolver');
const skillExecutor = require('./rules/skillExecutor');

/**
 * BattleRules (v4.1 - Enhanced Combat System)
 * Delegates combat phases to specialized sub-systems.
 * Integrated with EnhancedStats for accuracy, dodge, crit, and block mechanics.
 */
class BattleRules {
    constructor(sim) {
        this.sim = sim;
        // Composition Pattern
        this.sensor = new TacticalSensor(sim);
        this.skills = new SkillResolver(sim);
        this.death = new DeathResolver(sim);
    }

    /**
     * Calculate hit chance considering accuracy vs dodge
     */
    calculateHitChance(attacker, defender, directionalBonus = 0) {
        const accuracy = attacker.getStat("accuracy") || 100;
        const dodgeChance = defender.getStat("dodge_rate") || 0;
        
        // Stealth penalty - if defender is stealthed, attacker has reduced hit chance
        let stealthPenalty = 0;
        if (defender.isStealthed) {
            const stealthLevel = defender.getStat("stealth_level") || 50;
            stealthPenalty = Math.min(30, stealthLevel / 2);
        }
        
        // Calculate final hit chance
        const baseHitChance = accuracy - dodgeChance + directionalBonus - stealthPenalty;
        
        // Apply trait hooks
        const atkMods = traitService.executeHook("onCalculateHitChance", attacker, defender) || {};
        const defMods = traitService.executeHook("onCalculateDodgeChance", defender, attacker) || {};
        
        const finalHitChance = (baseHitChance + (atkMods.hitChanceMod || 0) - (defMods.dodgeChanceMod || 0));
        
        return Math.max(5, Math.min(100, finalHitChance));
    }

    /**
     * Calculate critical hit chance and damage
     */
    calculateCriticalHit(attacker, defender, directionalBonus = 0) {
        const critChance = attacker.getStat("crit_chance") || 0.05;
        const critDamage = attacker.getStat("crit_damage") || 1.5;
        
        // Directional crit bonus
        const critChanceBonus = directionalBonus > 0 ? (directionalBonus / 400) : 0; // Back attack gives crit bonus
        
        // Apply trait hooks
        const mod = traitService.executeHook("onCalculateCrit", attacker, defender) || {};
        
        const finalCritChance = Math.min(1.0, critChance + critChanceBonus + (mod.critChanceMod || 0));
        const finalCritDamage = critDamage + (mod.critDamageMod || 0);
        
        return {
            chance: finalCritChance,
            damageMult: finalCritDamage,
            isCritical: Math.random() < finalCritChance
        };
    }

    /**
     * Calculate block/parry result
     */
    calculateBlockParry(defender, attacker, bypassBlock = false) {
        if (bypassBlock) {
            return { blocked: false, parried: false };
        }
        
        const blockChance = defender.getStat("block_chance") || 0;
        const parryChance = defender.getStat("parry_chance") || 0;
        const blockPower = defender.getStat("block_power") || 0.5;
        
        // Apply trait hooks
        const mod = traitService.executeHook("onCalculateBlock", defender, attacker) || {};
        
        const finalBlockChance = Math.min(0.75, blockChance + (mod.blockChanceMod || 0));
        const finalParryChance = Math.min(0.50, parryChance + (mod.parryChanceMod || 0));
        
        const rolled = Math.random();
        let result = { blocked: false, parried: false, damageMult: 1.0 };
        
        // Priority: Parry > Block
        if (rolled < finalParryChance) {
            result.parried = true;
            result.damageMult = 0.25; // Parry reduces damage significantly
            traitService.executeHook("onParry", defender, attacker, this.sim);
        } else if (rolled < finalBlockChance + finalParryChance) {
            result.blocked = true;
            result.damageMult = 1.0 - (blockPower + (mod.blockPowerMod || 0));
            traitService.executeHook("onBlock", defender, attacker, this.sim);
        }
        
        return result;
    }

    performAttack(attacker, defender) {
        if (traitService.executeHook("onPreAction", attacker, this.sim) === false) return;
        attacker.reveal(this.sim);

        // 1. Tactical Sensing (Directional & Cover)
        const relPos = this.sensor.getRelativePosition(attacker, defender); 
        const hasCover = this.sensor.checkCover(attacker, defender);
        
        // Directional bonuses
        let directionalDmgMult = 1.0;
        let directionalAccBonus = 0;
        let directionalCritBonus = 0;
        let bypassBlock = false;
        
        switch (relPos) {
            case "BACK":
                directionalDmgMult = 1.5;
                directionalAccBonus = 20;
                directionalCritBonus = 0.25; // +25% crit chance from back
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

        // Auto-face toward attacker
        if (!defender.isReady || defender.isReady()) {
            defender.facing = this.sensor.getDirection(defender.gridPos, attacker.gridPos);
        }

        // 2. Micro-Phases
        const atkMods = traitService.executeHook("onPreAttack", attacker, defender, this.sim) || {};
        const defMods = traitService.executeHook("onPreDefend", defender, attacker, this.sim) || {};

        if (atkMods.cancelAction || defMods.cancelAction) return;

        // Weapon Durability Loss
        attacker.recordDurabilityLoss("MAIN_HAND");

        // 3. Accuracy & Dodge Calculation
        const hitChance = this.calculateHitChance(attacker, defender, directionalAccBonus);
        const roll = Math.random() * 100;
        
        if (roll > hitChance) {
            traitService.executeHook("onDodge", defender, attacker, this.sim);
            this.sim.logger.addEvent("MISS", `${defender.data.name} dodged!`, { 
                target_id: defender.instanceId,
                hit_chance: hitChance,
                roll: roll.toFixed(2)
            });
            return;
        }

        // 4. Block/Parry Logic
        const blockResult = this.calculateBlockParry(defender, attacker, bypassBlock);
        
        if (blockResult.parried) {
            this.sim.logger.addEvent("PARRY", `${defender.data.name} parried!`, { 
                actor_id: defender.instanceId,
                target_id: attacker.instanceId
            });
            return; // Parry ends the attack
        }

        // 5. Critical Hit Calculation
        const critResult = this.calculateCriticalHit(attacker, defender, directionalCritBonus);

        // 6. Damage Calculation
        const aTerrain = this.sim.grid.terrainGrid[attacker.gridPos.y][attacker.gridPos.x];
        const dTerrain = this.sim.grid.terrainGrid[defender.gridPos.y][defender.gridPos.x];
        const finalDmgMult = (atkMods.dmgMult || 1.0) * directionalDmgMult * 
                           blockResult.damageMult * (critResult.isCritical ? critResult.damageMult : 1.0);
        
        // Use consistent damage calculation with elemental support and debugging
        let result = CombatRules.calculateDamage(attacker, defender, finalDmgMult, 0, this.sim);
        
        if (critResult.isCritical) {
            result.isCrit = true;
            traitService.executeHook("onCrit", attacker, defender, result.damage, this.sim);
        }

        // 7. Mitigation & Hit Hooks
        const impactMods = traitService.executeHook("onTakeDamage", defender, attacker, result.damage, this.sim) || {};
        const finalDamage = Math.max(1, (impactMods.finalDamage !== undefined ? impactMods.finalDamage : result.damage) - coverDefBonus);

        defender.takeDamage(finalDamage, this.sim);
        
        // Armor Durability Loss
        defender.recordDurabilityLoss("CHEST");
        defender.recordDurabilityLoss("LEGS");
        defender.recordDurabilityLoss("HEAD");
        defender.recordDurabilityLoss("ACCESSORY");

        this._broadcastAllyEvent("onAllyDamage", defender, finalDamage);
        this.sim.unitDeeds[attacker.instanceId] = (this.sim.unitDeeds[attacker.instanceId] || 0) + finalDamage;

        traitService.executeHook("onPostHit", defender, attacker, finalDamage, this.sim);
        traitService.executeHook("onPostAttack", attacker, defender, finalDamage, this.sim);
        traitService.executeHook("onLifesteal", attacker, finalDamage, this.sim);

        // 8. Knockback / Impact
        this._handleKnockback(attacker, defender);

        // Log with combat details
        this.sim.logger.addEvent("ATTACK", `${attacker.data.name} hit ${defender.data.name}`, {
            actor_id: attacker.instanceId,
            target_id: defender.instanceId,
            damage: finalDamage,
            rel_pos: relPos,
            is_crit: critResult.isCritical,
            is_blocked: blockResult.blocked,
            hit_chance: hitChance
        });

        if (defender.currentHealth <= 0) {
            traitService.executeHook("onKill", attacker, defender, this.sim);
            this._broadcastAllyEvent("onAllyKill", attacker, defender);
        }
        traitService.executeHook("onPostAction", attacker, this.sim);
    }

    _handleKnockback(attacker, defender) {
        if (Math.random() >= 0.15 || defender.isDead) return;
        
        const attackDir = this.sensor.getDirection(attacker.gridPos, defender.gridPos);
        const dx = (attackDir === "EAST") ? 1 : (attackDir === "WEST" ? -1 : 0);
        const dy = (attackDir === "SOUTH") ? 1 : (attackDir === "NORTH" ? -1 : 0);
        const nextX = defender.gridPos.x + dx;
        const nextY = defender.gridPos.y + dy;

        if (nextX >= 0 && nextX < this.sim.width && nextY >= 0 && nextY < this.sim.height && !this.sim.grid.isTileOccupied(nextX, nextY)) {
            this._broadcastAdjacencyLost(defender);
            this.sim.grid.unitGrid[defender.gridPos.y][defender.gridPos.x] = null;
            defender.gridPos = { x: nextX, y: nextY };
            this.sim.grid.unitGrid[nextY][nextX] = defender;
            this._broadcastAdjacencyGained(defender);
        } else {
            const obstacle = this.sim.grid.unitGrid[nextY]?.[nextX] || "WALL";
            traitService.executeHook("onObstacleImpact", defender, obstacle, this.sim);
        }
    }

    _broadcastAllyEvent(hookName, actor, ...args) {
        const units = this.sim.units || [];
        const allies = units.filter(u => u && u.teamId === actor.teamId && !u.isDead && u.instanceId !== actor.instanceId);
        allies.forEach(ally => traitService.executeHook(hookName, ally, this.sim, actor, ...args));
    }

    _broadcastAdjacencyLost(unit) {
        const neighbors = this.sim.grid.getNeighbors(unit.gridPos);
        neighbors.forEach(pos => {
            const neighbor = this.sim.grid.unitGrid[pos.y]?.[pos.x];
            if (neighbor) {
                traitService.executeHook("onAdjacencyLost", unit, neighbor, this.sim);
                traitService.executeHook("onAdjacencyLost", neighbor, unit, this.sim);
            }
        });
    }

    _broadcastAdjacencyGained(unit) {
        const neighbors = this.sim.grid.getNeighbors(unit.gridPos);
        neighbors.forEach(pos => {
            const neighbor = this.sim.grid.unitGrid[pos.y]?.[pos.x];
            if (neighbor && !neighbor.isDead) {
                traitService.executeHook("onAdjacencyGained", unit, neighbor, this.sim);
                traitService.executeHook("onAdjacencyGained", neighbor, unit, this.sim);
            }
        });
    }

    performSkill(actor, skill, targetPos) {
        // AAA: Weapon Durability Loss (1 point per skill use)
        actor.recordDurabilityLoss("MAIN_HAND");

        const target = this.sim.grid.unitGrid[targetPos.y]?.[targetPos.x];
        
        if (target) {
            skillExecutor.execute(actor, target, skill, this.sim);
        } else {
            this.skills.resolve(actor, skill, targetPos);
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

module.exports = BattleRules;module.exports = BattleRules;
