const WebSocket = require('ws');
const express = require('express');
const path = require('path');
const Ajv = require('ajv');
const BattleSimulation = require('./logic/battleSimulation');
const StatProcessor = require('./logic/statProcessor');
const LootFactory = require('./logic/lootFactory');
const EvolutionEngine = require('./logic/evolutionEngine');
const BreedingManager = require('./logic/breedingManager');
const ProgressionManager = require('./logic/progressionManager');
const ItemDatabase = require('./logic/itemDatabase');
const monsters = require('./data/monsters.json');
const unitNames = require('./data/unit_names.json');
const DB = require('./logic/dbManager');

const app = express();
const ajv = new Ajv();

app.use(express.static(path.join(__dirname, '../public')));

const server = app.listen(3000, () => {
    console.log("Textical AAA Auth Server Active on http://localhost:3000");
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
        try {
            const request = JSON.parse(message);

            if (request.type === "register") {
                const newUser = await DB.createUser(request.username, request.password);
                if (newUser) {
                    const raceKeys = Object.keys(unitNames.races);
                    const chosenRace = raceKeys[Math.floor(Math.random() * raceKeys.length)];
                    const raceData = unitNames.races[chosenRace];
                    const gender = Math.random() < 0.50 ? "MALE" : "FEMALE";
                    
                    // FIXED: Properly random name
                    const fName = raceData.first_names[Math.floor(Math.random() * raceData.first_names.length)];
                    const lName = raceData.last_names[Math.floor(Math.random() * raceData.last_names.length)];

                    await DB.createHero(newUser.id, "Novice", `${fName} ${lName}`, { 
                        race: chosenRace, gender: gender, hp_base: 100, damage_base: 15, speed_base: 10, range_base: 1, classTier: 1 
                    });
                    ws.send(JSON.stringify({ type: "register_success", username: newUser.username }));
                }
                return;
            }

            if (request.type === "login") {
                const user = await DB.verifyUser(request.username, request.password);
                if (user) ws.send(JSON.stringify({ type: "login_success", user }));
                return;
            }

            if (request.type === "equip_item") {
                const user = await DB.getUserData(request.account);
                await DB.equipItem(user.id, request.heroId, request.itemId, request.slot);
                const updatedUser = await DB.getUserData(request.account);
                ws.send(JSON.stringify({ type: "login_success", user: updatedUser }));
                return;
            }

            if (request.type === "breed_heroes") {
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
                }
                return;
            }

            if (request.type === "start_battle") {
                const user = await DB.getUserData(request.account);
                if (!user) return;

                const activeParty = user.heroes.map((h, i) => {
                    const base = JSON.parse(h.baseStats);
                    const equipMapping = JSON.parse(h.equipment || "{}");
                    const resolvedEquip = {};
                    Object.entries(equipMapping).forEach(([slot, itemId]) => {
                        const invItem = user.inventory.find(item => item.id === itemId);
                        if (invItem) resolvedEquip[slot] = ItemDatabase.getItem(invItem.templateId);
                    });

                    return {
                        id: h.id, templateId: h.templateId, name: h.name, race: h.race, gender: h.gender, classTier: h.classTier, level: h.level,
                        pos: { x: 1, y: 3 + (i * 2) }, ...base, 
                        naturalTraits: JSON.parse(h.naturalTraits), acquiredTraits: JSON.parse(h.acquiredTraits),
                        activeBehavior: h.activeBehavior, // FIXED: Pass behavior
                        equipment: resolvedEquip
                    };
                });

                // Fallback for empty accounts (Guests)
                if (activeParty.length === 0) {
                    activeParty.push({ id: "guest", templateId: "Novice", name: "Guest Hero", pos: {x:1, y:4}, hp_base: 100, damage_base: 15, speed_base: 10 });
                }

                const result = await runAuthoritativeSimulation(activeParty);
                const deadHeroIds = result.logs.filter(l => l.type === "DEATH" && l.data.target_id.startsWith("p_hero_")).map(l => l.data.target_id.replace("p_hero_", ""));

                const evolutionAlerts = [];
                const deathAlerts = [];

                for (let hero of user.heroes) {
                    if (deadHeroIds.includes(hero.id) && (request.mode || "ADVENTURE") === "ADVENTURE") {
                        const wasLegendary = await DB.handleHeroDeath(hero, user.username, "Killed in Adventure");
                        deathAlerts.push({ name: hero.name, isLegendary: wasLegendary });
                        continue;
                    }
                    const simDeeds = result.unitDeeds[`p_hero_${hero.id}`] || {};
                    const currentDeeds = JSON.parse(hero.deeds || "{}");
                    Object.entries(simDeeds).forEach(([key, val]) => { currentDeeds[key] = (currentDeeds[key] || 0) + val; });
                    const update = EvolutionEngine.processEvolution({ ...hero, deeds: JSON.stringify(currentDeeds) });
                    if (update.newlyUnlocked.length > 0) evolutionAlerts.push({ name: hero.name, unlocked: update.newlyUnlocked });
                    await DB.updateHeroProgression(hero.id, currentDeeds, update.acquiredTraits, update.unlockedBehaviors);
                }

                const droppedItems = LootFactory.generateLoot(result.killed_monsters);
                const progResult = await ProgressionManager.processRewards(user, result, droppedItems);
                const finalUser = await DB.getUserData(request.account);

                ws.send(JSON.stringify({ type: "battle_replay", ...result, evolution_alerts: evolutionAlerts, death_alerts: deathAlerts, progression: progResult, user: finalUser }));
            }

        } catch (err) { console.error("Server Error:", err); }
    });
});

async function runAuthoritativeSimulation(party) {
    const sim = new BattleSimulation(8, 10);
    for (let x = 3; x <= 4; x++) for (let y = 4; y <= 6; y++) sim.grid.terrainGrid[y][x] = 3; 
    party.forEach((h, index) => {
        const instId = `p_hero_${h.id || index}`; // FIXED: Handle guest ID
        const finalStats = StatProcessor.calculateHeroStats(h);
        sim.addUnit({ ...h, instance_id: instId }, 0, h.pos, finalStats);
    });
    const enemyBlueprint = monsters["mob_orc"];
    for (let i = 0; i < 2; i++) {
        const stats = StatProcessor.calculateHeroStats(enemyBlueprint);
        sim.addUnit({ ...enemyBlueprint, instance_id: `e_orc_${i}`, race: "orc" }, 1, { x: 6, y: 4 + (i * 2) }, stats);
    }
    const result = sim.run();
    return { winner: result.winner, logs: result.logs, terrain_grid: sim.grid.terrainGrid, unitDeeds: result.unitDeeds, rewards: result.rewards };
}