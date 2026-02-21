# Fixed Stat Growth System

## Overview

Sistem ini menggantikan sistem stat allocation sebelumnya. Setiap hero naik level, stats akan meningkat secara otomatis berdasarkan class template masing-masing. Hero dengan level dan class yang sama akan memiliki stats yang identik.

## Design Principles

1. **Fairness**: Semua pemain mendapat stats yang sama untuk level dan class yang sama
2. **Class Identity**: Setiap class memiliki focus stats yang berbeda
3. **Scalability**: Stats meningkat seiring level dengan growth curve yang konsisten
4. **Simplicity**: Tidak perlu manual allocation untuk 50 unit

## Class Growth Curves

### Warrior
| Stat | Base | Growth/Level | Focus |
|------|------|-------------|-------|
| HP | 108 | +12 | ✅ Highest |
| Mana | 50 | +2 | |
| Physical Attack | 12 | +3 | ✅ Highest |
| Magical Attack | 5 | +1 | |
| Defense | 6 | +2 | |
| Speed | 4 | +0.3 | |
| Critical % | 5% | +0.3% | |

### Mage
| Stat | Base | Growth/Level | Focus |
|------|------|-------------|-------|
| HP | 76 | +4 | |
| Mana | 100 | +8 | ✅ Highest |
| Physical Attack | 5 | +1 | |
| Magical Attack | 10 | +4 | ✅ Highest |
| Defense | 3 | +1 | |
| Speed | 4 | +0.2 | |
| Critical % | 5% | +0.5% | |

### Archer
| Stat | Base | Growth/Level | Focus |
|------|------|-------------|-------|
| HP | 94 | +6 | |
| Mana | 70 | +3 | |
| Physical Attack | 10 | +2.5 | |
| Magical Attack | 5 | +1 | |
| Defense | 4 | +1.5 | |
| Speed | 10 | +1.5 | ✅ Highest |
| Critical % | 5% | +1% | ✅ Highest |

### Knight
| Stat | Base | Growth/Level | Focus |
|------|------|-------------|-------|
| HP | 120 | +10 | ✅ High |
| Mana | 50 | +2.5 | |
| Physical Attack | 8 | +2 | |
| Magical Attack | 5 | +1 | |
| Defense | 10 | +2.5 | ✅ Highest |
| Speed | 3 | +0.2 | |
| Critical % | 5% | +0.2% | |

### Rogue
| Stat | Base | Growth/Level | Focus |
|------|------|-------------|-------|
| HP | 85 | +5 | |
| Mana | 50 | +2 | |
| Physical Attack | 12 | +3 | ✅ Highest |
| Magical Attack | 5 | +1 | |
| Defense | 3 | +1 | |
| Speed | 12 | +2 | ✅ High |
| Critical % | 5% | +1.2% | ✅ High |

### Paladin
| Stat | Base | Growth/Level | Focus |
|------|------|-------------|-------|
| HP | 110 | +10 | ✅ High |
| Mana | 80 | +5 | |
| Physical Attack | 8 | +2 | |
| Magical Attack | 8 | +2 | |
| Defense | 8 | +2.5 | ✅ High |
| Speed | 3 | +0.2 | |
| Critical % | 5% | +0.2% | |

## Level 50 Examples

### Warrior Level 50
- HP: 708
- Physical Attack: 162
- Defense: 106
- Speed: 19.7
- Critical: 20%

### Mage Level 50
- HP: 276
- Mana: 452 (net after base consumption)
- Magical Attack: 208 (net)
- Speed: 14.8
- Critical: 30%

### Archer Level 50
- HP: 394
- Mana: 187 (net)
- Physical Attack: 135
- Speed: 81.5
- Critical: 55%

## Implementation Files

1. `server/src/services/stat/FixedGrowthSystem.js` - Sistem utama
2. `server/test_fixed_growth.js` - Test script
3. `server/src/services/stat/StatCalculationEngine.js` - Integration
4. `server/src/services/statService.js` - Service updates
5. `server/src/routes/statRoutes.js` - API routes dengan deprecation warnings
6. `client/src/network/StatHandler.gd` - Client updates

## Notes

- Backward compatibility: Sistem allocation lama tetap sebagai bonus
- Allocation endpoints ditandai deprecated
- No database migration required
- Equipment masih memberikan bonus di atas fixed growth
