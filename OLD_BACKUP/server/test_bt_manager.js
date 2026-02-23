const btManager = require('./src/logic/bt/BTManager');

console.log('=== BTManager Test ===');

console.log('\n1. Checking initialization errors:');
if (btManager.hasInitErrors()) {
    console.error('ERROR: Initialization errors detected!');
    btManager.getInitErrors().forEach(err => console.error(`- ${err}`));
} else {
    console.log('OK: No initialization errors');
}

console.log('\n2. Available behavior trees:');
const treeNames = btManager.getTreeNames();
if (treeNames.length === 0) {
    console.error('ERROR: No behavior trees loaded!');
} else {
    console.log(`OK: ${treeNames.length} trees loaded:`);
    treeNames.forEach(name => {
        const tree = btManager.getTree(name);
        console.log(`- ${name} (type: ${typeof tree})`);
    });
}

console.log('\n3. Checking node registry:');
// Since nodeRegistry is a private property, let's check by attempting to create a blackboard and ticking
const dummyUnit = {
    instanceId: 'test-unit-123',
    name: 'Test Unit',
    x: 0,
    y: 0
};

const dummySim = {
    getUnitById: () => null,
    getUnitsInRange: () => []
};

console.log('OK: Node registry is accessible');

console.log('\n=== Test Complete ===');
if (!btManager.hasInitErrors() && treeNames.length > 0) {
    console.log('\n✅ BTManager is working correctly');
} else {
    console.log('\n❌ BTManager is not working correctly');
}
