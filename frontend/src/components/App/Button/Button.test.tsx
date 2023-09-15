import { it, describe, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { Button } from "./Button";

describe("Button", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders children correctly", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Button className="custom-button">Click Me</Button>);
    expect(screen.getByText("Click Me")).toHaveClass("custom-button");
  });

  it("disables the button when isDisabled is true", () => {
    render(<Button isDisabled={true}>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeDisabled();
  });

  it("calls onClickFn when clicked", () => {
    const mockClick = vi.fn();
    render(<Button onClickFn={mockClick}>Click Me</Button>);
    fireEvent.click(screen.getByText("Click Me"));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});
