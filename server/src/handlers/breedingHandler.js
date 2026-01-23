const userRepository = require('../repositories/userRepository');
const heroRepository = require('../repositories/heroRepository');
const breedingService = require('../services/breedingService');

class BreedingHandler {
    async handleBreed(ws, request) {
        try {
            const user = await userRepository.findByUsername(request.account);
            if (!user) throw new Error("User not found");

            const father = user.heroes.find(h => h.id === request.fatherId);
            const mother = user.heroes.find(h => h.id === request.motherId);

            if (father && mother && father.gender === "MALE" && mother.gender === "FEMALE") {
                if (father.hasReproduced || mother.hasReproduced) {
                    throw new Error("Parent already reproduced!");
                }

                const childData = breedingService.generateChild(father, mother);
                const newHero = await heroRepository.create(user.id, childData.race, childData.name, childData.baseStats);
                
                await heroRepository.updateLineage(newHero.id, { 
                    gender: childData.gender, 
                    fatherId: childData.fatherId, 
                    motherId: childData.motherId, 
                    generation: childData.generation, 
                    naturalTraits: JSON.stringify(childData.naturalTraits) 
                });
                
                await heroRepository.markReproduced(father.id);
                await heroRepository.markReproduced(mother.id);
                
                const updatedUser = await userRepository.findByUsername(request.account);
                ws.send(JSON.stringify({ type: "login_success", user: updatedUser }));
            } else {
                throw new Error("Invalid parents for breeding");
            }
        } catch (e) {
            ws.send(JSON.stringify({ type: "error", message: e.message }));
        }
    }
}

module.exports = new BreedingHandler();