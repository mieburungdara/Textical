const _ = require('lodash');

class BattleLogger {
    constructor() {
        this.ticks = [];
        this.currentTick = null;
        this.lastUnitStates = {}; // Track state per unit ID
        this.metadata = {};
    }

    setMetadata(data) {
        this.metadata = data;
    }

    startTick(tickNumber) {
        this.currentTick = {
            tick: tickNumber,
            events: [],
            units: []
        };
    }

    addEvent(type, msg, data = {}, isInternal = false) {
        if (!this.currentTick) return;
        
        // AAA: Mark AI Trace as internal/debug-only
        const isDebugTrace = msg && msg.includes("[AI_TRACE]");

        this.currentTick.events.push({
            type, // MOVE, ATTACK, HEAL, TRAIT, AI, STATUS
            msg,
            data,
            isInternal: isInternal || isDebugTrace
        });
    }

    commitTick(units) {
        if (!this.currentTick) return;
        
        const changedUnits = [];
        const tickNum = this.currentTick.tick;

        units.forEach(u => {
            // AAA: Ignore dead units during logging to prevent 'Ghost' collisions
            if (u.isDead) return;

            const currentState = {
                id: u.instanceId,
                team: u.teamId, 
                pos: { x: u.gridPos.x, y: u.gridPos.y },
                hp: Math.round(u.currentHealth),
                mp: Math.round(u.currentMana),
                nextAction: u.nextActionTick 
            };

            const lastState = this.lastUnitStates[u.instanceId];

            // AAA: Strict Change Detection
            const hasMoved = !lastState || lastState.pos.x !== currentState.pos.x || lastState.pos.y !== currentState.pos.y;
            const hasStatusChange = !lastState || lastState.hp !== currentState.hp || lastState.mp !== currentState.mp;
            
            // Periodically sync all units every 500 ticks as a safety net
            const isMilestone = tickNum % 500 === 0;

            if (hasMoved || hasStatusChange || isMilestone) {
                changedUnits.push(currentState);
                this.lastUnitStates[u.instanceId] = currentState;
            }
        });

        this.currentTick.units = changedUnits;

        // AAA: Sparse Logging - Only save if something actually HAPPENED
        const hasEvents = this.currentTick.events.length > 0;
        const hasImportantChanges = changedUnits.length > 0;
        const isStartOrEnd = tickNum === 0;

        if (hasEvents || hasImportantChanges || isStartOrEnd) {
            this.ticks.push(this.currentTick);
        }
        
        this.currentTick = null;
    }

    getReplayData(debug = false) {
        const processedTicks = this.ticks.map(tick => {
            // Filter events based on debug flag
            const filteredEvents = debug 
                ? tick.events 
                : tick.events.filter(e => !e.isInternal);

            return {
                ...tick,
                events: filteredEvents
            };
        }).filter(tick => tick.events.length > 0 || tick.units.length > 0 || tick.tick === 0);

        return {
            metadata: {
                ...this.metadata,
                is_debug_file: debug,
                generated_at: new Date().toISOString()
            },
            ticks: processedTicks
        };
    }

    getLogs() {
        return this.ticks;
    }
}

module.exports = BattleLogger;