module.exports = {
  roots: [
    "<rootDir>"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],
  collectCoverageFrom: [
    "./src/**/*.ts"
  ],
  coveragePathIgnorePatterns: [
    "/src/bin/",
    "/src/model/"
  ],
  preset: "ts-jest",
  testEnvironment: "node",
  testTimeout: 25000,
  verbose: true,
  testMatch: ["**/test/**/*.test.[jt]s"],
  globals: {},
  transform: {
    "^.+\\.ts$": ["ts-jest", { diagnostics: false }]
  },
  globalSetup: "./test/setup.ts",
};