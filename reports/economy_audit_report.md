# Economy System Audit Report - Textical

## Executive Summary
This report provides a comprehensive analysis of the Textical game economy system, examining currency management, market mechanics, pricing algorithms, tax structures, and economic balance.

---

## 1. Currency System Architecture

### 1.1 Dual-Tier Currency Model
| Tier | Ratio | Implementation |
|------|-------|----------------|
| Silver | Base unit (1) | `server/src/logic/economy/CurrencyResolver.js` |
| Gold | 1,000,000 Silver | Lines 4-9 |

**Analysis**: The CurrencyResolver uses BigInt for precision (lines 22-24), preventing floating-point errors in large transactions.

**✅ Strengths**:
- Clean separation of tiers
- Automatic gold-to-silver conversion via `TransactionManager`
- Transaction ledger for audit trail

**⚠️ Potential Issues**:
- No upper tier (platinum/diamond mentioned in user schema but not in resolver)
- Limited to 2 tiers when user schema shows 5 (copper, silver, gold, platinum, diamond)

---

## 2. Market System Analysis

### 2.1 Market Structure
| Component | File | Key Logic |
|-----------|------|-----------|
| Listing Service | `MarketListingService.js` | Item listing with dynamic pricing |
| Order Manager | `MarketOrderManager.js` | Buy/sell order handling |
| Order Matcher | `OrderMatcher.js` | Automatic order matching |
| Price Index | `PriceIndexService.js` | Historical price tracking |
| Fee Component | `MarketFeeComponent.js` | Tax calculations |

### 2.2 Market Fee Structure
```
Listing Fee:  1% base + guild tax
Sales Tax:    10% base + guild tax (reduced by trader mastery)
Guild Tax:    Configurable (0-20%+)
Faction Discount: 50% off guild-side taxes
```

**Trader Mastery Tiers** (`TraderMasteryResolver.js` lines 7-11):
| Sales Count | Discount |
|-------------|----------|
| 100+ | 50% |
| 50+ | 30% |
| 10+ | 10% |

### 2.3 Regional Market
- Items only visible in the same region (`albion_market_master_audit.js`)
- 48-hour listing expiration (`marketRepository.js` line 13)

---

## 3. Price Resolution Systems

### 3.1 Commodity Price Resolver (`CommodityPriceResolver.js`)
**Purpose**: Dynamic pricing based on regional extraction volume

| Volume Range | Price Multiplier |
|--------------|------------------|
| 0 | 1.5x (Scarcity) |
| 1-49 | Linear 1.0x-1.5x |
| 50+ | 0.8x-1.0x (Surplus, -5% per 50 units) |

**Formula** (lines 17-33):
```javascript
if (volume24h <= 0) return 1.5;
if (volume24h < 50) return 1.0 + 0.5 * (1 - volume24h/50);
// Surplus: every 50 units reduces price by 5%, min 0.8
```

### 3.2 Regional Supply Resolver (`RegionalSupplyResolver.js`)
**Stock Modifiers**:
| Condition | Modifier |
|-----------|----------|
| Resource produced in region | +50% stock |
| Danger level > 5 (Equipment) | +20% |
| Danger level > 5 (Materials) | -30% |
| RED zone (War) | -20% |

### 3.3 Property Price Calculator (`PropertyPriceCalculator.js`)
| Factor | Formula |
|--------|---------|
| Base Price | (zoneLevel + 1) × 2,000 |
| Scarcity < 5 plots | 2.0x |
| Scarcity < 10 plots | 1.5x |
| Tier 1→2 Upgrade | 10,000 silver |
| Tier 2→3 Upgrade | 35,000 silver |

---

## 4. Tax System

### 4.1 Tax Rate Resolver (`TaxRateResolver.js`)
| Condition | Rate |
|-----------|------|
| Base | 10% |
| War zone | +5% |
| Minimum | 2% |

### 4.2 Guild Revenue Streams
- Market transactions: guild market tax rate
- Gathering: guild gathering tax rate
- Siege: territory control bonuses

---

## 5. Gold Inflow/Outflow Analysis

### 5.1 Gold Sources (Inflow)
| Source | Base Amount | Multiplier |
|--------|-------------|-------------|
| Monster kill | 15 gold | 1.0 + (danger-1)×0.10 |
| Quest rewards | Variable | N/A |
| Market sales | Variable | Seller net |

**Key Finding** (`DeathResolver.js` line 27):
```javascript
this.sim.rewards.gold += 15; // FIXED per kill
```

⚠️ **Balance Concern**: Same 15 gold reward regardless of monster tier/level

