/**
 * BaseStatus
 * The blueprint for all Buffs and Debuffs.
 */
class BaseStatus {
    constructor(type, duration, power = 0) {
        this.type = type.toUpperCase();
        this.duration = duration;
        this.power = power;
    }

    onApply(unit, sim) {}
    onTick(unit, sim) {}
    onExpire(unit, sim) {}
}

module.exports = BaseStatus;
