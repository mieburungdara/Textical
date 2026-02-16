const prisma = require('./src/db');

async function createTestUser() {
    try {
        // The server stores passwords in plain text (no bcrypt)
        const plainPassword = 'test123';
        
        // Update the existing bandit_tester user's password
        const user = await prisma.user.update({
            where: { username: 'bandit_tester' },
            data: {
                password: plainPassword
            }
        });
        
        console.log('Test user updated successfully:');
        console.log('  Username: bandit_tester');
        console.log('  Password: test123');
        console.log('  User ID:', user.id);
        
    } catch (error) {
        console.error('Error updating test user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestUser();
