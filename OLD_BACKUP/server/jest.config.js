/**
 * Jest Configuration for Textical Server
 */
module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverageFrom: [
        'src/logic/**/*.js',
        'src/services/stat/**/*.js',
        'src/logic/crafting/**/*.js',
        'src/logic/status/**/*.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    verbose: true,
    testTimeout: 10000,
    modulePathIgnorePatterns: ['<rootDir>/node_modules/']
};
