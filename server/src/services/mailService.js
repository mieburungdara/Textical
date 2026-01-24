const prisma = new (require('@prisma/client').PrismaClient)();
const math = require('mathjs');

class MailService {
    /**
     * Sends an automated system mail (e.g., from Market or World Event).
     */
    async sendSystemMail(receiverId, subject, content, attachedWealth = {}, attachedItems = []) {
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 Days

        const mail = await prisma.mail.create({
            data: {
                receiverId,
                subject,
                content,
                copper: attachedWealth.copper || 0,
                silver: attachedWealth.silver || 0,
                gold: attachedWealth.gold || 0,
                platinum: attachedWealth.platinum || 0,
                mithril: attachedWealth.mithril || 0,
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

        // 1. Transfer Currencies
        await prisma.user.update({
            where: { id: userId },
            data: {
                copper: { increment: mail.copper },
                silver: { increment: mail.silver },
                gold: { increment: mail.gold },
                platinum: { increment: mail.platinum },
                mithril: { increment: mail.mithril }
            }
        });

        // 2. Transfer Items
        for (let att of mail.attachments) {
            // Internal Helper or Inventory Repository can be used here
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
