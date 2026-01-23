const DB = require('../logic/dbManager');
const BreedingManager = require('../logic/breedingManager');

class BreedingHandler {
    async handleBreed(ws, request) {
        const user = await DB.getUserData(request.account);
        const father = user.heroes.find(h => h.id === request.fatherId);
        const mother = user.heroes.find(h => h.id === request.motherId);

        if (father && mother && father.gender === "MALE" && mother.gender === "FEMALE") {
            if (father.hasReproduced || mother.hasReproduced) {
                ws.send(JSON.stringify({ type: "error", message: "Parent already reproduced!" }));
                return;
            }
            const childData = BreedingManager.generateChild(father, mother);
            const newHero = await DB.createHero(user.id, childData.race, childData.name, childData.baseStats);
            
            await DB.updateHeroLineage(newHero.id, { 
                gender: childData.gender, fatherId: childData.fatherId, motherId: childData.motherId, 
                generation: childData.generation, naturalTraits: JSON.stringify(childData.naturalTraits) 
            });
            
            await DB.markReproduced(father.id);
            await DB.markReproduced(mother.id);
            
            const updatedUser = await DB.getUserData(request.account);
            ws.send(JSON.stringify({ type: "login_success", user: updatedUser }));
        } else {
            ws.send(JSON.stringify({ type: "error", message: "Invalid parents for breeding" }));
        }
    }
}

module.exports = new BreedingHandler();
