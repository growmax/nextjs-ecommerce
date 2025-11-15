/**
 * Jest config (CommonJS) so we don't need ts-node to parse the config file.
 */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/**/*.test.(ts|tsx|js)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  // Use babel-jest to transform TS/TSX/JS/JSX for tests (handles React JSX)
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', { configFile: './.babelrc.jest.js' }],
  },
  // Map TS path aliases used in the repo (e.g. `@/...` -> `<rootDir>/src/...`)
  moduleNameMapper: {
    "^@\\/(.*)$": "<rootDir>/src/$1",
  },
  verbose: true,
};
