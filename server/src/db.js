const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

const adapter = new PrismaBetterSqlite3({
  url: 'file:' + path.join(__dirname, '../prisma/dev.db')
});
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
