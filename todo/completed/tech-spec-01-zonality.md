# 🛠️ Technical Specification: Module 01 (World Zonality)

## 1. Database Schema Extensions
- **User Model**:
    - `pvpFlagged`: Boolean.
    - `lastPvpAction`: DateTime (Untuk cooldown 5 menit).
    - `isKnockedOut`: Boolean.
    - `knockedOutUntil`: DateTime.
    - `recoveryUntil`: DateTime (Untuk jendela 1 menit pasca-KO).
    - `lastVisitedCityId`: Int.
- **Hero Model**:
    - `isMain`: Boolean (Hanya 1 per User).
    - `currentDurability`: Int (Untuk Module 02).

## 2. Server Logic Implementation

### A. Universal Red Zone Death Logic
Dijalankan setiap kali unit mencapai HP 0 di Grid Red Zone:
```javascript
function onUnitDeathInRedZone(unit, sim) {
    const isPvP = sim.isPvP;
    
    // 1. Handle Equipment
    if (isPvP) {
        moveEquipmentToLootPool(unit.id, sim.battleId); // Bisa dijarah musuh
    } else {
        deleteEquipmentFromDatabase(unit.id); // Lenyap selamanya (Vs Monster)
    }

    // 2. Handle Hero Entity
    if (unit.isMain) {
        // Naked Immortality
        const xpRequired = getXpRequiredForLevel(unit.level);
        const penaltyAmount = xpRequired * 0.10;
        unit.xp = Math.max(0, unit.xp - penaltyAmount);
        // Hero NOT deleted.
    } else {
        // Universal Permadeath
        permanentlyDeleteHero(unit.id);
    }
}
```

### B. Blue Zone KO & Recovery Window
```javascript
function processKORecovery(user) {
    if (now >= user.knockedOutUntil && user.isKnockedOut) {
        user.isKnockedOut = false;
        user.hp = user.maxHp; // Bangun dengan HP Penuh
        user.recoveryUntil = now + 60s; // Mulai jendela 1 menit
    }
}

function checkMoveAccess(user) {
    if (user.isKnockedOut) throw "You are unconscious.";
    if (now < user.recoveryUntil) throw "You must wait 1 minute for recovery before moving.";
}
```

### C. Strict Timer Reset (The Griefer Logic)
```javascript
function onBattleFinish(user) {
    // Berlaku untuk Hauling Mode DAN Post-KO Recovery
    if (user.isHauling || now < user.recoveryUntil) {
        user.haulingTimer = 0; // Reset ke detik 0
        user.recoveryUntil = now + 60s; // Reset ke 60 detik lagi
    }
}
```

### D. Multi-Inventory Looting UI
UI Looting harus melakukan `JOIN` data dari:
1. `WagonInventory` (Isi gerobak)
2. `UserInventory` (Isi tas korban)
3. `UserEquipment` (Hanya jika di Red Zone)
Logic: `closeLootUI()` atau `onAttackedDuringLooting()` -> `destroyWagonEntity()`.

---
*Catatan: Sistem ini dirancang untuk tidak memberikan celah pelarian bagi hauler yang sudah terpojok.*