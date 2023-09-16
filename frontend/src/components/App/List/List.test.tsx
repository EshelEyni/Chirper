import { it, describe, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { List } from "./List";

describe("List", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders list items correctly", () => {
    const items = [1, 2, 3];
    render(<List items={items} render={item => <div>{item}</div>} />);
    items.forEach(item => {
      expect(screen.getByText(item.toString())).toBeInTheDocument();
    });
  });

  it("applies custom class name when provided", () => {
    const items = [1, 2, 3];
    render(<List className="custom-list" items={items} render={item => <div>{item}</div>} />);
    const listElement = screen.getByText("1").closest("section");
    expect(listElement).toHaveClass("custom-list");
  });
});
