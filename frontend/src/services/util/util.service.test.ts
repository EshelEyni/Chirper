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
    const basePath = getBasePathName(path, "chirper-circle");
    expect(basePath).toBe("/home");
  });

  it("should return the parent path name when there are params", () => {
    const path = "/home/post-stats/:postId";
    const basePath = getBasePathName(path, "post-stats");
    expect(basePath).toBe("/home");
  });

  it("should return the parent path name when there are params", () => {
    const path = "/profile/eshel23/post-stats/:postId";
    const basePath = getBasePathName(path, "post-stats");
    expect(basePath).toBe("/profile/eshel23");
  });

  it("should return the home path when there is an error in currNestedPath", () => {
    const path = "/profile/eshel23/post-stats/:postId";
    const basePath = getBasePathName(path, "fake-path");
    expect(basePath).toBe("/home");
  });
});
