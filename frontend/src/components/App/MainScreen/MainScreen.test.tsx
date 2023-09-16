import { it, describe, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MainScreen } from "./MainScreen";

describe("MainScreen", () => {
  afterEach(() => {
    cleanup();
  });

  it("applies mode class correctly", () => {
    render(<MainScreen mode="light" />);
    expect(screen.getByTestId("main-screen")).toHaveClass("light");
  });

  it("applies zIndex style when provided", () => {
    render(<MainScreen mode="dark" zIndex={10} />);
    const mainScreenElement = screen.getByTestId("main-screen");
    expect(mainScreenElement).toHaveStyle({ zIndex: "10" });
  });

  it("renders with transparent class when mode is transparent", () => {
    render(<MainScreen mode="transparent" />);
    expect(screen.getByTestId("main-screen")).toHaveClass("transparent");
  });
});
