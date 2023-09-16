import { it, describe, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ExternalLink } from "./ExternalLink";

describe("ExternalLink", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders children correctly", () => {
    render(<ExternalLink link="https://example.com">Click Me</ExternalLink>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("sets href attribute correctly", () => {
    render(<ExternalLink link="https://example.com">Click Me</ExternalLink>);
    expect(screen.getByText("Click Me")).toHaveAttribute("href", "https://example.com");
  });

  it("sets target and rel attributes for security and functionality", () => {
    render(<ExternalLink link="https://example.com">Click Me</ExternalLink>);
    const linkElement = screen.getByText("Click Me");
    expect(linkElement).toHaveAttribute("target", "_blank");
    expect(linkElement).toHaveAttribute("rel", "noopener noreferrer");
  });
});
