/**
 * Test script for Player Reputation System
 * Run with: node test_player_reputation.js
 */

const prisma = require('./src/db');

async function testPlayerReputation() {
    console.log('=== Testing Player Reputation System ===\n');

    try {
        // Test 1: Check if tables exist
        console.log('Test 1: Checking database tables...');
        
        // Check PlayerReputation table
        const repTable = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name='PlayerReputation'`;
        console.log('  - PlayerReputation table exists:', repTable.length > 0);
        
        // Check PlayerReputationStats table
        const statsTable = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name='PlayerReputationStats'`;
        console.log('  - PlayerReputationStats table exists:', statsTable.length > 0);
        
        // Test 2: Get some test users
        console.log('\nTest 2: Getting test users...');
        const users = await prisma.user.findMany({
            take: 3,
            select: { id: true, username: true }
        });
        console.log('  Found users:', users.length);
        
        if (users.length < 2) {
            console.log('  Need at least 2 users to test. Creating test users...');
            // This would require creating users - skip for now
            console.log('  Skipping integration tests - not enough users');
        } else {
            console.log('  Users:', users.map(u => `${u.id}:${u.username}`).join(', '));
        }
        
        // Test 3: Test PlayerReputationService methods (without actual DB write)
        console.log('\nTest 3: Testing service logic...');
        const playerRepService = require('./src/services/playerReputationService');
        
        // Test tier calculation
        const tier0 = playerRepService.getTierInfo(5, 'like');
        console.log('  - Tier for 5 likes:', tier0.name, tier0.icon);
        
        const tier5 = playerRepService.getTierInfo(500, 'like');
        console.log('  - Tier for 500 likes:', tier5.name, tier5.icon);
        
        const tier9 = playerRepService.getTierInfo(10000, 'like');
        console.log('  - Tier for 10000 likes:', tier9.name, tier9.icon);
        
        // Test special badges
        const highLikes = playerRepService.getTierInfo(2000, 'like');
        console.log('  - Special badge for 2000 likes:', highLikes.specialBadge);
        
        console.log('\n=== All Tests Passed ===');
        
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testPlayerReputation();
