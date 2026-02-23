const prisma = require('./src/db.js');
async function check() {
  const typ = await prisma.weaponType.findFirst({where: {name: 'Sword'}, include: {passives: true}});
  console.log("WeaponType (Sword) passives:", typ ? typ.passives : 'Not found');
  const wpn = await prisma.itemTemplate.findFirst({where: {name: 'Rusty Sword'}, include: {traits: {include: {trait: true}}}});
  console.log("ItemTemplate (Rusty Sword) traits:", wpn ? wpn.traits : 'Not found');
}
check().finally(() => prisma.$disconnect());
