const chatService = require('../src/services/chatService');
const prisma = require('../src/db');

async function testChat() {
    console.log("==================================================");
    console.log("🧪 TESTING CHAT SYSTEM");
    console.log("==================================================");

    // Setup: Find or create a test user
    let user = await prisma.user.findUnique({ where: { username: "TestUser" } });
    if (!user) {
        user = await prisma.user.create({
            data: { username: "TestUser", password: "password" }
        });
    }

    try {
        // 1. Test Send Message
        console.log("1. Sending Global Message...");
        const msg = await chatService.sendMessage(user.id, {
            channelType: "GLOBAL",
            message: "Hello World!"
        });
        console.log(`✅ Message saved: ID ${msg.id}, Content: ${msg.message}`);

        // 2. Test Profanity Filter
        console.log("\n2. Testing Profanity Filter...");
        await new Promise(r => setTimeout(r, 1100)); // Delay for spam check
        const badMsg = await chatService.sendMessage(user.id, {
            channelType: "GLOBAL",
            message: "This is some shit!"
        });
        console.log(`✅ Filtered Content: ${badMsg.message}`);

        // 3. Test Spam Check
        console.log("\n3. Testing Spam Check...");
        try {
            await chatService.sendMessage(user.id, { channelType: "GLOBAL", message: "Fast 1" });
            await chatService.sendMessage(user.id, { channelType: "GLOBAL", message: "Fast 2" });
            console.error("❌ Spam check failed (Allowed too fast)");
        } catch (e) {
            console.log(`✅ Spam check passed: ${e.message}`);
        }

        // 4. Test History Retrieval
        console.log("\n4. Retrieving History...");
        const history = await chatService.getHistory("GLOBAL");
        console.log(`✅ Retrieved ${history.length} messages.`);

    } catch (e) {
        console.error(`❌ Test failed: ${e.message}`);
    }

    console.log("\n==================================================");
    process.exit(0);
}

testChat();
