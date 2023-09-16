import { it, describe, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BtnToggleFollow } from "./BtnToggleFollow";
import testService from "../../../../test/service/testService";

describe("BtnToggleFollow", () => {
  const mockHandleBtnClick = vi.fn();

  const user = testService.createTestUser();

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it("renders the button with the text 'Follow' when not following", () => {
    render(<BtnToggleFollow user={user} handleBtnClick={mockHandleBtnClick} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Follow");
  });

  it("renders the button with the text 'Following' when following", () => {
    const followingUser = { ...user, isFollowing: true };
    render(<BtnToggleFollow user={followingUser} handleBtnClick={mockHandleBtnClick} />);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Following");
  });

  it("changes the button text to 'Unfollow' on hover when following", () => {
    const followingUser = { ...user, isFollowing: true };
    render(<BtnToggleFollow user={followingUser} handleBtnClick={mockHandleBtnClick} />);
    const button = screen.getByRole("button");
    fireEvent.mouseEnter(button);
    expect(button).toHaveTextContent("Unfollow");
  });

  it("changes the button text back to 'Following' on mouse leave when following", () => {
    const followingUser = { ...user, isFollowing: true };
    render(<BtnToggleFollow user={followingUser} handleBtnClick={mockHandleBtnClick} />);
    const button = screen.getByRole("button");
    fireEvent.mouseEnter(button);
    expect(button).toHaveTextContent("Unfollow");
    fireEvent.mouseLeave(button);
    expect(button).toHaveTextContent("Following");
  });

  it("calls handleBtnClick when clicked", () => {
    render(<BtnToggleFollow user={user} handleBtnClick={mockHandleBtnClick} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(mockHandleBtnClick).toHaveBeenCalled();
  });
});
