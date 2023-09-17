import { it, describe, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { GifPreview } from "./GifPreview";
import { Gif } from "../../../../../shared/types/GIF";
import testService from "../../../../test/service/testService";
import { gifPlaceholderBcg } from "../../../services/GIF/GIFService";

describe("GifPreview", () => {
  const mockGif: Gif = testService.createTestGif();

  afterEach(() => {
    cleanup();
  });

  it("renders the gif-preview element", () => {
    render(
      <GifPreview
        gif={mockGif}
        idx={0}
        width="200px"
        isPlaying={false}
        handleGifClick={() => {
          return;
        }}
      />
    );
    expect(screen.getByTestId("gif-preview")).toBeInTheDocument();
  });

  it("renders the correct image based on isPlaying prop", () => {
    render(
      <GifPreview
        gif={mockGif}
        idx={0}
        width="200px"
        isPlaying={false}
        handleGifClick={() => {
          return;
        }}
      />
    );
    expect(screen.getByAltText(mockGif.description)).toHaveAttribute(
      "src",
      mockGif.staticPlaceholderUrl
    );

    cleanup();

    render(
      <GifPreview
        gif={mockGif}
        idx={0}
        width="200px"
        isPlaying={true}
        handleGifClick={() => {
          return;
        }}
      />
    );
    expect(screen.getByAltText(mockGif.description)).toHaveAttribute("src", mockGif.placeholderUrl);
  });

  it("invokes handleGifClick when clicked", () => {
    const mockHandleGifClick = vi.fn();
    render(
      <GifPreview
        gif={mockGif}
        idx={0}
        width="200px"
        isPlaying={false}
        handleGifClick={mockHandleGifClick}
      />
    );
    fireEvent.click(screen.getByTestId("gif-preview"));
    expect(mockHandleGifClick).toHaveBeenCalledWith(mockGif);
  });

  it("renders the correct width", () => {
    render(
      <GifPreview
        gif={mockGif}
        idx={0}
        width="200px"
        isPlaying={false}
        handleGifClick={() => {
          return;
        }}
      />
    );
    expect(screen.getByAltText(mockGif.description)).toHaveAttribute("width", "200px");
  });

  it("renders the correct background color", () => {
    const idxs = [
      { idx: 0, expectedBcg: gifPlaceholderBcg[0] },
      { idx: 1, expectedBcg: gifPlaceholderBcg[1] },
      { idx: 2, expectedBcg: gifPlaceholderBcg[2] },
      { idx: 3, expectedBcg: gifPlaceholderBcg[3] },
      { idx: 4, expectedBcg: gifPlaceholderBcg[0] },
      { idx: 5, expectedBcg: gifPlaceholderBcg[1] },
      { idx: 6, expectedBcg: gifPlaceholderBcg[2] },
      { idx: 7, expectedBcg: gifPlaceholderBcg[3] },
    ];

    idxs.forEach(idx => {
      render(
        <GifPreview
          gif={mockGif}
          idx={idx.idx}
          width="200px"
          isPlaying={false}
          handleGifClick={() => {
            return;
          }}
        />
      );
      expect(screen.getByTestId("gif-preview")).toHaveStyle({
        backgroundColor: idx.expectedBcg,
      });
      cleanup();
    });
  });
});
