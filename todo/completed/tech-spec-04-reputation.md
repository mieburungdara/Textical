# 🛠️ Technical Specification: Module 04 (Reputation & Social)

## 1. Database Schema Updates
- **UserReputation**:
    - `amount`: Int (Reputasi saat ini).
    - `bountyAmount`: Int (Gold yang terkumpul sebagai hadiah).
- **Hero**:
    - `isMain`: Boolean.

## 2. Server Logic Implementation

### A. Bounty Claim & Reset Logic
Dijalankan saat seorang Traitor dikalahkan:
```javascript
function onTraitorDefeated(traitorId, hunterId, zoneType) {
    const traitorRep = db.userReputation.findFirst({ where: { userId: traitorId, amount: { lt: -1000 } } });
    
    if (traitorRep && traitorRep.bountyAmount > 0) {
        // 1. Pay Bounty to Hunter
        addGold(hunterId, traitorRep.bountyAmount);
        
        // 2. Reset Bounty to zero
        db.userReputation.update({
            where: { id: traitorRep.id },
            data: { bountyAmount: 0 }
        });

        // 3. Grant Full Loot (Force Red Zone Loot Logic in any zone)
        // This overrides Blue Zone and Hauling restrictions.
        processLoot(hunterId, traitorId, 'RED'); // Forced 'RED' mode for Traitors
        
        sendGlobalAnnouncement(`Bounty of ${traitorRep.bountyAmount} Gold for Traitor ${traitorId} has been claimed by ${hunterId}!`);
    }
}
```

### B. Reputation Adjustment (Independent Players)
```javascript
function onIndependentAction(attackerId, victimId) {
    const attacker = db.user.findUnique(attackerId);
    const victim = db.user.findUnique(victimId);

    // If attacker has no faction, they still lose reputation with the victim's faction
    const targetFactionId = victim.factionId;
    if (targetFactionId) {
        db.userReputation.update({
            where: { userId_factionId: { userId: attackerId, factionId: targetFactionId } },
            data: { amount: { decrement: 200 } } // Standard penalty for unprovoked attack
        });
    }
}
```

### C. Redemption Logic (Fine Payment)
```javascript
function payRedemptionFine(userId, factionId) {
    const user = db.user.findUnique(userId);
    const fineAmount = 50000; // Fixed large fine

    if (user.gold >= fineAmount) {
        deductGold(userId, fineAmount);
        db.userReputation.update({
            where: { userId_factionId: { userId, factionId } },
            data: { amount: -500 } // Reset to just below Traitor threshold
        });
        return "Your crimes have been forgiven, but we are still watching you.";
    }
    throw "You do not have enough Gold to pay for your crimes.";
}
```

---
*Catatan: Sistem "Forced Red Zone Loot Logic" untuk Traitor memastikan bahwa menjadi kriminal di Blue Zone sekalipun memiliki risiko kehilangan equipment jika tertangkap Bounty Hunter.*