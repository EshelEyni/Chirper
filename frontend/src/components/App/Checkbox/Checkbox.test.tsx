import { it, describe, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders checked state", () => {
    render(<Checkbox isChecked={true} />);
    const checkboxElement = screen.getByTestId("checkbox");
    expect(checkboxElement).toHaveClass("checked");
    expect(screen.getByTestId("checkbox-icon")).toBeInTheDocument();
  });

  it("renders unchecked state", () => {
    render(<Checkbox isChecked={false} />);
    const checkboxElement = screen.getByTestId("checkbox");
    expect(checkboxElement).toHaveClass("unchecked");
    expect(screen.queryByTestId("checkbox-icon")).not.toBeInTheDocument();
  });
});
