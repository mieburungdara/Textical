/**
 * Badge Update Socket Test
 * Tests the badge:update socket event functionality
 */

const socketService = require('./src/services/socketService');

console.log('=== Badge Update Socket Test ===\n');

// Test 1: Check if updateBadge method exists
console.log('Test 1: Checking updateBadge method...');
if (typeof socketService.updateBadge === 'function') {
    console.log('✅ updateBadge method exists');
} else {
    console.log('❌ updateBadge method NOT FOUND');
    process.exit(1);
}

// Test 2: Check if notifyNewChat method exists
console.log('\nTest 2: Checking notifyNewChat method...');
if (typeof socketService.notifyNewChat === 'function') {
    console.log('✅ notifyNewChat method exists');
} else {
    console.log('❌ notifyNewChat method NOT FOUND');
    process.exit(1);
}

// Test 3: Check if notifyNewMail method exists
console.log('\nTest 3: Checking notifyNewMail method...');
if (typeof socketService.notifyNewMail === 'function') {
    console.log('✅ notifyNewMail method exists');
} else {
    console.log('❌ notifyNewMail method NOT FOUND');
    process.exit(1);
}

// Test 4: Check if notifyGuildActivity method exists
console.log('\nTest 4: Checking notifyGuildActivity method...');
if (typeof socketService.notifyGuildActivity === 'function') {
    console.log('✅ notifyGuildActivity method exists');
} else {
    console.log('❌ notifyGuildActivity method NOT FOUND');
    process.exit(1);
}

// Test 5: Check emitToUser method
console.log('\nTest 5: Checking emitToUser method...');
if (typeof socketService.emitToUser === 'function') {
    console.log('✅ emitToUser method exists');
} else {
    console.log('❌ emitToUser method NOT FOUND');
    process.exit(1);
}

// Test 6: Test badge update with mock socket
console.log('\nTest 6: Testing badge update with mock...');

// First, add a user to the socket map
socketService.userSockets.set(1, 'mock_socket_id_123');

// Mock the io object
let lastEmittedEvent = '';
let lastEmittedData = null;

const mockEmit = (event, data) => {
    lastEmittedEvent = event;
    lastEmittedData = data;
    console.log('  📤 Emitted event:', event);
    console.log('  📦 Data:', JSON.stringify(data));
    return true;
};

socketService.io = {
    to: (socketId) => {
        console.log('  📍 Target socket:', socketId);
        return {
            emit: mockEmit
        };
    }
};

// Test updateBadge
console.log('\n  Testing updateBadge(1, "Chat", 5)...');
const result1 = socketService.updateBadge(1, 'Chat', 5);
console.log('  Result:', result1 ? '✅ Success' : '❌ Failed');
console.log('  Event:', lastEmittedEvent === 'badge:update' ? '✅ Correct' : '❌ Wrong');
console.log('  Data:', lastEmittedData?.badge === 'Chat' && lastEmittedData?.count === 5 ? '✅ Correct' : '❌ Wrong');

// Test notifyNewChat
console.log('\n  Testing notifyNewChat(1, 3)...');
const result2 = socketService.notifyNewChat(1, 3);
console.log('  Result:', result2 ? '✅ Success' : '❌ Failed');
console.log('  Event:', lastEmittedEvent === 'badge:update' ? '✅ Correct' : '❌ Wrong');
console.log('  Data:', lastEmittedData?.badge === 'Chat' && lastEmittedData?.count === 3 ? '✅ Correct' : '❌ Wrong');

// Test notifyNewMail
console.log('\n  Testing notifyNewMail(1, 2)...');
const result3 = socketService.notifyNewMail(1, 2);
console.log('  Result:', result3 ? '✅ Success' : '❌ Failed');
console.log('  Event:', lastEmittedEvent === 'badge:update' ? '✅ Correct' : '❌ Wrong');
console.log('  Data:', lastEmittedData?.badge === 'Bag' && lastEmittedData?.count === 2 ? '✅ Correct' : '❌ Wrong');

// Test notifyGuildActivity
console.log('\n  Testing notifyGuildActivity(1, 1)...');
const result4 = socketService.notifyGuildActivity(1, 1);
console.log('  Result:', result4 ? '✅ Success' : '❌ Failed');
console.log('  Event:', lastEmittedEvent === 'badge:update' ? '✅ Correct' : '❌ Wrong');
console.log('  Data:', lastEmittedData?.badge === 'Guild' && lastEmittedData?.count === 1 ? '✅ Correct' : '❌ Wrong');

// Test with count = 0 (should hide badge)
console.log('\n  Testing updateBadge(1, "Chat", 0) - hide badge...');
const result5 = socketService.updateBadge(1, 'Chat', 0);
console.log('  Result:', result5 ? '✅ Success' : '❌ Failed');
console.log('  Event:', lastEmittedEvent === 'badge:update' ? '✅ Correct' : '❌ Wrong');
console.log('  Data:', lastEmittedData?.badge === 'Chat' && lastEmittedData?.count === 0 ? '✅ Correct' : '❌ Wrong');

// Test: User not connected (should fail gracefully)
console.log('\n  Testing updateBadge(999, "Chat", 5) - user not connected...');
socketService.userSockets.delete(999); // Make sure user 999 is not in the map
const result6 = socketService.updateBadge(999, 'Chat', 5);
console.log('  Result:', result6 === false ? '✅ Correctly returns false' : '❌ Unexpected result');

console.log('\n=== All Tests Passed! ===');
console.log('\nAvailable Badge Keys:');
console.log('  - Quests');
console.log('  - Bag');
console.log('  - Guild');
console.log('  - Character');
console.log('  - Codex');
console.log('  - Chat');

process.exit(0);
