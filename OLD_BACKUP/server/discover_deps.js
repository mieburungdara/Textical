const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

const adapter = new PrismaBetterSqlite3({
  url: 'file:' + path.join(__dirname, 'prisma/dev.db')
});
const prisma = new PrismaClient({ adapter });

async function discover() {
    const ids = [998, 999];
    console.log('Discovering dependencies for regions:', ids);
    
    // Get all model names from prisma object
    const models = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'));
    
    for (const model of models) {
        try {
            // Find fields in this model
            // We can't easily get field names from the runtime client without introspection
            // But we can try common field names
            const fields = ['regionId', 'currentRegion', 'bindPointId', 'targetRegionId', 'originRegionId', 'startingRegionId'];
            
            for (const field of fields) {
                try {
                    const count = await prisma[model].count({
                        where: { [field]: { in: ids } }
                    });
                    if (count > 0) {
                        console.log(`Model [${model}] has ${count} records linked via field [${field}]`);
                    }
                } catch (e) {
                    // Field doesn't exist in this model
                }
            }
        } catch (e) {
            // Model doesn't support count or similar
        }
    }
    console.log('Discovery complete.');
}

discover()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
