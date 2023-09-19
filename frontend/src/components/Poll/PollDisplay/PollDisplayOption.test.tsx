import { it, describe, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { PollDisplayOption } from "./PollDisplayOption";

describe("PollDisplayOption", () => {
  const option = { text: "Option 1", voteCount: 5, isLoggedInUserVoted: false };
  const idx = 0;
  const mockOnVote = vi.fn();

  afterEach(() => {
    cleanup();
  });

  it("renders option text correctly", () => {
    render(<PollDisplayOption option={option} idx={idx} onVote={mockOnVote} />);
    expect(screen.getByText("Option 1")).toBeInTheDocument();
  });

  it("calls onVote with correct index when clicked", () => {
    render(<PollDisplayOption option={option} idx={idx} onVote={mockOnVote} />);

    fireEvent.click(screen.getByTestId("poll-display-option"));
    expect(mockOnVote).toHaveBeenCalledWith(idx);
  });
});
