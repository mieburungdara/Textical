const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

const adapter = new PrismaBetterSqlite3({
  url: 'file:' + path.join(__dirname, 'prisma/dev.db')
});
const prisma = new PrismaClient({ adapter });

async function deepDiscover() {
    const ids = [998, 999];
    console.log('Deep discovering dependencies for regions:', ids);
    
    const models = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
    
    // We can use $queryRaw to find tables with relevant columns in SQLite
    try {
        const columns = await prisma.$queryRaw`
            SELECT m.name as table_name, p.name as column_name
            FROM sqlite_master m
            JOIN pragma_table_info(m.name) p
            WHERE m.type = 'table' AND p.type = 'INTEGER'
        `;

        for (const col of columns) {
            try {
                const results = await prisma.$queryRawUnsafe(
                    `SELECT COUNT(*) as count FROM "${col.table_name}" WHERE "${col.column_name}" IN (998, 999)`
                );
                const count = Number(results[0].count);
                if (count > 0) {
                    console.log(`Table [${col.table_name}] has ${count} records with value in column [${col.column_name}]`);
                }
            } catch (e) {
                // Skip errors
            }
        }
    } catch (e) {
        console.error('Deep scan failed:', e.message);
    }
    console.log('Deep discovery complete.');
}

deepDiscover()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
