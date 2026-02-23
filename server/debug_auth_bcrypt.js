const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function debug() {
    console.log('--- Deep Authentication Debug ---');
    const username = 'player1';
    const password = 'password123';
    
    try {
        const user = await prisma.user.findUnique({
            where: { username: username.toLowerCase() }
        });
        
        if (!user) {
            console.log('❌ User not found');
            return;
        }
        
        console.log('User found:', user.username);
        console.log('Stored Hash:', user.password);
        
        const isValid = await bcrypt.compare(password, user.password);
        console.log('Bcrypt comparison with "password123":', isValid ? '✅ VALID' : '❌ INVALID');
        
        // Test manual hash comparison
        const salts = [10];
        for (const salt of salts) {
            const testHash = await bcrypt.hash(password, salt);
            console.log(`Manual Hash (salt ${salt}):`, testHash);
            const testValid = await bcrypt.compare(password, testHash);
            console.log(`Manual comparison:`, testValid);
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

debug();
