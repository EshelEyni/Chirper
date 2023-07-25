import type { Config } from "@jest/types";

const currPath = "/services/util";
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
//   roots: ["<rootDir>/src"],
//   transform: {
//     "^.+\\.tsx?$": "ts-jest",
//   },
//   testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
//   moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
// };