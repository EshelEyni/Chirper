import { it, describe, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { ErrorFallBack } from "./ErrorFallBack";

describe("ErrorFallBack", () => {
  const mockResetErrorBoundary = vi.fn();
  const mockReload = vi.fn();

  // Mock window.location.reload
  Object.defineProperty(window, "location", {
    value: { reload: mockReload },
    writable: true,
  });

  const error = new Error("Test error message");
  error.stack = "Test error stack";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders error messages correctly", () => {
    render(<ErrorFallBack error={error} resetErrorBoundary={mockResetErrorBoundary} />);
    expect(screen.getByText("Oops! Something went wrong.")).toBeInTheDocument();
  });

  it("does not render error details in production environment", () => {
    process.env.NODE_ENV = "production";
    render(<ErrorFallBack error={error} resetErrorBoundary={mockResetErrorBoundary} />);
    expect(screen.queryByText("Details")).not.toBeInTheDocument();
  });

  it("renders error details in development environment", () => {
    process.env.NODE_ENV = "development";
    render(<ErrorFallBack error={error} resetErrorBoundary={mockResetErrorBoundary} />);
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
    expect(screen.getByText("Test error stack")).toBeInTheDocument();
  });

  it("calls window.location.reload when Reload button is clicked", () => {
    render(<ErrorFallBack error={error} resetErrorBoundary={mockResetErrorBoundary} />);
    fireEvent.click(screen.getByText("Reload"));
    expect(mockReload).toHaveBeenCalled();
  });

  it("calls resetErrorBoundary when Home button is clicked", () => {
    render(<ErrorFallBack error={error} resetErrorBoundary={mockResetErrorBoundary} />);
    fireEvent.click(screen.getByText("Home"));
    expect(mockResetErrorBoundary).toHaveBeenCalled();
  });
});
