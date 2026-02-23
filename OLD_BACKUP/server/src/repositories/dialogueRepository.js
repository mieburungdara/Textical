const prisma = require('../db');

class DialogueRepository {
    async findById(id) {
        const dialogueId = parseInt(id);
        if (isNaN(dialogueId)) return null;
        return await prisma.dialogueTemplate.findUnique({
            where: { id: dialogueId }
        });
    }

    async findInitialNpcDialogue(npcId) {
        // In a complex system, we might look for a node with no parent or marked as 'start'
        const id = parseInt(npcId);
        return await prisma.dialogueTemplate.findFirst({
            where: { npcId: id }
        });
    }
}

module.exports = new DialogueRepository();
