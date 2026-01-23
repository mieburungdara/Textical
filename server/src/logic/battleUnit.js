class BattleUnit {
    constructor(data, teamId, pos, stats) {
        this.data = data; 
        this.instanceId = data.instance_id; 
        this.stats = stats; 
        this.teamId = teamId;
        this.gridPos = pos;
        this.traits = data.traits || []; // RESTORED: Inherit traits from gear
        
        this.currentHealth = stats.health_max;
        this.currentMana = stats.mana_max;
        this.currentActionPoints = 0.0;
        this.isDead = false;
        
        this.skillCooldowns = {};
        this.activeEffects = []; // { type: "burn", duration: 3 }
    }

    tick(delta) {
        if (this.isDead) return;
        this.currentActionPoints += this.stats.speed * delta;
    }

    isReady() { return this.currentActionPoints >= 100.0; }
    canAfford(manaCost) { return this.currentMana >= manaCost; }
    consumeMana(amount) { this.currentMana = Math.max(0, this.currentMana - amount); }
    takeDamage(amount) { this.currentHealth = Math.max(0, this.currentHealth - amount); }

    applyRegen() {
        const hpRegen = this.stats.hp_regen || 0;
        const manaRegen = this.stats.mana_regen || 2;
        this.currentHealth = Math.min(this.stats.health_max, this.currentHealth + hpRegen);
        this.currentMana = Math.min(this.stats.mana_max, this.currentMana + manaRegen);
    }

    applyStatusDamage() {
        let totalDot = 0;
        this.activeEffects = this.activeEffects.filter(eff => {
            if (eff.type === "burn" || eff.type === "poison") totalDot += 5;
            eff.duration--;
            return eff.duration > 0;
        });
        if (totalDot > 0) this.takeDamage(totalDot);
        return totalDot;
    }
}

module.exports = BattleUnit;