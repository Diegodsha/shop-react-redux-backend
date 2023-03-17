module.exports = {
    resetMocks: true,
    collectCoverage: false,
    collectCoverageFrom: ['**/src/**/*.js'],
    coveragePathIgnorePatterns: ['/mocks/'],
    testEnvironment: 'node',
    moduleNameMapper:{
        "^@libs/(.*)":"<rootDir>/src/libs/$1",
    },
    testPathIgnorePatterns: [
        '/.serverless/',
        '/node_modules/',
        '/build/',
        '/mocks/',
    ],
    testMatch: ['**/**/*.test.js'],
    roots: ['<rootDir>']
};