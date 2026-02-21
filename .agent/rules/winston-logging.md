---
trigger: always_on
---

# Winston Logging Rule

## Core Rule
Setiap fungsi baru yang dibuat oleh AI WAJIB menggunakan Winston logger untuk logging. Console.log DILARANG digunakan untuk production code.

---

## Winston Logger Setup

### Import Logger
Di setiap file JavaScript baru, tambahkan import di bagian atas:

```javascript
const logger = require('../../utils/logger');
```

Logger Winston sudah tersedia di: `server/src/utils/logger.js`

---

## Logging Patterns

### 1. Basic Function Logging

```javascript
function myFunction(param) {
    logger.debug(`[myFunction] Called with param: ${JSON.stringify(param)}`);
    try {
        // ... function logic
        logger.debug(`[myFunction] Completed successfully`);
        return result;
    } catch (error) {
        logger.error(`[myFunction] Error: ${error.message}`, { stack: error.stack });
        throw error;
    }
}
```

### 2. Async Function Logging

```javascript
async function fetchUser(userId) {
    logger.info(`[fetchUser] Fetching user ${userId}`);
    try {
        const user = await db.users.findById(userId);
        if (!user) {
            logger.warn(`[fetchUser] User not found: ${userId}`);
            return null;
        }
        logger.info(`[fetchUser] User found: ${user.name}`);
        return user;
    } catch (error) {
        logger.error(`[fetchUser] Database error: ${error.message}`, { userId, error });
        throw error;
    }
}
```

### 3. Class/Service Method Logging

```javascript
class HeroService {
    constructor() {
        this.logger = logger; // Bind logger ke class
    }
    
    async createHero(heroData) {
        this.logger.info(`[HeroService.createHero] Creating hero`, { 
            name: heroData.name,
            class: heroData.class 
        });
        
        try {
            if (!heroData.name) {
                this.logger.warn(`[HeroService.createHero] Missing hero name`);
                throw new Error('Hero name required');
            }
            
            const hero = await db.hero.create(heroData);
            this.logger.info(`[HeroService.createHero] Hero created`, { heroId: hero.id });
            return hero;
            
        } catch (error) {
            this.logger.error(`[HeroService.createHero] Failed`, { 
                error: error.message, 
                stack: error.stack,
                heroData 
            });
            throw error;
        }
    }
}
```

---

## Log Levels

| Level | Penggunaan |
|-------|------------|
| `debug` | Detail proses, variabel, flow execution |
| `info` | Operasi normal, milestone penting |
| `warn` | Warning, kondisi tidak ideal |
| `error` | Error, exception, kegagalan operasi |

---

## Metadata Standards

Selalu sertakan context metadata:

```javascript
// ✅ BENAR
logger.info('[UserService]', { 
    userId: user.id,
    operation: 'create'
});

// ❌ SALAH
logger.info('User created');
```

---

## Battle Simulation Exception

Untuk battle logic, gunakan `sim.logger` (bukan Winston langsung):

```javascript
sim.logger.addEvent("SKILL", `${unit.data.name} uses ${skill.name}!`, {
    actor_id: unit.instanceId,
    skill: skill.name
});
```

---

## Enforcement Checklist

Sebelum commit, pastikan:

- [ ] Logger sudah di-import di setiap file JS baru
- [ ] Ada logger.info()/debug() di entry function
- [ ] Error di-log dengan stack trace
- [ ] Metadata yang relevan sudah di-include
- [ ] Tidak ada console.log yang tersisa di production code
- [ ] Format konsisten: `[ClassName.methodName]`

---

## Contoh Lengkap: Controller + Service

### Controller
```javascript
// server/src/controllers/userController.js
const logger = require('../utils/logger');

async function register(req, res) {
    logger.info('[UserController.register] User registration started', { 
        username: req.body.username 
    });
    
    try {
        const user = await userService.createUser(req.body);
        logger.info('[UserController.register] User registered', { userId: user.id });
        res.json(user);
    } catch (error) {
        logger.error('[UserController.register] Registration failed', { 
            error: error.message,
            body: req.body 
        });
        res.status(500).json({ error: error.message });
    }
}
```

### Service
```javascript
// server/src/services/userService.js
const logger = require('../utils/logger');

async function createUser(userData) {
    logger.debug('[UserService.createUser] Creating user', userData);
    
    // Validation
    if (!userData.username || !userData.password) {
        logger.warn('[UserService.createUser] Missing required fields');
        throw new Error('Username and password required');
    }
    
    // Business logic
    const user = await db.users.create(userData);
    
    logger.info('[UserService.createUser] User created', { userId: user.id });
    return user;
}
```

---

## Larangan

- ❌ Menggunakan `console.log()` untuk production code
- ❌ Tidak ada logging di fungsi baru
- ❌ Logging tanpa context yang cukup
- ❌ Logging dengan message kosong atau tidak informatif
