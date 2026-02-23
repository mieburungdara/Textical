const dialogueRepository = require('../repositories/dialogueRepository');
const questService = require('../services/questService');
const userRepository = require('../repositories/userRepository');

class DialogueHandler {
    /**
     * Handles a player interacting with an NPC or choosing a dialogue option.
     */
    async handleDialogue(ws, request) {
        try {
            const user = await userRepository.findByUsername(request.account);
            
            // 1. Fetch the target dialogue node
            let node;
            if (request.npcId && !request.nodeId) {
                node = await dialogueRepository.findInitialNpcDialogue(request.npcId);
            } else {
                node = await dialogueRepository.findById(request.nodeId);
            }

            if (!node) throw new Error("Dialogue not found.");

            // 2. Process Triggers (AAA Integration)
            const triggers = JSON.parse(node.triggers || "[]");
            for (let trigger of triggers) {
                if (trigger.type === "START_QUEST") {
                    try {
                        await questService.acceptQuest(user, trigger.targetId);
                        console.log(`[DIALOGUE] User ${user.username} started quest ${trigger.targetId} via NPC.`);
                    } catch (questErr) {
                        // We continue even if quest fails (e.g. already has it)
                        console.warn(`[DIALOGUE] Quest start failed: ${questErr.message}`);
                    }
                }
                // Future: GIVE_ITEM, DISCOVER_REGION, etc.
            }

            // 3. Send the dialogue content and branches back to the client
            ws.send(JSON.stringify({
                type: "dialogue_response",
                node: {
                    ...node,
                    branches: JSON.parse(node.branches || "[]"),
                    requirements: JSON.parse(node.requirements || "{}")
                }
            }));

            // If a quest was started, we also sync the user data to reflect new active quests
            if (triggers.some(t => t.type === "START_QUEST")) {
                const updatedUser = await userRepository.findByUsername(request.account);
                ws.send(JSON.stringify({ type: "login_success", user: updatedUser }));
            }

        } catch (e) {
            ws.send(JSON.stringify({ type: "error", message: e.message }));
        }
    }
}

module.exports = new DialogueHandler();
