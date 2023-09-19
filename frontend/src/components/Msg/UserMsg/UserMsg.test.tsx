import { it, describe, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import { UserMsg } from "./UserMsg";
import testService from "../../../../test/service/testService";

describe("UserMsg", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders message text correctly", () => {
    const userMsg = testService.createUsrMsg();
    render(
      <MemoryRouter>
        <UserMsg userMsg={userMsg} />
      </MemoryRouter>
    );
    expect(screen.getByText("test user msg")).toBeInTheDocument();
    expect(screen.queryByTestId("user-msg-link")).not.toBeInTheDocument();
    expect(screen.queryByTestId("user-msg-btn")).not.toBeInTheDocument();
  });

  it("renders link correctly and calls onDissmisToast when clicked", () => {
    const mockOnDissmisToast = vi.fn();
    const userMsg = testService.createUsrMsg({ link: { url: "/some-url", text: "Go there" } });

    render(
      <MemoryRouter>
        <UserMsg userMsg={userMsg} onDissmisToast={mockOnDissmisToast} />
      </MemoryRouter>
    );
    const linkElement = screen.getByTestId("user-msg-link");
    expect(linkElement).toBeInTheDocument();
    fireEvent.click(linkElement);
    expect(mockOnDissmisToast).toHaveBeenCalled();
  });

  it("renders button correctly and calls button function and onDissmisToast when clicked", () => {
    const mockOnDissmisToast = vi.fn();
    const mockButtonFn = vi.fn();
    const userMsg = testService.createUsrMsg({ btn: { fn: mockButtonFn, text: "Click me" } });

    render(
      <MemoryRouter>
        <UserMsg userMsg={userMsg} onDissmisToast={mockOnDissmisToast} />
      </MemoryRouter>
    );

    const buttonElement = screen.getByTestId("user-msg-btn");
    expect(buttonElement).toBeInTheDocument();
    fireEvent.click(buttonElement);
    expect(mockButtonFn).toHaveBeenCalled();
    expect(mockOnDissmisToast).toHaveBeenCalled();
  });
});
