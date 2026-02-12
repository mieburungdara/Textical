const prisma = new (require('@prisma/client').PrismaClient)();
const transactionManager = require('./economy/TransactionManager');
const resolver = require('../logic/economy/CurrencyResolver');

class MailService {
    /**
     * Sends an automated system mail (e.g., from Market or World Event).
     */
    async sendSystemMail(receiverId, subject, content, attachedWealth = {}, attachedItems = []) {
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 Days
        
        // Convert wealth to Silver-based total
        const silverAmount = BigInt(attachedWealth.silver || 0) + BigInt((attachedWealth.gold || 0) * 1000000);
        
        const mail = await prisma.mail.create({
            data: {
                receiverId,
                subject,
                content: content || "",
                silver: Number(silverAmount % BigInt(1000000)),
                gold: Number(silverAmount / BigInt(1000000)),
                expiresAt,
                attachments: {
                    create: attachedItems.map(item => ({
                        templateId: item.templateId,
                        quantity: item.quantity || 1,
                        uniqueData: JSON.stringify(item.uniqueData || {})
                    }))
                }
            }
        });

        // Also create a quick notification
        await prisma.notification.create({
            data: {
                userId: receiverId,
                type: "SYSTEM_MAIL",
                title: "New System Mail",
                message: subject
            }
        });

        return mail;
    }

    /**
     * Claims all attachments from a mail and moves them to the user's inventory/wallet.
     */
    async claimMail(userId, mailId) {
        const mail = await prisma.mail.findUnique({
            where: { id: mailId },
            include: { attachments: true }
        });

        if (!mail || mail.receiverId !== userId) throw new Error("Mail not found.");
        if (mail.isClaimed) throw new Error("Attachments already claimed.");

        // 1. Transfer Silver via TransactionManager (automatically handles gold conversion)
        const totalAttachedSilver = BigInt(mail.silver) + BigInt(mail.gold * 1000000);
        if (totalAttachedSilver > 0) {
            await transactionManager.addCurrency(prisma, userId, totalAttachedSilver, "MAIL_CLAIM", mailId, "MAIL");
        }

        // 2. Transfer Items
        for (let att of mail.attachments) {
            await prisma.inventoryItem.create({
                data: {
                    userId,
                    templateId: att.templateId,
                    quantity: att.quantity,
                    uniqueData: att.uniqueData
                }
            });
        }

        // 3. Mark as Claimed
        return await prisma.mail.update({
            where: { id: mailId },
            data: { isClaimed: true, isRead: true }
        });
    }
}

module.exports = new MailService();
