class BattleUnit {
    constructor(data, teamId, pos, stats) {
        this.data = data; 
        this.instanceId = data.instance_id;
        this.stats = stats; 
        this.teamId = teamId;
        this.gridPos = pos;
        
        this.currentHealth = stats.health_max;
        this.currentMana = stats.mana_max;
        this.currentActionPoints = 0.0;
        this.isDead = false;
        
        this.skillCooldowns = {};
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
        // Use dynamic stats instead of hardcoded 5% (Restored Logic)
        const hpRegen = this.stats.hp_regen || 0;
        const manaRegen = this.stats.mana_regen || 2;
        
        this.currentHealth = Math.min(this.stats.health_max, this.currentHealth + hpRegen);
        this.currentMana = Math.min(this.stats.mana_max, this.currentMana + manaRegen);
    }
}

module.exports = BattleUnit;
