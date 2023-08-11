import type { Config } from "@jest/types";

const isGlobalTesting = false;

const currPath = "/api/user/router";
const baseDir = isGlobalTesting ? "<rootDir>" : `<rootDir>/src/${currPath}`;
const coveragePath = isGlobalTesting
  ? `${baseDir}/**/*.ts`
  : "<rootDir>/src/api/user/router/user.router.ts";

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
  ],
  roots: [baseDir],
  testMatch: [`${baseDir}/**/*test.ts`],
};

export default config;
