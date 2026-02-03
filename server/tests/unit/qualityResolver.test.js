/**
 * Unit Tests for QualityResolver
 * Tests quality tier determination and stat scaling
 */

const QualityResolver = require('../../src/logic/crafting/QualityResolver');

describe('QualityResolver', () => {
    describe('Quality Multipliers', () => {
        test('should have correct multipliers for all tiers', () => {
            expect(QualityResolver.QUALITY_MULTIPLIERS.COMMON).toBe(1.0);
            expect(QualityResolver.QUALITY_MULTIPLIERS.UNCOMMON).toBe(1.1);
            expect(QualityResolver.QUALITY_MULTIPLIERS.RARE).toBe(1.15);
            expect(QualityResolver.QUALITY_MULTIPLIERS.EPIC).toBe(1.25);
            expect(QualityResolver.QUALITY_MULTIPLIERS.MASTERWORK).toBe(1.3);
            expect(QualityResolver.QUALITY_MULTIPLIERS.LEGENDARY).toBe(1.5);
        });

        test('should return 1.0 for unknown quality', () => {
            expect(QualityResolver.getQualityMultiplier('UNKNOWN')).toBe(1.0);
        });
    });

    describe('Quality Stat Caps', () => {
        test('should have correct stat caps for all tiers', () => {
            expect(QualityResolver.QUALITY_STAT_CAPS.COMMON.maxStat).toBe(50);
            expect(QualityResolver.QUALITY_STAT_CAPS.UNCOMMON.maxStat).toBe(75);
            expect(QualityResolver.QUALITY_STAT_CAPS.RARE.maxStat).toBe(100);
            expect(QualityResolver.QUALITY_STAT_CAPS.EPIC.maxStat).toBe(150);
            expect(QualityResolver.QUALITY_STAT_CAPS.MASTERWORK.maxStat).toBe(200);
            expect(QualityResolver.QUALITY_STAT_CAPS.LEGENDARY.maxStat).toBe(300);
        });

        test('should have correct item level caps', () => {
            expect(QualityResolver.QUALITY_STAT_CAPS.COMMON.maxItemLevel).toBe(20);
            expect(QualityResolver.QUALITY_STAT_CAPS.LEGENDARY.maxItemLevel).toBe(70);
        });

        test('should return common cap for unknown quality', () => {
            const cap = QualityResolver.getStatCap('UNKNOWN');
            expect(cap.maxStat).toBe(50);
            expect(cap.maxItemLevel).toBe(20);
        });
    });

    describe('Resolve Quality', () => {
        test('should return COMMON for low level and low surplus', () => {
            const result = QualityResolver.resolve(1, 0, 0);
            expect(result.quality).toBe('COMMON');
            expect(result.powerScale).toBe(1.0);
            expect(result.qualityMultiplier).toBe(1.0);
        });

        test('should have chance for RARE at level 25+', () => {
            // Run multiple times to check probability
            const results = [];
            for (let i = 0; i < 100; i++) {
                const result = QualityResolver.resolve(25, 0, 0);
                results.push(result.quality);
            }
            expect(results).toContain('RARE');
        });

        test('should have chance for RARE with high surplus', () => {
            const results = [];
            for (let i = 0; i < 100; i++) {
                const result = QualityResolver.resolve(1, 1000, 0);
                results.push(result.quality);
            }
            expect(results).toContain('RARE');
        });

        test('should have chance for MASTERWORK at level 50+ with surplus', () => {
            const results = [];
            for (let i = 0; i < 200; i++) {
                const result = QualityResolver.resolve(50, 1000, 0);
                results.push(result.quality);
            }
            expect(results).toContain('MASTERWORK');
        });

        test('should include luck bonus in probability', () => {
            // High luck should increase rare/masterwork chances
            const results = [];
            for (let i = 0; i < 100; i++) {
                const result = QualityResolver.resolve(25, 0, 0.5);
                results.push(result.quality);
            }
            const rareCount = results.filter(q => q === 'RARE').length;
            expect(rareCount).toBeGreaterThan(20); // Should be significantly more than base 20%
        });

        test('should return valid power scale', () => {
            const result = QualityResolver.resolve(1, 0, 0);
            expect(result.powerScale).toBeGreaterThanOrEqual(1.0);
            expect(result.powerScale).toBeLessThanOrEqual(1.5);
        });
    });

    describe('Apply Quality Scaling', () => {
        test('should apply correct multiplier to base value', () => {
            expect(QualityResolver.applyQualityScaling(100, 'COMMON')).toBe(100);
            expect(QualityResolver.applyQualityScaling(100, 'RARE')).toBe(115);
            expect(QualityResolver.applyQualityScaling(100, 'LEGENDARY')).toBe(150);
        });

        test('should reduce scaling for percent-based stats', () => {
            const normalMult = QualityResolver.applyQualityScaling(100, 'LEGENDARY') - 100;
            const reducedMult = QualityResolver.applyQualityScaling(100, 'LEGENDARY', 'crit_chance') - 100;
            
            // Normal multiplier: 50 (100 * 0.5)
            // Reduced: 25 (100 * 0.25, half of normal)
            expect(reducedMult).toBeLessThan(normalMult);
        });

        test('should use default multiplier for unknown quality', () => {
            expect(QualityResolver.applyQualityScaling(100, 'UNKNOWN')).toBe(100);
        });
    });

    describe('Is Stat Capped', () => {
        test('should return false for stat below cap', () => {
            expect(QualityResolver.isStatCapped(40, 'COMMON')).toBe(false);
            expect(QualityResolver.isStatCapped(50, 'COMMON')).toBe(false);
        });

        test('should return true for stat above cap', () => {
            expect(QualityResolver.isStatCapped(51, 'COMMON')).toBe(true);
            expect(QualityResolver.isStatCapped(100, 'COMMON')).toBe(true);
        });

        test('should use correct cap for quality tier', () => {
            expect(QualityResolver.isStatCapped(100, 'RARE')).toBe(false);
            expect(QualityResolver.isStatCapped(101, 'RARE')).toBe(true);
        });
    });

    describe('Get Max Power Scale', () => {
        test('should return 1.0 for low level', () => {
            expect(QualityResolver.getMaxPowerScale(1)).toBe(1.0);
            expect(QualityResolver.getMaxPowerScale(24)).toBe(1.0);
        });

        test('should return 1.15 for level 25+', () => {
            expect(QualityResolver.getMaxPowerScale(25)).toBe(1.15);
            expect(QualityResolver.getMaxPowerScale(49)).toBe(1.15);
        });

        test('should return 1.3 for level 50+', () => {
            expect(QualityResolver.getMaxPowerScale(50)).toBe(1.3);
            expect(QualityResolver.getMaxPowerScale(100)).toBe(1.3);
        });
    });

    describe('Thresholds', () => {
        test('should have correct surplus threshold', () => {
            expect(QualityResolver.SURPLUS_THRESHOLD).toBe(500);
        });

        test('should have correct skill thresholds', () => {
            expect(QualityResolver.SKILL_THRESHOLD_RARE).toBe(25);
            expect(QualityResolver.SKILL_THRESHOLD_MASTER).toBe(50);
        });
    });
});
