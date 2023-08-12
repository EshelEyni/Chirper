import type { Config } from "@jest/types";

const isGlobalTesting = false;

const currPath = "/api/auth/service";
const baseDir = isGlobalTesting ? "<rootDir>" : `<rootDir>/src/${currPath}`;
const coveragePath = isGlobalTesting
  ? `${baseDir}/**/*.ts`
  : "<rootDir>/src/api/auth/service/auth.service.ts";

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
