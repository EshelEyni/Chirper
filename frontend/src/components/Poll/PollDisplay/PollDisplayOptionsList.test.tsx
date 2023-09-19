import { it, describe, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { PollDisplayOptionsList } from "./PollDisplayOptionsList";

describe("PollDisplayOptionsList", () => {
  const options = [
    { text: "Option 1", voteCount: 5, isLoggedInUserVoted: false },
    { text: "Option 2", voteCount: 3, isLoggedInUserVoted: false },
  ];

  const mockOnVote = vi.fn();

  afterEach(() => {
    cleanup();
  });

  it("renders PollDisplayOptionResult components when isVotingOff is true", () => {
    render(
      <PollDisplayOptionsList
        isVotingOff={true}
        pollVoteCount={8}
        options={options}
        onVote={mockOnVote}
      />
    );

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();

    const optionElements = screen.getAllByTestId("poll-display-option-result");
    expect(optionElements).toHaveLength(2);
  });

  it("renders PollDisplayOption components when isVotingOff is false", () => {
    render(
      <PollDisplayOptionsList
        isVotingOff={false}
        pollVoteCount={8}
        options={options}
        onVote={mockOnVote}
      />
    );

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();

    const optionElements = screen.getAllByTestId("poll-display-option");
    expect(optionElements).toHaveLength(2);
  });

  it("calls onVote with correct index when PollDisplayOption is clicked", () => {
    render(
      <PollDisplayOptionsList
        isVotingOff={false}
        pollVoteCount={8}
        options={options}
        onVote={mockOnVote}
      />
    );

    const { text } = options[0];

    const listItem = screen.getByText(text).closest("li");
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    fireEvent.click(listItem!);

    expect(mockOnVote).toHaveBeenCalledWith(0);
  });
});
