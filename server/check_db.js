const prisma = require('./src/db');

async function test() {
    const count = await prisma.user.count();
    console.log('=== Users ===');
    console.log('User count:', count);
    
    if (count === 0) {
        console.log('No users found. Creating admin user...');
        const bcrypt = require('bcryptjs');
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        
        const user = await prisma.user.create({
            data: {
                username: 'admin',
                password: hashedPassword,
                email: 'admin@textical.com',
                displayName: 'Admin',
                isVerified: true,
                isAdmin: true
            }
        });
        console.log('Admin user created:', user);
    } else {
        const users = await prisma.user.findMany();
        users.forEach(user => {
            console.log('ID:', user.id);
            console.log('Username:', user.username);
            console.log('Email:', user.email);
            console.log('Admin:', user.isAdmin);
            console.log('---');
        });
    }
    
    await prisma.$disconnect();
}
test().catch(e => console.error('Error:', e));
