const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DialogueRepository {
    async findById(id) {
        return await prisma.dialogueTemplate.findUnique({
            where: { id }
        });
    }

    async findInitialNpcDialogue(npcId) {
        // In a complex system, we might look for a node with no parent or marked as 'start'
        return await prisma.dialogueTemplate.findFirst({
            where: { npcId }
        });
    }
}

module.exports = new DialogueRepository();
