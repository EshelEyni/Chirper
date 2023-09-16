import { it, describe, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BtnRemoveContent } from "./BtnRemoveContent";

describe("BtnRemoveContent", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the remove content button", () => {
    render(
      <BtnRemoveContent
        onRemoveContent={() => {
          return;
        }}
      />
    );
    const removeButton = screen.getByRole("button");
    expect(removeButton).toBeInTheDocument();
  });

  it("calls onRemoveContent when clicked", () => {
    const mockRemoveContent = vi.fn();
    render(<BtnRemoveContent onRemoveContent={mockRemoveContent} />);
    const removeButton = screen.getByRole("button");
    fireEvent.click(removeButton);
    expect(mockRemoveContent).toHaveBeenCalled();
  });
});
