import fs from "fs";
import { logger } from "./logger.service";

jest.mock("fs", () => ({
  appendFile: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
}));

jest.spyOn(console, "log").mockImplementation(() => {
  return;
});

describe("Logger", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should log debug messages", () => {
    const message = "Test debug message";
    logger.debug(message);
    expect(console.log).toHaveBeenCalled();
    expect(fs.appendFile).toHaveBeenCalled();
  });

  it("should log info messages", () => {
    const message = "Test info message";
    logger.info(message);
    expect(console.log).toHaveBeenCalled();
    expect(fs.appendFile).toHaveBeenCalled();
  });

  it("should log success messages", () => {
    const message = "Test success message";
    logger.success(message);
    expect(console.log).toHaveBeenCalled();
    expect(fs.appendFile).toHaveBeenCalled();
  });

  it("should log warn messages", () => {
    const message = "Test warn message";
    logger.warn(message);
    expect(console.log).toHaveBeenCalled();
    expect(fs.appendFile).toHaveBeenCalled();
  });

  it("should log error messages", () => {
    const message = "Test error message";
    logger.error(message);
    expect(console.log).toHaveBeenCalled();
    expect(fs.appendFile).toHaveBeenCalled();
  });
});
