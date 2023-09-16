import { it, describe, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { BtnTogglePlay } from "./BtnTogglePlay";

describe("BtnTogglePlay", () => {
  const setIsPlayingMock = vi.fn();

  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the play icon when not playing", () => {
    render(<BtnTogglePlay isPlaying={false} setIsPlaying={setIsPlayingMock} size={24} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId("btn-toggle-play-play-icon")).toBeInTheDocument();
  });

  it("renders the pause icon when playing", () => {
    render(<BtnTogglePlay isPlaying={true} setIsPlaying={setIsPlayingMock} size={24} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId("btn-toggle-play-pause-icon")).toBeInTheDocument();
  });

  it("toggles between play and pause icons when clicked", () => {
    render(<BtnTogglePlay isPlaying={false} setIsPlaying={setIsPlayingMock} size={24} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(setIsPlayingMock).toHaveBeenCalled();
  });
});
