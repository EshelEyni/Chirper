import type { Config } from "@jest/types";

const isGlobalTesting = false;

const currPath = "/api/user/controller";
const baseDir = isGlobalTesting ? "<rootDir>" : `<rootDir>/src/${currPath}`;
const coveragePath = isGlobalTesting
  ? `${baseDir}/**/*.ts`
  : "<rootDir>/src/api/user/controller/user.controller.ts";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [coveragePath],
  roots: [baseDir],
  testMatch: [`${baseDir}/**/*test.ts`],
};

export default config;
