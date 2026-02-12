const BaseController = require('./BaseController');
const prisma = require('../db');

class SocialController extends BaseController {
    async getFriends(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);

            const friendships = await prisma.userFriend.findMany({
                where: { userId, status: "ACCEPTED" },
                include: { friend: { select: { id: true, username: true, isInTavern: true, currentRegion: true } } }
            });

            const friends = friendships.map(f => ({
                id: f.friend.id,
                name: f.friend.username,
                status: "online",
                location: f.friend.isInTavern ? "Tavern" : "World"
            }));

            this.sendSuccess(res, friends);
        });
    }
}

module.exports = new SocialController();
