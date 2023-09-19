import { it, describe, expect, afterEach, vi, Mock } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { PollDisplay } from "./PollDisplay";
import { useAddPollVote } from "../../../hooks/useAddPollVote";
import { usePostPreview } from "../../../contexts/PostPreviewContext";
import testService from "../../../../test/service/testService";

vi.mock("../../../hooks/useAddPollVote", () => ({ useAddPollVote: vi.fn() }));
vi.mock("../../../contexts/PostPreviewContext", () => ({ usePostPreview: vi.fn() }));

describe("PollDisplay", () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  const mockAddPollVote = vi.fn();
  const mockPostPreview = {
    post: {
      id: "1",
      poll: testService.createTestPoll(),
    },
  };

  (useAddPollVote as Mock).mockReturnValue({ addPollVote: mockAddPollVote });
  (usePostPreview as Mock).mockReturnValue(mockPostPreview);

  it("renders PollDisplayOptionsList and PollDisplayDetails", () => {
    render(<PollDisplay />);

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("8 votes")).toBeInTheDocument();
  });

  it("returns null when post available", () => {
    (usePostPreview as Mock).mockReturnValueOnce({ post: null });
    const { container } = render(<PollDisplay />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when post does not have a poll", () => {
    (usePostPreview as Mock).mockReturnValueOnce({ post: { id: "1" } });
    const { container } = render(<PollDisplay />);
    expect(container.firstChild).toBeNull();
  });

  it("calls addPollVote when an option is clicked", () => {
    render(<PollDisplay />);

    const option1 = screen.getByText("Option 1");
    fireEvent.click(option1);

    expect(mockAddPollVote).toHaveBeenCalledWith({ postId: "1", optionIdx: 0 });
  });

  it("calls addPollVote with correct arguments when an option is clicked", () => {
    render(<PollDisplay />);

    const firstOption = screen.getByText("Option 1");
    fireEvent.click(firstOption);

    expect(mockAddPollVote).toHaveBeenCalledWith({ postId: "1", optionIdx: 0 });
  });

  it("updates vote count after a vote is cast", () => {
    const { rerender } = render(<PollDisplay />);

    expect(screen.getByText("8 votes")).toBeInTheDocument();

    mockPostPreview.post.poll.options[0].voteCount = 6;

    rerender(<PollDisplay />);
    expect(screen.getByText("9 votes")).toBeInTheDocument();
  });
});
