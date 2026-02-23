const userRepository = require('../repositories/userRepository');
const heroRepository = require('../repositories/heroRepository');
const inventoryRepository = require('../repositories/inventoryRepository');
const unitNames = require('../data/unit_names.json');
const bcrypt = require('bcryptjs');
const ErrorCodes = require('../constants/ErrorCodes');

class AuthHandler {
    constructor() {
        this.ensureAdminExists();
    }

    async ensureAdminExists() {
        const admin = await userRepository.findByUsername("admin");
        if (!admin) {
            console.log("[INIT] Creating default developer admin account...");
            await userRepository.create("admin", "admin_dev_pass_123");
        }
    }

    async handleRegister(ws, request) {
        try {
            if (!request.username || !request.password) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.AUTH_INVALID_CREDENTIALS,
                    message: "Username and password are required" 
                }));
                return;
            }
            
            if (request.username.length < 3) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.AUTH_INVALID_CREDENTIALS,
                    message: "Username must be at least 3 characters" 
                }));
                return;
            }
            
            const newUser = await userRepository.create(request.username, request.password);
            if (newUser) {
                const raceKeys = Object.keys(unitNames.races);
                const race = raceKeys[Math.floor(Math.random() * raceKeys.length)];
                const raceData = unitNames.races[race];
                const gender = Math.random() < 0.5 ? "MALE" : "FEMALE";
                const name = `${raceData.first_names[Math.floor(Math.random() * raceData.first_names.length)]} ${raceData.last_names[0]}`;

                await heroRepository.create(newUser.id, "Novice", name, { race, gender, hp_base: 100, damage_base: 15, speed_base: 10 });
                await inventoryRepository.addItem(newUser.id, "potion_small", 5);
                ws.send(JSON.stringify({ type: "register_success", username: newUser.username }));
            } else {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.AUTH_USER_NOT_FOUND,
                    message: "Username already taken" 
                }));
            }
        } catch (e) {
            ws.send(JSON.stringify({ 
                type: "error", 
                code: ErrorCodes.INVALID_INPUT,
                message: e.message 
            }));
        }
    }

    async handleLogin(ws, request) {
        try {
            if (!request.username || !request.password) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.AUTH_INVALID_CREDENTIALS,
                    message: "Username and password are required" 
                }));
                return;
            }
            
            const user = await userRepository.findByUsername(request.username);
            if (user && await bcrypt.compare(request.password, user.password)) {
                ws.send(JSON.stringify({ type: "login_success", user }));
            } else {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.AUTH_INVALID_CREDENTIALS,
                    message: "Invalid username or password" 
                }));
            }
        } catch (e) {
            ws.send(JSON.stringify({ 
                type: "error", 
                code: ErrorCodes.INVALID_INPUT,
                message: e.message 
            }));
        }
    }
}

module.exports = new AuthHandler();