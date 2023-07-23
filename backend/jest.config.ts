import type { Config } from "@jest/types";

const currPath = "/services/factory";
const baseDir = `<rootDir>/src/${currPath}`;

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [`${baseDir}/**/*.ts`],
  roots: [baseDir],
  testMatch: [`${baseDir}/**/*test.ts`],
};

export default config;

// export default {
//   preset: "ts-jest",
//   testEnvironment: "node",
//   roots: ["<rootDir>/"],
//   transform: {
//     "^.+\\.tsx?$": "ts-jest",
//   },
//   testMatch: ["<rootDir>/src/services/factory/factory.service.test.ts"],
//   moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
// };

// testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
// roots: ["<rootDir>/"],
