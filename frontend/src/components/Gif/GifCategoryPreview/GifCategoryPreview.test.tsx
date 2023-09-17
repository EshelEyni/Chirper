import { it, describe, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { GifCategoryPreview } from "./GifCategoryPreview";
import { GifCategory } from "../../../../../shared/types/GIF";

describe("GifCategoryPreview", () => {
  const handleCategoryClickMock = vi.fn();
  const gifCategory: GifCategory = {
    id: "1",
    name: "Funny",
    imgUrl: "https://example.com/funny.gif",
    sortOrder: 1,
  };

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the gif category image and title", () => {
    render(
      <GifCategoryPreview
        gifCategory={gifCategory}
        isLast={false}
        handleCategoryClick={handleCategoryClickMock}
      />
    );

    const imgElement = screen.getByRole("img");
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute("src", gifCategory.imgUrl);
    expect(imgElement).toHaveAttribute("alt", "gif-category");

    const titleElement = screen.getByRole("heading");
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent(gifCategory.name);
  });

  it("adds 'last' class when isLast is true", () => {
    render(
      <GifCategoryPreview
        gifCategory={gifCategory}
        isLast={true}
        handleCategoryClick={handleCategoryClickMock}
      />
    );

    const divElement = screen.getByRole("img").parentElement;
    expect(divElement).toHaveClass("last");
  });

  it("calls handleCategoryClick with the correct category name when clicked", () => {
    render(
      <GifCategoryPreview
        gifCategory={gifCategory}
        isLast={false}
        handleCategoryClick={handleCategoryClickMock}
      />
    );

    const divElement = screen.getByRole("img").parentElement;
    fireEvent.click(divElement as HTMLElement);
    expect(handleCategoryClickMock).toHaveBeenCalledWith(gifCategory.name);
  });
});
