import { PrismaClient } from '@prisma/client';
import "dotenv/config";
import config from "./prisma.config.ts";
const prisma = new PrismaClient({ ...config });

async function check() {
  const typ = await prisma.weaponType.findFirst({where: {name: 'Sword'}, include: {passives: true}});
  console.log("WeaponType (Sword) passives:");
  console.dir(typ ? typ.passives : 'Not found');
  
  const wpn = await prisma.itemTemplate.findFirst({where: {name: 'Rusty Sword'}, include: {traits: {include: {trait: true}}}});
  console.log("\nItemTemplate (Rusty Sword) traits:");
  console.dir(wpn ? wpn.traits : 'Not found');
}
check().finally(() => prisma.$disconnect());
