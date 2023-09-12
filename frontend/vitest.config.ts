import path from "path";
const projectRoot = path.resolve(process.cwd());

import { configDefaults, defineConfig } from "vitest/config";

const root = "src/services/postUtil";

export default defineConfig({
  test: {
    coverage: {
      exclude: ["packages/template/*"],
    },
    root,
    exclude: [...configDefaults.exclude, "packages/template/*"],
    outputFile: "test-results.html",
    cache: {
      dir: path.join(projectRoot, "test/testCache"),
    },
  },
});
