const btManager = require('./src/logic/bt/BTManager');

console.log('=== BTManager Execution Test ===');

// Create dummy unit and simulation
const testUnit = {
    instanceId: 'test-unit-1',
    name: 'Test Warrior',
    x: 5,
    y: 5,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    stats: { atk: 10, def: 5, spd: 3 },
    skills: [],
    statusEffects: []
};

const testTarget = {
    instanceId: 'test-target-1',
    name: 'Test Target',
    x: 8,
    y: 8,
    hp: 100,
    maxHp: 100,
    isAlive: true
};

const testSim = {
    getUnitById: (id) => {
        if (id === 'test-target-1') return testTarget;
        return null;
    },
    getUnitsInRange: (x, y, range) => {
        const dx = Math.abs(x - testTarget.x);
        const dy = Math.abs(y - testTarget.y);
        if (dx <= range && dy <= range) {
            return [testTarget];
        }
        return [];
    },
    grid: {
        getCellAt: () => ({ terrain: 0 }),
        width: 10,
        height: 10
    }
};

console.log('\n1. Testing SimpleAI tree:');
try {
    btManager.execute('SimpleAI', testUnit, testSim);
    console.log('✅ SimpleAI executed successfully');
} catch (e) {
    console.error('❌ SimpleAI execution failed:', e.message);
}

console.log('\n2. Testing SkirmisherAI tree:');
try {
    btManager.execute('SkirmisherAI', testUnit, testSim);
    console.log('✅ SkirmisherAI executed successfully');
} catch (e) {
    console.error('❌ SkirmisherAI execution failed:', e.message);
}

console.log('\n3. Testing SlimeBrain tree:');
try {
    btManager.execute('SlimeBrain', testUnit, testSim);
    console.log('✅ SlimeBrain executed successfully');
} catch (e) {
    console.error('❌ SlimeBrain execution failed:', e.message);
}

console.log('\n=== Test Complete ===');