### 5.2 Gold Sinks (Outflow)
| Sink | Cost Formula | Location |
|------|--------------|----------|
| Repair | BaseValue × Scale × (missing%) × 0.5 | `RepairCostResolver.js` |
| Market listing | Price × (1% + guildTax) | `MarketFeeComponent.js` |
| Market sales | Price × (10% + guildTax) | `MarketFeeComponent.js` |
| NPC purchase | Variable | `TradeHandler.js` |
| Gathering tax | Configurable | `gatheringService.js` |
| Property purchase | Zone-based | `PropertyPriceCalculator.js` |

---

## 6. System Dependencies

### 6.1 Key Service Relationships
```
TransactionManager
    ├── CurrencyResolver
    └── TransactionLedger

MarketListingService
    ├── MarketFeeComponent
    │   └── TraderMasteryResolver
    ├── CommodityPriceResolver
    └── ExtractionTrackerService

RewardProcessor
    ├── LootDistributor
    │   └── InventoryService
    └── DeathResolver
        └── Battle Simulation

GatheringService
    ├── ExtractionTrackerService
    └── Territory Tax
```

### 6.2 Database Tables (Economy-Related)
- `marketListing` / `marketOrder`
- `regionalExtractionStats`
- `transactionLedger`
- `user` (currency fields: copper, silver, gold, platinum, diamond)
- `guild` (treasury, tax rates)
- `territory` (tax configuration)

---

## 7. Identified Issues & Risks

### 7.1 Critical Issues
| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | Fixed 15 gold per monster regardless of difficulty | `DeathResolver.js:27` | Low-level monsters overvalued, high-level undervalued |
| 2 | No 24h reset for extraction volume | `ExtractionTrackerService.js` | Long-term price stagnation |
| 3 | Hardcoded property upgrade costs | `PropertyPriceCalculator.js:25-26` | No scaling with inflation |

### 7.2 Potential Exploits
| # | Vector | Severity | Description |
|---|--------|----------|-------------|
| 1 | Price manipulation | Medium | List items at extreme prices to manipulate price index |
| 2 | Market arbitrage | Low | Exploit regional price differences (by design, but needs monitoring) |
| 3 | Tax evasion | Low | Use faction allies to reduce taxes to 2% minimum |

### 7.3 Design Gaps
| # | Gap | Recommendation |
|---|-----|----------------|
| 1 | No gold decay mechanism | Consider maintenance costs for properties/guilds |
| 2 | Limited currency tiers | Integrate platinum/diamond from user schema |
| 3 | No inflation controls | Add economy-wide price monitoring |

---

## 8. Balance Recommendations

### 8.1 Gold Reward Scaling
**Current**: Flat 15 gold per kill
**Recommended**: `baseGold × (monsterLevel / 10) × dangerMultiplier`

### 8.2 Market Fee Adjustment
- Consider reducing base sales tax from 10% to 8% to encourage trading
- Increase trader mastery requirements (current: 10 sales for 10% discount is too easy)

### 8.3 Extraction Reset
- Implement daily/weekly reset of `volume24h` to prevent permanent price锁定

---

## 9. Files Audited

### Core Economy Modules
- `server/src/logic/economy/CurrencyResolver.js`
- `server/src/logic/economy/CommodityPriceResolver.js`
- `server/src/logic/economy/TaxRateResolver.js`
- `server/src/logic/economy/RepairCostResolver.js`
- `server/src/logic/economy/PropertyPriceCalculator.js`
- `server/src/logic/economy/RegionalSupplyResolver.js`
- `server/src/logic/economy/ShortageDetector.js`
- `server/src/logic/economy/StockRotationEngine.js`
- `server/src/logic/economy/TraderMasteryResolver.js`

### Services
- `server/src/services/economy/MarketFeeComponent.js`
- `server/src/services/economy/TransactionManager.js`
- `server/src/services/economy/ExtractionTrackerService.js`
- `server/src/services/marketService.js`
- `server/src/services/rewardService.js`
- `server/src/services/battle/LootDistributor.js`
- `server/src/services/battle/RewardProcessor.js`

### Battle Logic
- `server/src/logic/rules/DeathResolver.js`

---

## 10. Conclusion

The Textical economy system demonstrates solid architectural design with:
- ✅ Proper separation of concerns (logic vs services)
- ✅ BigInt precision for currency
- ✅ Regional market differentiation
- ✅ Dynamic pricing mechanisms
- ✅ Transaction auditing

However, balance improvements are needed:
- Monster reward scaling tied to difficulty
- Economy-wide inflation controls
- Integration of all currency tiers in schema

**Overall Assessment**: **Well-structured but requires balance tuning**

