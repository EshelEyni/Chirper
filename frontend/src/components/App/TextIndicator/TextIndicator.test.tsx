/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, describe, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { TextIndicator } from "./TextIndicator";
import * as PostEditContextModule from "../../../contexts/PostEditContext";

describe("TextIndicator", () => {
  afterEach(() => {
    cleanup();
  });

  it("displays no text when text length is less than 227", () => {
    const length = 226;
    vi.spyOn(PostEditContextModule, "usePostEdit").mockReturnValue({
      newPostText: generateStrByLength(length),
    } as any);

    render(<TextIndicator />);
    const remainingSpan = screen.queryByTestId("text-indicator-remaining");
    expect(remainingSpan).not.toBeInTheDocument();
  });

  it("displays remaining characters in normal text when text length is between 227 and 247", () => {
    const length = 230;
    vi.spyOn(PostEditContextModule, "usePostEdit").mockReturnValue({
      newPostText: generateStrByLength(length),
    } as any);

    render(<TextIndicator />);

    const remainingSpan = screen.queryByTestId("text-indicator-remaining");

    expect(remainingSpan).toBeInTheDocument();
    expect(remainingSpan).not.toHaveClass("text-danger");
    expect(remainingSpan).toHaveTextContent("17");
  });

  it("displays remaining characters in danger text when text length is 247 or more", () => {
    const length = 250;
    vi.spyOn(PostEditContextModule, "usePostEdit").mockReturnValue({
      newPostText: generateStrByLength(length),
    } as any);

    render(<TextIndicator />);

    const remainingSpan = screen.queryByTestId("text-indicator-remaining");

    expect(remainingSpan).toBeInTheDocument();
    expect(remainingSpan).toHaveClass("text-danger");
    expect(remainingSpan).toHaveTextContent("-3");
  });
});

function generateStrByLength(length: number) {
  return "A".repeat(length);
}

// NOTE: Vitest does not support style testing well. So, we will not test the style of the component.
