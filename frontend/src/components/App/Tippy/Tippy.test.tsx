import { it, describe, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Tippy } from "./Tippy";

describe("Tippy", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders with 'tippy up' class when isModalAbove is false", () => {
    render(<Tippy isModalAbove={false} />);
    const tippyElement = screen.getByTestId("tippy");
    expect(tippyElement).toBeInTheDocument();
    expect(tippyElement).toHaveClass("tippy");
    expect(tippyElement).toHaveClass("up");
  });

  it("renders with 'tippy down' class when isModalAbove is true", () => {
    render(<Tippy isModalAbove={true} />);
    const tippyElement = screen.getByTestId("tippy");
    expect(tippyElement).toBeInTheDocument();
    expect(tippyElement).toHaveClass("tippy");
    expect(tippyElement).toHaveClass("down");
  });

  it("renders with 'full-screen' class when isFullScreen is true", () => {
    render(<Tippy isModalAbove={true} isFullScreen={true} />);
    const tippyElement = screen.getByTestId("tippy");
    expect(tippyElement).toBeInTheDocument();
    expect(tippyElement).toHaveClass("full-screen");
  });

  it("does not render with 'full-screen' class when isFullScreen is false", () => {
    render(<Tippy isModalAbove={true} isFullScreen={false} />);
    const tippyElement = screen.getByTestId("tippy");
    expect(tippyElement).not.toHaveClass("full-screen");
  });
});
