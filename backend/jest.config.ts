import type { Config } from "@jest/types";

const currPath = "/api/location/controller";
const baseDir = `<rootDir>/src/${currPath}`;
// const baseDir = `<rootDir>`;

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  // collectCoverageFrom: [`${baseDir}/**/*.ts`],
  collectCoverageFrom: ["<rootDir>/src/api/location/controller/location.controller.ts"],
  roots: [baseDir],
  testMatch: [`${baseDir}/**/*test.ts`],
};

export default config;
