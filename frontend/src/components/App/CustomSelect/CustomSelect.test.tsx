import { it, describe, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { CustomSelect } from "./CustomSelect";

describe("CustomSelect", () => {
  const mockOnFocused = vi.fn();
  const mockOnBlurred = vi.fn();
  const mockOnSelected = vi.fn();
  const mockOnToggleDropdown = vi.fn();

  const inputProps = {
    label: "Test Label",
    type: "testType",
    value: "Test Value",
    isDisabled: false,
    isFocused: false,
    isDropdownOpen: false,
    selectValues: ["Option 1", "Option 2"],
  };

  beforeEach(() => {
    render(
      <CustomSelect
        input={inputProps}
        onFocused={mockOnFocused}
        onBlurred={mockOnBlurred}
        onSelected={mockOnSelected}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );
  });

  afterEach(() => {
    cleanup();
    mockOnFocused.mockReset();
    mockOnBlurred.mockReset();
    mockOnSelected.mockReset();
    mockOnToggleDropdown.mockReset();
  });

  it("renders correctly", () => {
    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("Test Value")).toBeInTheDocument();
  });

  it("gets focused when clicked", () => {
    fireEvent.focus(screen.getByText("Test Label"));
    expect(mockOnFocused).toHaveBeenCalledWith("testType");
  });

  it("opens dropdown when clicked", () => {
    fireEvent.click(screen.getByText("Test Label"));
    expect(mockOnToggleDropdown).toHaveBeenCalledWith("testType");
  });

  it("closes dropdown when blurred", () => {
    fireEvent.blur(screen.getByText("Test Label"));
    expect(mockOnBlurred).toHaveBeenCalledWith("testType");
  });

  it("is disabled when isDisabled is true", () => {
    cleanup();
    render(
      <CustomSelect
        input={{ ...inputProps, isDisabled: true }}
        onFocused={mockOnFocused}
        onBlurred={mockOnBlurred}
        onSelected={mockOnSelected}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    expect(screen.getByTestId("custom-select")).toHaveClass("disabled");
  });

  it("renders dropdown items correctly", async () => {
    fireEvent.click(screen.getByText("Test Label"));
    expect(mockOnToggleDropdown).toHaveBeenCalledWith("testType");

    cleanup();
    render(
      <CustomSelect
        input={{ ...inputProps, isDropdownOpen: true }}
        onFocused={mockOnFocused}
        onBlurred={mockOnBlurred}
        onSelected={mockOnSelected}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    const option1 = await screen.findByText("Option 1");
    const option2 = await screen.findByText("Option 2");
    expect(option1).toBeInTheDocument();
    expect(option2).toBeInTheDocument();
  });

  it("calls onSelected when a dropdown item is clicked", () => {
    cleanup();
    render(
      <CustomSelect
        input={{ ...inputProps, isDropdownOpen: true }}
        onFocused={mockOnFocused}
        onBlurred={mockOnBlurred}
        onSelected={mockOnSelected}
        onToggleDropdown={mockOnToggleDropdown}
      />
    );

    fireEvent.click(screen.getByText("Option 1"));
    expect(mockOnSelected).toHaveBeenCalledWith(expect.anything(), "Option 1", "testType");
  });
});
