import { it, describe, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ErrorMsg } from "./ErrorMsg";

describe("ErrorMsg", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders error message correctly", () => {
    render(<ErrorMsg msg="An error occurred" />);
    expect(screen.getByText("An error occurred")).toBeInTheDocument();
  });

  it("applies the correct class to the paragraph", () => {
    render(<ErrorMsg msg="Another error" />);
    const errorMsgElement = screen.getByText("Another error");
    expect(errorMsgElement).toHaveClass("error-msg");
  });
});
