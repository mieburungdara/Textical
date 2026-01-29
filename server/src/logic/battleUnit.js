const traitService = require('../services/traitService');

class BattleUnit {
    constructor(data, teamId, pos, stats) {
        this.data = data; 
        this.race = data.race || "human";
        this.behavior = data.activeBehavior || "balanced"; 
        this.instanceId = data.instance_id; 
        this.stats = stats; 
        this.teamId = teamId;
        this.gridPos = pos;
        this.facing = "SOUTH"; // NEW: Directional combat support
        
        this.currentHealth = stats.health_max;
        this.currentMana = stats.mana_max;
        this._actionPoints = stats.initiative || 0.0; // AAA: Starting AP based on Initiative
        this.isDead = false;
        
        this.skillCooldowns = {};
        this.activeEffects = []; // Now stores Status instances
        this.weaponTraits = [];
        this.traits = data.traits || [];
        this.temporaryStats = {}; 
    }

    get currentActionPoints() { return this._actionPoints; }
    set currentActionPoints(val) { this._actionPoints = val; }

    modifyAP(amount, sim) {
        const old = this._actionPoints;
        this._actionPoints += amount;
        traitService.executeHook("onActionPointsChange", this, old, this._actionPoints, sim);
    }

    tick(delta, sim) {
        if (this.isDead) return;
        this.temporaryStats = {}; // Clear transient stats
        const old = this._actionPoints;
        const effectiveSpeed = this.getStat("speed");
        this._actionPoints += effectiveSpeed * delta;
        if (Math.floor(this._actionPoints) !== Math.floor(old)) {
            traitService.executeHook("onActionPointsChange", this, old, this._actionPoints, sim);
        }
    }

    getStat(key) {
        const base = this.stats[key] || 0;
        const mod = this.temporaryStats[key] || 0;
        return Math.max(0, base + mod);
    }

    applyEffect(statusInstance, sim) {
        if (traitService.executeHook("onStatusApplied", this, statusInstance, sim) === false) return;

        const existingIdx = this.activeEffects.findIndex(e => e.type === statusInstance.type);
        if (existingIdx !== -1) {
            this.activeEffects[existingIdx] = statusInstance;
            traitService.executeHook("onStatusRefreshed", this, statusInstance, sim);
        } else {
            this.activeEffects.push(statusInstance);
            if (statusInstance.onApply) statusInstance.onApply(this, sim);
        }
    }

    removeEffect(type, sim) {
        const effect = this.activeEffects.find(e => e.type === type);
        if (effect) {
            this.activeEffects = this.activeEffects.filter(e => e.type !== type);
            if (effect.onExpire) effect.onExpire(this, sim);
            traitService.executeHook("onStatusPurged", this, effect, sim);
        }
    }

    consumeMana(amount, sim) {
        this.currentMana = Math.max(0, this.currentMana - amount);
        traitService.executeHook("onManaSpend", this, amount, sim);
    }

    gainMana(amount, sim) {
        this.currentMana = Math.min(this.stats.mana_max, this.currentMana + amount);
        traitService.executeHook("onManaGain", this, amount, sim);
    }

    takeDamage(amount) {
        this.currentHealth -= amount;
        if (this.currentHealth < 0) this.currentHealth = 0;
    }

    applyRegen(sim) {
        const regen = Math.floor(this.stats.health_max * 0.02);
        this.currentHealth = Math.min(this.stats.health_max, this.currentHealth + regen);
        if (regen > 0) traitService.executeHook("onHealthRegen", this, regen, sim);
        return regen;
    }

    isReady() { 
        if (this.activeEffects.some(e => e.type === "STUN" || e.type === "CRYSTALLIZED")) return false;
        return this._actionPoints >= 100.0; 
    }

    applyStatusDamage(sim) {
        let totalImpactCount = 0;

        this.activeEffects = this.activeEffects.filter(eff => {
            traitService.executeHook("onStatusTick", this, eff, sim);
            
            // AAA: Execute modular onTick logic
            if (eff.onTick) eff.onTick(this, sim);

            eff.duration--;

            if (eff.duration <= 0) {
                if (eff.onExpire) eff.onExpire(this, sim);
                traitService.executeHook("onStatusExpired", this, eff, sim);
                return false;
            }
            return true;
        });
        return totalImpactCount;
    }
}

module.exports = BattleUnit;