const prisma = require('./src/db');

async function clearRateLimit() {
    try {
        // Delete all login attempts for bandit_tester
        const result = await prisma.loginAttempt.deleteMany({
            where: { username: 'bandit_tester' }
        });
        
        console.log(`Cleared ${result.count} login attempts for bandit_tester`);
        
    } catch (error) {
        console.error('Error clearing rate limit:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearRateLimit();
