import { it, describe, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { PollDisplayDetails } from "./PollDisplayDetails";

describe("PollDisplayDetails", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("displays correct initial state when poll just started", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-09-18T12:00:00.000Z").getTime());

    render(
      <PollDisplayDetails
        pollVoteCount={0}
        postStartDate="2023-09-18T12:00:00.000Z"
        pollLength={{ days: 1, hours: 0, minutes: 0 }}
      />
    );

    expect(screen.getByText("0 votes")).toBeInTheDocument();
    expect(screen.getByText("1d")).toBeInTheDocument();
  });

  it("renders vote count correctly", () => {
    render(
      <PollDisplayDetails
        pollVoteCount={5}
        postStartDate="2023-09-18T12:00:00.000Z"
        pollLength={{ days: 1, hours: 0, minutes: 0 }}
      />
    );
    expect(screen.getByText("5 votes")).toBeInTheDocument();
  });

  it("calculates and displays time remaining correctly", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-09-18T12:00:00.000Z").getTime());

    render(
      <PollDisplayDetails
        pollVoteCount={5}
        postStartDate="2023-09-18T12:00:00.000Z"
        pollLength={{ days: 1, hours: 0, minutes: 0 }}
      />
    );

    expect(screen.getByText("1d")).toBeInTheDocument();
  });

  it("displays hours remaining correctly", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-09-19T11:00:00.000Z").getTime());

    render(
      <PollDisplayDetails
        pollVoteCount={5}
        postStartDate="2023-09-18T12:00:00.000Z"
        pollLength={{ days: 1, hours: 0, minutes: 0 }}
      />
    );

    expect(screen.getByText("1h")).toBeInTheDocument();
  });

  it("displays minutes remaining correctly", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-09-19T11:59:00.000Z").getTime());

    render(
      <PollDisplayDetails
        pollVoteCount={5}
        postStartDate="2023-09-18T12:00:00.000Z"
        pollLength={{ days: 1, hours: 0, minutes: 0 }}
      />
    );

    expect(screen.getByText("1m")).toBeInTheDocument();
  });

  it("displays 'Final results' when poll time is over", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-09-20T12:00:00.000Z").getTime());

    render(
      <PollDisplayDetails
        pollVoteCount={5}
        postStartDate="2023-09-18T12:00:00.000Z"
        pollLength={{ days: 1, hours: 0, minutes: 0 }}
      />
    );

    expect(screen.getByText("Final results")).toBeInTheDocument();
  });
});
