const prisma = require('./src/db');

(async () => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, currentRegion: true }
    });
    console.log('Users in database:', JSON.stringify(users, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
