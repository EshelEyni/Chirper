export default {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testMatch: ["<rootDir>/src/services/logger/logger.service.test.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};

// testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
// roots: ["<rootDir>/"],
