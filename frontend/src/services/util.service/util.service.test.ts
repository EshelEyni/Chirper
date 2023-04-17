import { formatCount } from "./utils.service";

describe("formatCount", () => {
  it("should return the count if it is less than 1000", () => {
    const count = 178;
    const formattedCount = formatCount(count);
    expect(formattedCount).toBe("178");
  });

  it("should return the count if it is less than 10000", () => {
    const count = 1234;
    const formattedCount = formatCount(count);
    expect(formattedCount).toBe("1,234");
  });

  it("should return the count divided by 1000 and appended with k if it is greater than 10000", () => {
    const count = 20123;
    const formattedCount = formatCount(count);
    expect(formattedCount).toBe("20.1k");
  });
});
