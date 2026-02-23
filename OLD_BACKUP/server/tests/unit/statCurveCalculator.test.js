/**
 * Unit Tests for StatCurveCalculator
 * Tests various growth curve calculations
 */

const StatCurveCalculator = require('../../src/services/stat/StatCurveCalculator');

describe('StatCurveCalculator', () => {
    describe('Linear Growth', () => {
        test('should calculate linear growth correctly', () => {
            const result = StatCurveCalculator.calculateLinear(100, 10, 5);
            // base + (rate * (level - 1)) = 100 + (10 * 4) = 140
            expect(result).toBe(140);
        });

        test('should handle level 1', () => {
            const result = StatCurveCalculator.calculateLinear(100, 10, 1);
            expect(result).toBe(100);
        });

        test('should handle offset level', () => {
            const result = StatCurveCalculator.calculateLinear(100, 10, 5, { offsetLevel: 2 });
            // base + (rate * (5 - 1 + 2)) = 100 + (10 * 6) = 160
            expect(result).toBe(160);
        });

        test('should apply rate multiplier', () => {
            const result = StatCurveCalculator.calculateLinear(100, 10, 5, { rateMultiplier: 2 });
            // base + (10 * 2 * (5 - 1)) = 100 + 80 = 180
            expect(result).toBe(180);
        });

        test('should handle minimum level of 1', () => {
            const result = StatCurveCalculator.calculateLinear(100, 10, 0);
            // Should use effectiveLevel = 1
            expect(result).toBe(100);
        });
    });

    describe('Exponential Growth', () => {
        test('should calculate exponential growth correctly', () => {
            const result = StatCurveCalculator.calculateExponential(100, 1.1, 3);
            // base * (rate ^ (level - 1)) = 100 * 1.1^2 = 121
            expect(result).toBeCloseTo(121, 5);
        });

        test('should return base at level 1', () => {
            const result = StatCurveCalculator.calculateExponential(100, 1.1, 1);
            expect(result).toBe(100);
        });

        test('should handle exponent base', () => {
            const result = StatCurveCalculator.calculateExponential(100, 1.1, 3, { exponentBase: 2 });
            // base * (rate ^ ((level - 1) ^ exponentBase)) = 100 * 1.1^4 = 146.41
            expect(result).toBeCloseTo(146.41, 5);
        });

        test('should handle offset level', () => {
            const result = StatCurveCalculator.calculateExponential(100, 1.1, 5, { offsetLevel: 2 });
            // base * 1.1^(5 - 1 + 2) = 100 * 1.1^6 = 177.16
            expect(result).toBeCloseTo(177.16, 5);
        });

        test('should handle rate of 1 (no growth)', () => {
            const result = StatCurveCalculator.calculateExponential(100, 1.0, 10);
            expect(result).toBe(100);
        });
    });

    describe('Sigmoid Growth', () => {
        test('should calculate sigmoid growth correctly', () => {
            const result = StatCurveCalculator.calculateSigmoid(100, 100, 50, 0.1, 50);
            // At midpoint, sigmoid = 0.5, so result = 100 + 100 * 0.5 = 150
            expect(result).toBe(150);
        });

        test('should return base at very low levels', () => {
            const result = StatCurveCalculator.calculateSigmoid(100, 100, 1, 0.1, 50);
            // At level 1, sigmoid ≈ 0, so result ≈ 100
            expect(result).toBeCloseTo(100, -1);
        });

        test('should approach max at very high levels', () => {
            const result = StatCurveCalculator.calculateSigmoid(100, 100, 100, 0.1, 50);
            // At level 100, sigmoid ≈ 1, so result ≈ 200
            expect(result).toBeCloseTo(200, -1);
        });

        test('should use default midpoint of 50', () => {
            const result = StatCurveCalculator.calculateSigmoid(100, 100, 50);
            expect(result).toBe(150);
        });

        test('should use default steepness of 0.1', () => {
            const result1 = StatCurveCalculator.calculateSigmoid(100, 100, 50, 0.1, 50);
            const result2 = StatCurveCalculator.calculateSigmoid(100, 100, 50, undefined, 50);
            expect(result1).toBe(result2);
        });

        test('should handle steepness correctly', () => {
            // Steep sigmoid should transition quickly
            const steepResult = StatCurveCalculator.calculateSigmoid(100, 100, 50, 1.0, 50);
            // Very steep at midpoint
            expect(steepResult).toBeCloseTo(150, 0);
        });
    });

    describe('Polynomial Growth', () => {
        test('should calculate polynomial growth with power 2', () => {
            const result = StatCurveCalculator.calculatePolynomial(100, 10, 5, 2);
            // base + rate * level^power = 100 + 10 * 5^2 = 100 + 250 = 350
            expect(result).toBe(350);
        });

        test('should calculate polynomial growth with power 3', () => {
            const result = StatCurveCalculator.calculatePolynomial(100, 5, 4, 3);
            // base + rate * level^3 = 100 + 5 * 64 = 420
            expect(result).toBe(420);
        });

        test('should handle linear power (1)', () => {
            const result = StatCurveCalculator.calculatePolynomial(100, 10, 5, 1);
            // base + rate * level = 100 + 10 * 5 = 150
            expect(result).toBe(150);
        });

        test('should handle offset level', () => {
            const result = StatCurveCalculator.calculatePolynomial(100, 10, 5, 2, { offsetLevel: 1 });
            // base + rate * (level + offset)^power = 100 + 10 * 6^2 = 100 + 360 = 460
            expect(result).toBe(460);
        });
    });

    describe('Logarithmic Growth', () => {
        test('should calculate logarithmic growth', () => {
            const result = StatCurveCalculator.calculateLogarithmic(100, 10, 5);
            // base + rate * ln(level + offset) / ln(baseLog)
            // offset defaults to 1
            // ln(6) ≈ 1.7918
            expect(result).toBeCloseTo(100 + 10 * Math.log(6), 5);
        });

        test('should handle custom log base', () => {
            const result = StatCurveCalculator.calculateLogarithmic(100, 10, 10, 10);
            // log10(11) ≈ 1.0414
            expect(result).toBeCloseTo(100 + 10 * Math.log(11) / Math.log(10), 5);
        });

        test('should handle offset parameter', () => {
            const result = StatCurveCalculator.calculateLogarithmic(100, 10, 5, Math.E, { offset: 5 });
            // ln(5 + 5) = ln(10) ≈ 2.3026
            expect(result).toBeCloseTo(100 + 10 * Math.log(10), 5);
        });

        test('should return base at level 1 with offset 1', () => {
            // ln(1 + 1) = ln(2) ≈ 0.693
            const result = StatCurveCalculator.calculateLogarithmic(100, 10, 1, Math.E, { offset: 1 });
            expect(result).toBeCloseTo(100 + 10 * Math.log(2), 5);
        });
    });

    describe('Generic Calculate Method', () => {
        test('should calculate using linear curve type', () => {
            const result = StatCurveCalculator.calculate(100, 5, { type: 'linear', rate: 10 });
            expect(result).toBe(140);
        });

        test('should calculate using exponential curve type', () => {
            const result = StatCurveCalculator.calculate(100, 3, { type: 'exponential', rate: 1.1 });
            expect(result).toBeCloseTo(121, 5);
        });

        test('should calculate using sigmoid curve type', () => {
            const result = StatCurveCalculator.calculate(100, 50, { 
                type: 'sigmoid', 
                rate: 1,
                max: 100,
                steepness: 0.1,
                midpoint: 50
            });
            expect(result).toBe(150);
        });

        test('should calculate using polynomial curve type', () => {
            const result = StatCurveCalculator.calculate(100, 5, { 
                type: 'polynomial', 
                rate: 10,
                power: 2
            });
            expect(result).toBe(350);
        });

        test('should calculate using logarithmic curve type', () => {
            const result = StatCurveCalculator.calculate(100, 5, { 
                type: 'logarithmic', 
                rate: 10 
            });
            expect(result).toBeCloseTo(100 + 10 * Math.log(6), 5);
        });

        test('should default to linear for unknown type', () => {
            const result = StatCurveCalculator.calculate(100, 5, { type: 'unknown' });
            expect(result).toBe(140);
        });

        test('should default to linear when no type specified', () => {
            const result = StatCurveCalculator.calculate(100, 5, {});
            expect(result).toBe(140);
        });
    });

    describe('Growth to Level', () => {
        test('should calculate growth between levels', () => {
            const result = StatCurveCalculator.calculateGrowthToLevel(100, 1, 5, { 
                type: 'linear', 
                rate: 10 
            });
            // From level 1 to 5: gain of 40 (4 levels * 10)
            expect(result).toBe(140);
        });

        test('should return current value if target <= current', () => {
            const result = StatCurveCalculator.calculateGrowthToLevel(100, 5, 3, { 
                type: 'linear', 
                rate: 10 
            });
            expect(result).toBe(100);
        });

        test('should handle exponential growth between levels', () => {
            const result = StatCurveCalculator.calculateGrowthToLevel(100, 1, 3, { 
                type: 'exponential', 
                rate: 1.1 
            });
            // Level 1: 100, Level 3: 121, difference = 21
            expect(result).toBeCloseTo(121, 5);
        });
    });

    describe('Recommended Distribution', () => {
        test('should return default distribution when no template', () => {
            const result = StatCurveCalculator.getRecommendedDistribution(null, 1, 100);
            expect(result).toEqual({
                str: 35,
                dex: 30,
                int: 20,
                vit: 15
            });
        });

        test('should return default distribution when template is empty', () => {
            const result = StatCurveCalculator.getRecommendedDistribution({}, 1, 100);
            expect(result).toEqual({
                str: 35,
                dex: 30,
                int: 20,
                vit: 15
            });
        });

        test('should use template when provided', () => {
            const template = {
                statAllocationTemplate: {
                    recommendedStr: 40,
                    recommendedDex: 30,
                    recommendedInt: 20,
                    recommendedVit: 10,
                    total: 100
                }
            };
            const result = StatCurveCalculator.getRecommendedDistribution(template, 1, 100);
            expect(result).toEqual({
                str: 40,
                dex: 30,
                int: 20,
                vit: 10
            });
        });

        test('should handle zero total in template', () => {
            const template = {
                statAllocationTemplate: {
                    recommendedStr: 0,
                    recommendedDex: 0,
                    recommendedInt: 0,
                    recommendedVit: 0,
                    total: 0
                }
            };
            const result = StatCurveCalculator.getRecommendedDistribution(template, 1, 100);
            expect(result).toEqual({
                str: 0,
                dex: 0,
                int: 0,
                vit: 0
            });
        });
    });
});
