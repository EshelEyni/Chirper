import type { Config } from "@jest/types";

const currPath = "/api/location/service";
const baseDir = `<rootDir>/src/${currPath}`;
// const baseDir = `<rootDir>`;

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  // collectCoverageFrom: [`${baseDir}/**/*.ts`],
  collectCoverageFrom: ["<rootDir>/src/api/location/service/location.service.ts"],
  roots: [baseDir],
  testMatch: [`${baseDir}/**/*test.ts`],
};

export default config;
