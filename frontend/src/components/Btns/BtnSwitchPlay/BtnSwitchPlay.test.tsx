import { it, describe, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BtnSwitchPlay } from "./BtnSwitchPlay";

describe("BtnSwitchPlay", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the switch with the correct initial state", () => {
    render(
      <BtnSwitchPlay
        isPlaying={true}
        handleChange={() => {
          return;
        }}
      />
    );
    const switchElement = screen.getByRole("checkbox");
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).toBeChecked();
  });

  it("calls handleChange when the switch is toggled", () => {
    const mockHandleChange = vi.fn();
    render(<BtnSwitchPlay isPlaying={false} handleChange={mockHandleChange} />);
    const switchElement = screen.getByRole("checkbox");
    fireEvent.click(switchElement);
    expect(mockHandleChange).toHaveBeenCalled();
  });
});
