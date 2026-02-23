const BaseController = require('./BaseController');
const prisma = require('../db');

class WorldController extends BaseController {
    async getWorldState(req, res) {
        await this.execute(res, async () => {
            let state = await prisma.worldState.findFirst();
            
            if (!state) {
                // Initialize if not exists
                state = await prisma.worldState.create({
                    data: {
                        id: 1,
                        currentHour: 12,
                        weatherType: "CLEAR",
                        lastTick: new Date()
                    }
                });
            }

            this.sendSuccess(res, state);
        });
    }

    async updateWorldState(req, res) {
        await this.execute(res, async () => {
            const { currentHour, weatherType } = req.body;
            
            const state = await prisma.worldState.update({
                where: { id: 1 },
                data: {
                    currentHour: currentHour !== undefined ? currentHour : undefined,
                    weatherType: weatherType !== undefined ? weatherType : undefined,
                    lastTick: new Date()
                }
            });

            this.sendSuccess(res, state);
        });
    }
}

module.exports = new WorldController();
