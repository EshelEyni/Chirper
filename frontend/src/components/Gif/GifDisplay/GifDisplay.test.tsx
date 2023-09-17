import { it, describe, expect, afterEach, vi, Mock, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { GifDisplay } from "./GifDisplay";
import { Gif } from "../../../../../shared/types/GIF";
import { useInView } from "react-intersection-observer";
import testService from "../../../../test/service/testService";

vi.mock("react-intersection-observer", () => ({
  useInView: vi.fn(),
}));

describe("GifDisplay", () => {
  const gif: Gif = testService.createTestGif();

  beforeEach(() => {
    mockUseInView();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the GIF with autoplay by default, triggers play when in view", () => {
    const { rerender } = render(<GifDisplay gif={gif} />);
    const imgElement = screen.getByRole("img");
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute("src", gif.staticUrl);

    mockUseInView(true);
    rerender(<GifDisplay gif={gif} />);
    expect(imgElement).toHaveAttribute("src", gif.url);
  });

  it("renders the static GIF when isAutoPlay is false, does not trigger play when in view", () => {
    const { rerender } = render(<GifDisplay gif={gif} isAutoPlay={false} />);
    const imgElement = screen.getByRole("img");
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute("src", gif.staticUrl);

    // mocking the behavior of the GIF being in view when autoplay is false
    mockUseInView(false);
    rerender(<GifDisplay gif={gif} isAutoPlay={false} />);
    expect(imgElement).toHaveAttribute("src", gif.staticUrl);
  });

  it("toggles GIF play state when clicked", () => {
    mockUseInView(true);
    render(<GifDisplay gif={gif} />);
    const imgElement = screen.getByRole("img");
    fireEvent.click(imgElement);
    expect(imgElement).toHaveAttribute("src", gif.staticUrl);
    fireEvent.click(imgElement);
    expect(imgElement).toHaveAttribute("src", gif.url);
    fireEvent.click(imgElement);
    expect(imgElement).toHaveAttribute("src", gif.staticUrl);
  });

  it("shows the description modal when ALT button is clicked", () => {
    render(
      <div id="app">
        <GifDisplay gif={gif} />
      </div>
    );
    const altButton = screen.getByText("ALT");
    fireEvent.click(altButton);
    const modal = screen.getByTestId("modal-window");
    expect(modal).toBeInTheDocument();
    expect(screen.getByText("Image description")).toBeInTheDocument();
    expect(screen.getByText(gif.description)).toBeInTheDocument();
  });

  it("closes the description modal when Dismiss button is clicked", () => {
    render(
      <div id="app">
        <GifDisplay gif={gif} />
      </div>
    );
    const altButton = screen.getByText("ALT");
    fireEvent.click(altButton);
    const dismissButton = screen.getByText("Dismiss");
    fireEvent.click(dismissButton);
    const modal = screen.queryByRole("dialog");
    expect(modal).not.toBeInTheDocument();
  });
});

function mockUseInView(inView = false) {
  (useInView as Mock).mockReturnValue({
    ref: vi.fn(),
    inView,
  });
}
