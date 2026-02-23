const prisma = require('./src/db');

(async () => {
  try {
    const count = await prisma.user.count();
    console.log('User count:', count);
    
    // Also check region count
    const regionCount = await prisma.regionTemplate.count();
    console.log('Region count:', regionCount);
  } catch (e) {
    console.error('Error:', e.message);
    console.error(e.stack);
  } finally {
    await prisma.$disconnect();
  }
})();
