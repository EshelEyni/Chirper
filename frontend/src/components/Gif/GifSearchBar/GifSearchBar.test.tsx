import React from "react";
import { it, describe, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { GifSearchBar } from "./GifSearchBar";

describe("GifSearchBar", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the search bar", () => {
    render(
      <GifSearchBar
        searchTerm=""
        setSearchTerm={() => {
          return;
        }}
        SearchBarInputRef={React.createRef()}
      />
    );
    expect(screen.getByPlaceholderText("Search for GIFs")).toBeInTheDocument();
  });

  it("focuses the search bar on mount, when the search term is empty", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <GifSearchBar
        searchTerm=""
        setSearchTerm={() => {
          return;
        }}
        SearchBarInputRef={ref}
      />
    );
    expect(document.activeElement).toEqual(ref.current);
  });

  it("should focuse on the search bar when the search term is updated", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <GifSearchBar
        searchTerm="test"
        setSearchTerm={() => {
          return;
        }}
        SearchBarInputRef={ref}
      />
    );
    expect(document.activeElement).toEqual(ref.current);
  });

  it("should populate the search bar with the search term", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(
      <GifSearchBar
        searchTerm="test"
        setSearchTerm={() => {
          return;
        }}
        SearchBarInputRef={ref}
      />
    );

    const input = screen.getByPlaceholderText("Search for GIFs");
    expect(input).toHaveValue("test");
  });

  it("Should debounce input changes to update the search term efficiently", () => {
    vi.useFakeTimers();
    const setSearchTerm = vi.fn();
    render(
      <GifSearchBar
        searchTerm=""
        setSearchTerm={setSearchTerm}
        SearchBarInputRef={React.createRef()}
      />
    );
    const input = screen.getByPlaceholderText("Search for GIFs");
    fireEvent.change(input, { target: { value: "test" } });
    vi.advanceTimersByTime(1500);
    expect(setSearchTerm).toHaveBeenCalledWith("test");

    fireEvent.change(input, { target: { value: "test1" } });
    vi.advanceTimersByTime(1500);
    expect(setSearchTerm).toHaveBeenCalledWith("test1");

    vi.useRealTimers();
  });

  it("clears the search term when close icon is clicked", () => {
    const setSearchTerm = vi.fn();
    render(
      <GifSearchBar
        searchTerm="test"
        setSearchTerm={setSearchTerm}
        SearchBarInputRef={React.createRef()}
      />
    );
    const input = screen.getByPlaceholderText("Search for GIFs");
    const closeIcon = screen.getByTestId("gif-search-bar-close-icon");
    fireEvent.mouseDown(closeIcon);
    expect(setSearchTerm).toHaveBeenCalledWith("");
    expect(input).toHaveValue("");
  });
});
