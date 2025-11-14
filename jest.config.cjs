/**
 * Jest config (CommonJS) so we don't need ts-node to parse the config file.
 */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/**/*.test.(ts|tsx|js)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  // configure ts-jest under `transform` to avoid the deprecated globals usage
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
        },
        isolatedModules: true,
      },
    ],
  },
  // Map TS path aliases used in the repo (e.g. `@/...` -> `<rootDir>/src/...`)
  moduleNameMapper: {
    "^@\\/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  verbose: true,
};
