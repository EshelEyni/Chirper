import { it, describe, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Footer } from "./Footer";

describe("Footer", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders children correctly", () => {
    render(<Footer>Some Content</Footer>);
    expect(screen.getByText("Some Content")).toBeInTheDocument();
  });

  it("applies custom class name when provided", () => {
    render(<Footer className="custom-footer">Some Content</Footer>);
    const footerElement = screen.getByText("Some Content");
    expect(footerElement).toHaveClass("custom-footer");
  });
});
