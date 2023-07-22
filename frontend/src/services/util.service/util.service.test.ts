import { formatNumToK, getBasePathName } from "./utils.service";

describe("formatNumToK", () => {
  it("should return the count if it is less than 1000", () => {
    const count = 178;
    const formattedCount = formatNumToK(count);
    expect(formattedCount).toBe("178");
  });

  it("should return the count if it is less than 10000", () => {
    const count = 1234;
    const formattedCount = formatNumToK(count);
    expect(formattedCount).toBe("1,234");
  });

  it("should return the count divided by 1000 and appended with k if it is greater than 10000", () => {
    const count = 20123;
    const formattedCount = formatNumToK(count);
    expect(formattedCount).toBe("20.1k");
  });
});

describe.only("getParentPathName", () => {
  it("should return the parent path name when there are no params", () => {
    const path = "/home/chirper-circle";
    const basePath = getBasePathName(path);
    expect(basePath).toBe("/home");
  });

  it("should return the parent path name when there are params", () => {
    const path = "/home/post-stats/:postId";
    const basePath = getBasePathName(path);
    expect(basePath).toBe("/home");
  });

  it("should return the parent path name when there are no params or child routes", () => {
    const path = "/home";
    const basePath = getBasePathName(path);
    expect(basePath).toBe("/home");
  });
});