## Executive Summary
This report provides a comprehensive analysis of the Textical game economy system, examining currency management, market mechanics, pricing algorithms, tax structures, and economic balance.

---

## 1. Currency System Architecture

### 1.1 Dual-Tier Currency Model
| Tier | Ratio | Implementation |
|------|-------|----------------|
| Silver | Base unit (1) | `server/src/logic/economy/CurrencyResolver.js` |
| Gold | 1,000,000 Silver | Lines 4-9 |

**Analysis**: The CurrencyResolver uses BigInt for precision (lines 22-24), preventing floating-point errors in large transactions.

**✅ Strengths**:
- Clean separation of tiers
- Automatic gold-to-silver conversion via `TransactionManager`
- Transaction ledger for audit trail

**⚠️ Potential Issues**:
- No upper tier (platinum/diamond mentioned in user schema but not in resolver)
- Limited to 2 tiers when user schema shows 5 (copper, silver, gold, platinum, diamond)

---

## 2. Market System Analysis

### 2.1 Market Structure
| Component | File | Key Logic |
|-----------|------|-----------|
| Listing Service | `MarketListingService.js` | Item listing with dynamic pricing |
| Order Manager | `MarketOrderManager.js` | Buy/sell order handling |
| Order Matcher | `OrderMatcher.js` | Automatic order matching |
| Price Index | `PriceIndexService.js` | Historical price tracking |
| Fee Component | `MarketFeeComponent.js` | Tax calculations |

### 2.2 Market Fee Structure
```
Listing Fee:  1% base + guild tax
Sales Tax:    10% base + guild tax (reduced by trader mastery)
Guild Tax:    Configurable (0-20%+)
Faction Discount: 50% off guild-side taxes
```

**Trader Mastery Tiers** (`TraderMasteryResolver.js` lines 7-11):
| Sales Count | Discount |
|-------------|----------|
| 100+ | 50% |
| 50+ | 30% |
| 10+ | 10% |

### 2.3 Regional Market
- Items only visible in the same region (`albion_market_master_audit.js`)
- 48-hour listing expiration (`marketRepository.js` line 13)

---

## 3. Price Resolution Systems

### 3.1 Commodity Price Resolver (`CommodityPriceResolver.js`)
**Purpose**: Dynamic pricing based on regional extraction volume

| Volume Range | Price Multiplier |
|--------------|------------------|
| 0 | 1.5x (Scarcity) |
| 1-49 | Linear 1.0x-1.5x |
| 50+ | 0.8x-1.0x (Surplus, -5% per 50 units) |

**Formula** (lines 17-33):
```javascript
if (volume24h <= 0) return 1.5;
if (volume24h < 50) return 1.0 + 0.5 * (1 - volume24h/50);
// Surplus: every 50 units reduces price by 5%, min 0.8
```

### 3.2 Regional Supply Resolver (`RegionalSupplyResolver.js`)
**Stock Modifiers**:
| Condition | Modifier |
|-----------|----------|
| Resource produced in region | +50% stock |
| Danger level > 5 (Equipment) | +20% |
| Danger level > 5 (Materials) | -30% |
| RED zone (War) | -20% |

### 3.3 Property Price Calculator (`PropertyPriceCalculator.js`)
| Factor | Formula |
|--------|---------|
| Base Price | (zoneLevel + 1) × 2,000 |
| Scarcity < 5 plots | 2.0x |
| Scarcity < 10 plots | 1.5x |
| Tier 1→2 Upgrade | 10,000 silver |
| Tier 2→3 Upgrade | 35,000 silver |

---

## 4. Tax System

### 4.1 Tax Rate Resolver (`TaxRateResolver.js`)
| Condition | Rate |
|-----------|------|
| Base | 10% |
| War zone | +5% |
| Minimum | 2% |

### 4.2 Guild Revenue Streams
- Market transactions: guild market tax rate
- Gathering: guild gathering tax rate
- Siege: territory control bonuses

---

## 5. Gold Inflow/Outflow Analysis

### 5.1 Gold Sources (Inflow)
| Source | Base Amount | Multiplier |
|--------|-------------|-------------|
| Monster kill | 15 gold | 1.0 + (danger-1)×0.10 |
| Quest rewards | Variable | N/A |
| Market sales | Variable | Seller net |

**Key Finding** (`DeathResolver.js` line 27):
```javascript
this.sim.rewards.gold += 15; // FIXED per kill
```

⚠️ **Balance Concern**: Same 15 gold reward regardless of monster tier/level

