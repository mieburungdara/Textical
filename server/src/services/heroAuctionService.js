const prisma = new (require('@prisma/client').PrismaClient)();
const mailService = require('./mailService');
const economyService = require('./economyService');
const math = require('mathjs');

class HeroAuctionService {
    /**
     * Places a bid on a hero.
     * Implements Escrow, Anti-Sniping, and Min-Increment logic.
     */
    async placeBid(userId, listingId, bidAmountInCopper) {
        return await prisma.$transaction(async (tx) => {
            const listing = await tx.heroAuctionListing.findUnique({
                where: { id: listingId },
                include: { bids: { orderBy: { amount: 'desc' }, take: 1 } }
            });

            if (!listing || listing.isFinished || listing.expiresAt < new Date()) {
                throw new Error("Auction is no longer active.");
            }

            // 1. Min Increment Logic (5%)
            const minBid = listing.currentBid > 0 
                ? math.add(listing.currentBid, math.floor(math.multiply(listing.currentBid, 0.05)))
                : listing.startingPrice;

            if (bidAmountInCopper < minBid) {
                throw new Error(`Minimum bid required: ${minBid} Copper.`);
            }

            // 2. Escrow: Lock Bidder's Funds
            const user = await tx.user.findUnique({ where: { id: userId } });
            const userTotal = economyService.getTotalValueInCopper(user);
            if (math.smaller(userTotal, bidAmountInCopper)) throw new Error("Insufficient funds for this bid.");

            // Deduct funds (simplified breakdown for demo, usually we'd convert user wealth)
            await tx.user.update({
                where: { id: userId },
                data: { copper: { decrement: bidAmountInCopper } } 
            });

            // 3. Refund Previous Bidder (Escrow Return)
            if (listing.bids.length > 0) {
                const prevBid = listing.bids[0];
                await tx.user.update({
                    where: { id: prevBid.bidderId },
                    data: { copper: { increment: prevBid.amount } }
                });
                
                await mailService.sendSystemMail(prevBid.bidderId, "Outbid Notification", `You have been outbid on listing #${listingId}. Your ${prevBid.amount} Copper has been returned.`);
            }

            // 4. Anti-Sniping (Soft Close)
            let newExpiry = listing.expiresAt;
            const timeRemaining = math.subtract(listing.expiresAt.getTime(), Date.now());
            if (timeRemaining < 60000) { // Less than 60 seconds
                newExpiry = new Date(Date.now() + 60000); // Reset to 60s
                console.log(`[AUCTION] Anti-sniping triggered for #${listingId}. Time extended.`);
            }

            // 5. Update Listing
            const bid = await tx.heroBid.create({
                data: { listingId, bidderId: userId, amount: bidAmountInCopper }
            });

            await tx.heroAuctionListing.update({
                where: { id: listingId },
                data: { currentBid: bidAmountInCopper, expiresAt: newExpiry }
            });

            return bid;
        });
    }

    /**
     * Finalizes an auction, transfers hero, and pays the seller (minus tax).
     */
    async finalizeAuction(listingId) {
        const listing = await prisma.heroAuctionListing.findUnique({
            where: { id: listingId },
            include: { bids: { orderBy: { amount: 'desc' }, take: 1 } }
        });

        if (!listing || listing.isFinished) return;

        if (listing.bids.length === 0) {
            // No bids: Return hero to seller
            await prisma.hero.update({ where: { id: listing.heroId }, data: { userId: listing.sellerId } });
        } else {
            const winningBid = listing.bids[0];
            const tax = math.floor(math.multiply(winningBid.amount, 0.15)); // 15% Tax
            const payout = math.subtract(winningBid.amount, tax);

            // Transfer Hero
            await prisma.hero.update({ where: { id: listing.heroId }, data: { userId: winningBid.bidderId } });

            // Pay Seller
            await prisma.user.update({ where: { id: listing.sellerId }, data: { copper: { increment: payout } } });

            await mailService.sendSystemMail(listing.sellerId, "Hero Sold!", `Your hero was sold for ${winningBid.amount} Copper. After 15% tax, you received ${payout}.`);
            await mailService.sendSystemMail(winningBid.bidderId, "Auction Won!", `Congratulations! You won the auction for your new hero.`);
        }

        await prisma.heroAuctionListing.update({ where: { id: listingId }, data: { isFinished: true } });
    }
}

module.exports = new HeroAuctionService();
