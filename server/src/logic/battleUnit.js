class BattleUnit {
    constructor(data, teamId, pos, stats) {
        this.data = data; 
        this.race = data.race || "human"; // NEW
        this.instanceId = data.instance_id; 
        this.stats = stats; 
        this.teamId = teamId;
        this.gridPos = pos;
        
        this.currentHealth = stats.health_max;
        this.currentMana = stats.mana_max;
        this.currentActionPoints = 0.0;
        this.isDead = false;
        
        this.skillCooldowns = {};
        this.activeEffects = []; 
        this.weaponTraits = []; // Aggregated from equipment
        
        if (data.equipment) {
            Object.values(data.equipment).forEach(item => {
                if (item.data && item.data.traits) {
                    this.weaponTraits = this.weaponTraits.concat(item.data.traits);
                }
            });
        }
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
            if (eff.type === "burn" || eff.type === "poison") {
                const dmg = Math.floor(this.stats.health_max * 0.05); 
                this.takeDamage(dmg);
                totalDot += dmg;
            }
            eff.duration--;
            return eff.duration > 0;
        });
        return totalDot;
    }
}

module.exports = BattleUnit;
