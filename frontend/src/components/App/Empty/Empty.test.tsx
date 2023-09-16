import { it, describe, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Empty } from "./Empty";
import "@testing-library/jest-dom/vitest";

describe("Empty", () => {
  it("renders the correct text based on entityName prop", () => {
    render(<Empty entityName="Item" />);
    expect(screen.getByText("No Item could be found...")).toBeInTheDocument();
  });
});
