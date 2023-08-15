import type { Config } from "@jest/types";

const isGlobalTesting = false;

const currPath = "/services/util";
const baseDir = isGlobalTesting ? "<rootDir>" : `<rootDir>/src/${currPath}`;
// const coveragePath = isGlobalTesting
//   ? `${baseDir}/**/*.ts`
//   : "<rootDir>/src/api/post/services/util/util.service.ts";
const coveragePath = "<rootDir>/**/*.ts";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [
    coveragePath,
    "!**/*.model.ts",
    "!<rootDir>/src/services/rate-limiter.service.ts",
    "!**/*.config.ts",
    "!**/node_modules/**",
  ],
  roots: [baseDir],
  testMatch: [`${baseDir}/**/*test.ts`],
};

export default config;
