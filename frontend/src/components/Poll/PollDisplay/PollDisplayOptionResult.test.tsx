import { it, describe, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { PollDisplayOptionResult } from "./PollDisplayOptionResult";

describe("PollDisplayOptionResult", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders option text and percentage correctly", () => {
    const option = { text: "Option 1", voteCount: 5, isLoggedInUserVoted: false };
    const pollVoteCount = 10;
    render(<PollDisplayOptionResult option={option} pollVoteCount={pollVoteCount} />);
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("sets the progress bar width to a minimum of 1% when vote count is zero", () => {
    const option = { text: "Option 1", voteCount: 0, isLoggedInUserVoted: false };
    const pollVoteCount = 10;
    render(<PollDisplayOptionResult option={option} pollVoteCount={pollVoteCount} />);

    const progressBar = screen.getByTestId("poll-display-option-result-progress-bar");
    expect(progressBar).toHaveStyle({ width: "1%" });
  });

  it("sets the progress bar width correctly based on percentage", () => {
    const option = { text: "Option 1", voteCount: 5, isLoggedInUserVoted: false };
    const pollVoteCount = 10;
    render(<PollDisplayOptionResult option={option} pollVoteCount={pollVoteCount} />);

    const progressBar = screen.getByTestId("poll-display-option-result-progress-bar");
    expect(progressBar).toHaveStyle({ width: "50%" });
  });

  it("renders check icon when isLoggedInUserVoted is true", () => {
    const option = { text: "Option 1", voteCount: 5, isLoggedInUserVoted: true };
    const pollVoteCount = 10;
    render(<PollDisplayOptionResult option={option} pollVoteCount={pollVoteCount} />);
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByTestId("poll-display-option-result-check-icon")).toBeInTheDocument();
  });

  it("calculates percentage correctly when pollVoteCount is zero", () => {
    const option = { text: "Option 1", voteCount: 0, isLoggedInUserVoted: false };
    const pollVoteCount = 0;
    render(<PollDisplayOptionResult option={option} pollVoteCount={pollVoteCount} />);
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
