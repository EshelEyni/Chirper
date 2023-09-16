import { it, describe, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BtnClose } from "./BtnClose";

describe("BtnClose", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the close button", () => {
    render(
      <BtnClose
        onClickBtn={() => {
          return;
        }}
      />
    );
    const closeButton = screen.getByRole("button");
    expect(closeButton).toBeInTheDocument();
  });

  it("calls onClickBtn when clicked", () => {
    const mockOnClick = vi.fn();
    render(<BtnClose onClickBtn={mockOnClick} />);
    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
