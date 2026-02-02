# 🛠️ Technical Specification: Module 03 (Logistics & Hauling)

## 1. Database Schema Updates (Full Relational)
- **Model `WagonRental`**:
    - `id`: Int (Primary Key).
    - `userId`: Int (Foreign Key to User).
    - `tier`: String (SMALL, MEDIUM, LARGE, HEAVY).
    - `capacity`: Int (5, 10, 15, 20).
    - `status`: String (LOADING, EN_ROUTE, ARRIVED, DESTROYED).
    - `originRegionId`: Int.
    - `targetRegionId`: Int.
    - `selectedPath`: JSON (Array of region IDs, rute terkunci).
    - `currentPathIndex`: Int.
    - `elapsedTimeInCurrentMap`: Int (Detik, reset ke 0 jika battle).
    - `nextAmbushCheckAt`: DateTime.
    - `feePaid`: Int (Gold).

## 2. Server Logic Implementation

### A. Rental & Path Initialization
```javascript
function initializeRental(userId, tier, targetCityId, chosenPath) {
    const baseRate = { SMALL: 50, MEDIUM: 100, LARGE: 200, HEAVY: 500 };
    const totalFee = baseRate[tier] * chosenPath.length;
    
    const user = db.user.findUnique({ where: { id: userId } });
    if (user.gold < totalFee) throw "Gold tidak cukup untuk menyewa gerobak rute ini.";

    return db.wagonRental.create({
        data: {
            userId,
            tier,
            capacity: getCapacityByTier(tier),
            selectedPath: chosenPath,
            feePaid: totalFee,
            status: 'LOADING'
        }
    });
}
```

### B. Ambush Check & Timer Logic (Every 10 Seconds)
Logika yang dipicu oleh cron job atau task processor setiap 10 detik:
```javascript
async function processHaulingTick(rental) {
    const region = await db.region.findUnique({ where: { id: rental.currentRegionId } });

    // 1. Safety Check
    if (region.zoneType === 'GREEN') {
        rental.elapsedTimeInCurrentMap += 10;
    } else {
        // 2. Monster Ambush Roll
        const ambushChance = region.dangerLevel * 0.05; // 5% per level
        if (Math.random() < ambushChance) {
            triggerBattle(rental.userId, 'MONSTER_AMBUSH');
            return; // Exit, battle service will handle timer reset on win
        }
        rental.elapsedTimeInCurrentMap += 10;
    }

    // 3. Region Transition Check
    if (rental.elapsedTimeInCurrentMap >= 60) {
        moveToNextRegion(rental);
    }
}
```

### C. Battle Completion Callback (The Strict Reset)
```javascript
function onHaulingBattleEnd(userId, isWinner) {
    if (isWinner) {
        // Reset timer to 0, forcing another 60s of peace
        db.wagonRental.update({
            where: { userId, status: 'EN_ROUTE' },
            data: { elapsedTimeInCurrentMap: 0 }
        });
    } else {
        // Handle destruction or theft based on killerType (Monster vs Player)
        handleHaulingLoss(userId);
    }
}
```

### D. Auto-Arrival & Bank Transfer
```javascript
async function handleArrival(userId, rental) {
    const destinationBankId = rental.targetRegionId;
    const items = await db.wagonInventory.findMany({ where: { wagonId: rental.id } });

    for (let item of items) {
        await transferToLocalBank(userId, destinationBankId, item);
    }

    await db.wagonRental.update({ where: { id: rental.id }, data: { status: 'ARRIVED' } });
    await db.user.update({ where: { id: userId }, data: { isHauling: false } });
}
```

---
*Catatan: Tidak ada peringatan untuk pemain lain selain notifikasi regional dan perubahan ikon unit hauler di map.*
