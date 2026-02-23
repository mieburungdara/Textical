const prisma = require('./src/db');

(async () => {
  try {
    await prisma.user.update({
      where: { username: 'player1' },
      data: { currentRegion: 180 }
    });
    console.log('Updated player1 currentRegion to 180 (Northwind Citadel)');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
