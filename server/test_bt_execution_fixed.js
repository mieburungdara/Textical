const btManager = require('./src/logic/bt/BTManager');

console.log('=== BTManager Execution Test ===');

// Create dummy unit and simulation
const testUnit = {
    instanceId: 'test-unit-1',
    name: 'Test Warrior',
    x: 5,
    y: 5,
    gridPos: { x: 5, y: 5 },
    hp: 100,
    maxHp: 100,
    currentHealth: 100,
    mp: 50,
    maxMp: 50,
    stats: { atk: 10, def: 5, spd: 3 },
    skills: [],
    statusEffects: [],
    teamId: 1,
    data: {
        name: 'Test Warrior'
    }
};

const testTarget = {
    instanceId: 'test-target-1',
    name: 'Test Target',
    x: 8,
    y: 8,
    gridPos: { x: 8, y: 8 },
    hp: 100,
    maxHp: 100,
    currentHealth: 100,
    teamId: 2,
    data: {
        name: 'Test Target'
    }
};

const testSim = {
    units: [testUnit, testTarget],
    logger: {
        addEvent: (category, message) => {
            console.log(`[${category}] ${message}`);
        }
    },
    grid: {
        getDistance: (pos1, pos2) => {
            const dx = Math.abs(pos1.x - pos2.x);
            const dy = Math.abs(pos1.y - pos2.y);
            return Math.max(dx, dy); // Chebyshev distance
        },
        getCellAt: () => ({ terrain: 0 }),
        width: 10,
        height: 10
    },
    ai: {
        findTarget: (unit) => {
            console.log(`AI: Finding target for ${unit.data.name}`);
            return testTarget;
        },
        moveTowards: (unit, target) => {
            console.log(`AI: Moving ${unit.data.name} towards ${target.data.name}`);
            // Calculate movement towards target
            const dx = Math.sign(target.gridPos.x - unit.gridPos.x);
            const dy = Math.sign(target.gridPos.y - unit.gridPos.y);
            
            unit.gridPos.x += dx;
            unit.gridPos.y += dy;
            
            console.log(`AI: ${unit.data.name} moved to [${unit.gridPos.x}, ${unit.gridPos.y}]`);
        }
    },
    rules: {
        performAttack: (attacker, defender) => {
            console.log(`ATTACK: ${attacker.data.name} attacks ${defender.data.name}`);
            defender.currentHealth -= attacker.stats.atk;
        }
    },
    getUnitById: (id) => {
        if (id === 'test-target-1') return testTarget;
        if (id === 'test-unit-1') return testUnit;
        return null;
    },
    getUnitsInRange: (x, y, range) => {
        const dx = Math.abs(x - testTarget.gridPos.x);
        const dy = Math.abs(y - testTarget.gridPos.y);
        if (dx <= range && dy <= range) {
            return [testTarget];
        }
        return [];
    }
};

console.log('\n1. Testing SimpleAI tree:');
try {
    btManager.execute('SimpleAI', testUnit, testSim);
    console.log('✅ SimpleAI executed successfully');
} catch (e) {
    console.error('❌ SimpleAI execution failed:', e);
}

console.log('\n2. Testing SkirmisherAI tree:');
try {
    btManager.execute('SkirmisherAI', testUnit, testSim);
    console.log('✅ SkirmisherAI executed successfully');
} catch (e) {
    console.error('❌ SkirmisherAI execution failed:', e);
}

console.log('\n3. Testing SlimeBrain tree:');
try {
    btManager.execute('SlimeBrain', testUnit, testSim);
    console.log('✅ SlimeBrain executed successfully');
} catch (e) {
    console.error('❌ SlimeBrain execution failed:', e);
}

console.log('\n=== Target health after attacks ===');
console.log(`Target health: ${testTarget.currentHealth}`);

console.log('\n=== Test Complete ===');
