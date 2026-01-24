const mailService = require('../services/mailService');
const userRepository = require('../repositories/userRepository');
const prisma = new (require('@prisma/client').PrismaClient)();

class MailHandler {
    async handleFetchInbox(ws, request) {
        try {
            const user = await userRepository.findByUsername(request.account);
            const inbox = await prisma.mail.findMany({
                where: { receiverId: user.id },
                include: { attachments: true },
                orderBy: { createdAt: 'desc' }
            });
            ws.send(JSON.stringify({ type: "mail_inbox", inbox }));
        } catch (e) {
            ws.send(JSON.stringify({ type: "error", message: e.message }));
        }
    }

    async handleClaimMail(ws, request) {
        try {
            const user = await userRepository.findByUsername(request.account);
            await mailService.claimMail(user.id, request.mailId);
            
            // Sync updated state (Currencies + Inventory)
            const updatedUser = await userRepository.findByUsername(request.account);
            ws.send(JSON.stringify({ 
                type: "login_success", 
                user: updatedUser,
                message: "Attachments claimed successfully!"
            }));
        } catch (e) {
            ws.send(JSON.stringify({ type: "error", message: e.message }));
        }
    }
}

module.exports = new MailHandler();
