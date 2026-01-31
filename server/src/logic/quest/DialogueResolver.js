/**
 * AAA DialogueResolver
 * Pure logic for determining the outcome of dialogue choices.
 */
class DialogueResolver {
    /**
     * Resolves the effect of a chosen dialogue option.
     * Returns an object containing the next node ID and any secondary effects.
     */
    async resolveChoice(tx, userId, choiceId) {
        const choice = await tx.dialogueChoice.findUnique({
            where: { id: choiceId },
            include: { node: { include: { npc: true } } }
        });

        if (!choice) throw new Error("Invalid dialogue choice.");

        const effects = {
            nextNodeId: choice.nextNodeId,
            questToOffer: choice.questId,
            reputationUpdate: null,
            triggerCombat: choice.triggerCombat
        };

        if (choice.reputationAmount && choice.reputationFactionId) {
            effects.reputationUpdate = {
                factionId: choice.reputationFactionId,
                amount: choice.reputationAmount
            };
        }

        return effects;
    }
}

module.exports = new DialogueResolver();