### 5.2 Gold Sinks (Outflow)
| Sink | Cost Formula | Location |
|------|--------------|----------|
| Repair | BaseValue × Scale × (missing%) × 0.5 | `RepairCostResolver.js` |
| Market listing | Price × (1% + guildTax) | `MarketFeeComponent.js` |
| Market sales | Price × (10% + guildTax) | `MarketFeeComponent.js` |
| NPC purchase | Variable | `TradeHandler.js` |
| Gathering tax | Configurable | `gatheringService.js` |
| Property purchase | Zone-based | `PropertyPriceCalculator.js` |

---

## 6. System Dependencies

### 6.1 Key Service Relationships
```
TransactionManager
    ├── CurrencyResolver
    └── TransactionLedger

MarketListingService
    ├── MarketFeeComponent
    │   └── TraderMasteryResolver
    ├── CommodityPriceResolver
    └── ExtractionTrackerService

RewardProcessor
    ├── LootDistributor
    │   └── InventoryService
    └── DeathResolver
        └── Battle Simulation

GatheringService
    ├── ExtractionTrackerService
    └── Territory Tax
```

### 6.2 Database Tables (Economy-Related)
- `marketListing` / `marketOrder`
- `regionalExtractionStats`
- `transactionLedger`
- `user` (currency fields: copper, silver, gold, platinum, diamond)
- `guild` (treasury, tax rates)
- `territory` (tax configuration)

---

## 7. Identified Issues & Risks

### 7.1 Critical Issues
| # | Issue | Location | Impact |
|---|-------|----------|--------|
| 1 | Fixed 15 gold per monster regardless of difficulty | `DeathResolver.js:27` | Low-level monsters overvalued, high-level undervalued |
| 2 | No 24h reset for extraction volume | `ExtractionTrackerService.js` | Long-term price stagnation |
| 3 | Hardcoded property upgrade costs | `PropertyPriceCalculator.js:25-26` | No scaling with inflation |

### 7.2 Potential Exploits
| # | Vector | Severity | Description |
|---|--------|----------|-------------|
| 1 | Price manipulation | Medium | List items at extreme prices to manipulate price index |
| 2 | Market arbitrage | Low | Exploit regional price differences (by design, but needs monitoring) |
| 3 | Tax evasion | Low | Use faction allies to reduce taxes to 2% minimum |

### 7.3 Design Gaps
| # | Gap | Recommendation |
|---|-----|----------------|
| 1 | No gold decay mechanism | Consider maintenance costs for properties/guilds |
| 2 | Limited currency tiers | Integrate platinum/diamond from user schema |
| 3 | No inflation controls | Add economy-wide price monitoring |

---

## 8. Balance Recommendations

### 8.1 Gold Reward Scaling
**Current**: Flat 15 gold per kill
**Recommended**: `baseGold × (monsterLevel / 10) × dangerMultiplier`

### 8.2 Market Fee Adjustment
- Consider reducing base sales tax from 10% to 8% to encourage trading
- Increase trader mastery requirements (current: 10 sales for 10% discount is too easy)

### 8.3 Extraction Reset
- Implement daily/weekly reset of `volume24h` to prevent permanent price锁定

---

## 9. Files Audited

### Core Economy Modules
- `server/src/logic/economy/CurrencyResolver.js`
- `server/src/logic/economy/CommodityPriceResolver.js`
- `server/src/logic/economy/TaxRateResolver.js`
- `server/src/logic/economy/RepairCostResolver.js`
- `server/src/logic/economy/PropertyPriceCalculator.js`
- `server/src/logic/economy/RegionalSupplyResolver.js`
- `server/src/logic/economy/ShortageDetector.js`
- `server/src/logic/economy/StockRotationEngine.js`
- `server/src/logic/economy/TraderMasteryResolver.js`

### Services
- `server/src/services/economy/MarketFeeComponent.js`
- `server/src/services/economy/TransactionManager.js`
- `server/src/services/economy/ExtractionTrackerService.js`
- `server/src/services/marketService.js`
- `server/src/services/rewardService.js`
- `server/src/services/battle/LootDistributor.js`
- `server/src/services/battle/RewardProcessor.js`

### Battle Logic
- `server/src/logic/rules/DeathResolver.js`

---

## 10. Conclusion

The Textical economy system demonstrates solid architectural design with:
- ✅ Proper separation of concerns (logic vs services)
- ✅ BigInt precision for currency
- ✅ Regional market differentiation
- ✅ Dynamic pricing mechanisms
- ✅ Transaction auditing

However, balance improvements are needed:
- Monster reward scaling tied to difficulty
- Economy-wide inflation controls
- Integration of all currency tiers in schema

**Overall Assessment**: **Well-structured but requires balance tuning**

