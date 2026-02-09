const { PrismaClient } = require('./server/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('USERS_START');
    console.log(JSON.stringify(users));
    console.log('USERS_END');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
