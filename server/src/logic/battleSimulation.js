const BattleUnit = require('./battleUnit');
const CombatRules = require('./combatRules');
const EasyStar = require('easystarjs');

class BattleSimulation {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.units = [];
        this.terrainGrid = Array(height).fill().map(() => Array(width).fill(0));
        this.unitGrid = Array(height).fill().map(() => Array(width).fill(null));
        this.currentTick = 0;
        this.logs = [];
        this.isFinished = false;
        this.winnerTeam = -1;
        this.MAX_TICKS = 1500;
        this.killedMonsterIds = [];
        this.rewards = { gold: 0, exp: 0 };

        this.easystar = new EasyStar.js();
        this.easystar.setGrid(this.terrainGrid);
        this.easystar.setAcceptableTiles([0, 1, 2, 3]);
        this.easystar.enableDiagonals();
    }

    addUnit(data, teamId, pos, stats) {
        const safeX = Math.max(0, Math.min(this.width - 1, pos.x));
        const safeY = Math.max(0, Math.min(this.height - 1, pos.y));
        const unit = new BattleUnit(data, teamId, {x: safeX, y: safeY}, stats);
        this.units.push(unit);
        this.unitGrid[safeY][safeX] = unit;
        return unit;
    }

    run() {
        this.log("GAME_START", "Authoritative Master Engine Active!");
        while (!this.isFinished && this.currentTick < this.MAX_TICKS) {
            this.processTick();
        }
        return { winner: this.winnerTeam, logs: this.logs, killed_monsters: this.killedMonsterIds, rewards: this.rewards };
    }

    processTick() {
        this.currentTick++;
        this.easystar.removeAllAdditionalPoints();
        this.units.forEach(u => { if (!u.isDead) this.easystar.avoidAdditionalPoint(u.gridPos.x, u.gridPos.y); });
        
        this.units.forEach(u => { 
            if (!u.isDead) {
                u.tick(1.0);
                const dot = u.applyStatusDamage();
                if (dot > 0) this.log("VFX", `${u.data.name} suffers status damage`, { actor_id: u.instanceId, vfx: "burn" });
            }
        });

        const readyUnits = this.units
            .filter(u => !u.isDead && u.isReady())
            .sort((a, b) => b.currentActionPoints - a.currentActionPoints);

        for (let actor of readyUnits) {
            // DYING BREATH FIX: A unit can act if ready even if HP is 0,
            // provided resolveDeaths hasn't removed them yet.
            // We only skip if isDead was ALREADY set in a PREVIOUS tick batch.
            if (actor.isDead) continue; 
            
            this.decideAction(actor);
            actor.currentActionPoints -= 100.0;
            actor.applyRegen();
            this.log("WAIT", `${actor.data.name} turn end`, { actor_id: actor.instanceId });
            if (this.checkWinCondition()) return;
        }
        this.resolveDeaths();
    }

    decideAction(actor) {
        for (let skillId in actor.skillCooldowns) { if (actor.skillCooldowns[skillId] > 0) actor.skillCooldowns[skillId]--; }
        const target = this.findTarget(actor);
        if (!target) return;

        const dist = this.getDistance(actor.gridPos, target.gridPos);
        const hpPercent = actor.currentHealth / actor.stats.health_max;

        if (hpPercent < (actor.data.flee_threshold || 0)) {
            if (this.executeFlee(actor, target)) return;
        }

        const usableSkill = this.getBestUsableSkill(actor, dist);
        if (usableSkill) {
            this.performSkill(actor, usableSkill, target.gridPos);
            return;
        }

        const attackRange = actor.stats.attack_range || 1;
        const preferredRange = actor.data.preferred_range || 1;

        if (dist <= attackRange) {
            if (dist < preferredRange) {
                if (!this.executeFlee(actor, target)) {
                    this.performAttack(actor, target);
                }
            } else {
                this.performAttack(actor, target);
            }
        } else {
            this.moveTowards(actor, target);
        }
    }

    performSkill(actor, skill, targetPos) {
        actor.consumeMana(skill.mana_cost || 0);
        actor.skillCooldowns[skill.id] = skill.cooldown || 3;
        const affectedTiles = this.getTilesInPattern(targetPos, skill.aoe_pattern, skill.aoe_size);
        const hitIds = [];
        const individualHits = {};

        affectedTiles.forEach(tile => {
            const victim = this.unitGrid[tile.y][tile.x];
            if (victim && victim.teamId !== actor.teamId) {
                const result = CombatRules.calculateDamage(actor, victim, skill.damage_multiplier || 1.0);
                victim.takeDamage(result.damage);
                hitIds.push(victim.instanceId);
                individualHits[victim.instanceId] = result.damage;
                if (result.effect) victim.activeEffects.push({ type: result.effect, duration: 3 });
            }
        });

        this.log("CAST_SKILL", `${actor.data.name} cast ${skill.name}`, {
            actor_id: actor.instanceId,
            target_pos: targetPos,
            skill_name: skill.name,
            result: { hit_ids: hitIds, individual_hits: individualHits }
        });
    }

    getBestUsableSkill(actor, dist) {
        if (!actor.data.skills) return null;
        return actor.data.skills.find(s => dist <= s.range && (actor.skillCooldowns[s.id] || 0) === 0 && actor.canAfford(s.mana_cost || 0));
    }

    performAttack(attacker, defender) {
        const result = CombatRules.calculateDamage(attacker, defender);
        defender.takeDamage(result.damage);
        if (result.effect) defender.activeEffects.push({ type: result.effect, duration: 3 });

        this.log("ATTACK", `${attacker.data.name} hit ${defender.data.name}`, {
            actor_id: attacker.instanceId,
            target_id: defender.instanceId,
            damage: result.damage,
            is_hit: result.isHit,
            is_crit: result.isCrit,
            target_hp_left: defender.currentHealth
        });
    }

    moveTowards(actor, target) {
        this.easystar.stopAvoidingAdditionalPoint(actor.gridPos.x, actor.gridPos.y);
        let nextStep = null;
        this.easystar.findPath(actor.gridPos.x, actor.gridPos.y, target.gridPos.x, target.gridPos.y, (p) => { if (p && p.length > 1) nextStep = { x: p[1].x, y: p[1].y }; });
        this.easystar.calculate();
        if (nextStep && !this.unitGrid[nextStep.y][nextStep.x]) {
            this.unitGrid[actor.gridPos.y][actor.gridPos.x] = null;
            actor.gridPos = nextStep;
            this.unitGrid[nextStep.y][nextStep.x] = actor;
            this.log("MOVE", `${actor.data.name} moved`, { actor_id: actor.instanceId, from: actor.gridPos, to: nextStep });
        }
        this.easystar.avoidAdditionalPoint(actor.gridPos.x, actor.gridPos.y);
    }

    executeFlee(actor, enemy) {
        const neighbors = [{x:0,y:1},{x:0,y:-1},{x:1,y:0},{x:-1,y:0},{x:1,y:1},{x:-1,y:-1},{x:1,y:-1},{x:-1,y:1}];
        let bestTile = null;
        let maxDist = -1;
        neighbors.forEach(n => {
            const p = { x: actor.gridPos.x + n.x, y: actor.gridPos.y + n.y };
            if (p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height && !this.unitGrid[p.y][p.x]) {
                const d = this.getDistance(p, enemy.gridPos);
                if (d > maxDist) { maxDist = d; bestTile = p; }
            }
        });
        if (bestTile) {
            this.unitGrid[actor.gridPos.y][actor.gridPos.x] = null;
            actor.gridPos = bestTile;
            this.unitGrid[bestTile.y][bestTile.x] = actor;
            this.log("MOVE", `${actor.data.name} repositioned`, { actor_id: actor.instanceId, to: bestTile });
            return true;
        }
        return false;
    }

    findTarget(actor) {
        const enemies = this.units.filter(u => !u.isDead && u.teamId !== actor.teamId);
        if (enemies.length === 0) return null;
        const priority = actor.data.target_priority ?? 0;
        switch (priority) {
            case 1: return enemies.sort((a, b) => this.getDistance(actor.gridPos, b.gridPos) - this.getDistance(actor.gridPos, a.gridPos))[0];
            case 2: return enemies.sort((a, b) => a.currentHealth - b.currentHealth)[0];
            case 3: return enemies.sort((a, b) => b.currentHealth - a.currentHealth)[0];
            default: return enemies.sort((a, b) => this.getDistance(actor.gridPos, a.gridPos) - this.getDistance(actor.gridPos, b.gridPos))[0];
        }
    }

    getTilesInPattern(center, pattern, size) {
        const tiles = [center];
        if (pattern === "SQUARE") {
            for (let x = -size; x <= size; x++) {
                for (let y = -size; y <= size; y++) {
                    if (x === 0 && y === 0) continue;
                    const p = { x: center.x + x, y: center.y + y };
                    if (p.x >= 0 && p.x < this.width && p.y >= 0 && p.y < this.height) tiles.push(p);
                }
            }
        }
        return tiles;
    }

    getDistance(p1, p2) { return Math.max(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y)); }

    resolveDeaths() {
        this.units.forEach(u => {
            if (!u.isDead && u.currentHealth <= 0) {
                u.isDead = true;
                this.unitGrid[u.gridPos.y][u.gridPos.x] = null;
                if (u.teamId === 1) this.killedMonsterIds.push(u.data.id);
                this.rewards.gold += 15;
                this.rewards.exp += (u.data.exp_reward || 10);
                this.log("DEATH", `${u.data.name} died`, { target_id: u.instanceId });
            }
        });
    }

    checkWinCondition() {
        const teamsAlive = new Set(this.units.filter(u => !u.isDead).map(u => u.teamId));
        if (teamsAlive.size <= 1) {
            this.isFinished = true;
            this.winnerTeam = Array.from(teamsAlive)[0] ?? -1;
            this.log("GAME_OVER", `Battle Finished`, { winner: this.winnerTeam });
            return true;
        }
        return false;
    }

    log(type, msg, data = {}) {
        const states = {};
        this.units.forEach(u => {
            states[u.instanceId] = { hp: u.currentHealth, mana: u.currentMana, ap: u.currentActionPoints, pos: u.gridPos };
        });
        this.logs.push({ tick: this.currentTick, type: type, message: msg, data: data, unit_states: states });
    }
}

module.exports = BattleSimulation;
