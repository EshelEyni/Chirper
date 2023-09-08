import type { Config } from "@jest/types";

// const isGlobalTesting = true;
const isGlobalTesting = false;

const currPath = "/api/post/services/post-stats";
const baseDir = isGlobalTesting ? "<rootDir>" : `<rootDir>/src/${currPath}`;
// const specifiedPath = baseDir + "/populate-post-data.test.ts";
// const collectCoverage = true;
const collectCoverage = false;
// const coveragePath = isGlobalTesting
//   ? `${baseDir}/**/*.ts`
//   : "<rootDir>/src/api/post/services/util/util.service.ts";
const coveragePath = "<rootDir>/**/*.ts";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  collectCoverage,
  collectCoverageFrom: [
    coveragePath,
    "!**/*.model.ts",
    "!<rootDir>/src/services/rate-limiter.service.ts",
    "!**/*.config.ts",
    "!**/node_modules/**",
    "!**/data/**",
  ],
  roots: [baseDir],
  testMatch: [`${baseDir}/**/*test.ts`],
  // testMatch: [specifiedPath],
};

export default config;

// Command: npm run test -- --coverage --watchAll=false --testPathPattern=src/api/user/router
