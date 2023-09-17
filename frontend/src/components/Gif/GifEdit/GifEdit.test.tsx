import { it, describe, expect, afterEach, vi, Mock, beforeAll } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { GifEdit } from "./GifEdit";
import { usePostEdit } from "../../../contexts/PostEditContext";
import { useDispatch } from "react-redux";
import testService from "../../../../test/service/testService";
import { Gif } from "../../../../../shared/types/GIF";

vi.mock("react-redux", () => ({
  useDispatch: vi.fn(),
}));

vi.mock("../../../contexts/PostEditContext", () => ({
  usePostEdit: vi.fn(),
}));

describe("GifEdit", () => {
  let mockDispatch: Mock;
  let testGif: Gif;

  beforeAll(() => {
    mockDispatch = vi.fn();
    testGif = testService.createTestGif();
    (useDispatch as Mock).mockReturnValue(mockDispatch);

    (usePostEdit as Mock).mockReturnValue({
      currNewPost: {
        gif: testGif,
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders SpinnerLoader when isLoading is true", () => {
    render(<GifEdit />);
    expect(screen.getByTestId("spinner-loader")).toBeInTheDocument();
  });

  it("renders gif-edit div when isLoading is false", () => {
    render(<GifEdit />);

    const gifEdit = screen.getByTestId("gif-edit");
    expect(gifEdit).toBeInTheDocument();
    expect(gifEdit.style.visibility).toBe("hidden");
    const imgElement = screen.getByTestId("gif-edit-img");
    fireEvent.load(imgElement);
    expect(gifEdit.style.visibility).toBe("visible");
  });

  it("toggles gif urls when image is clicked", () => {
    render(<GifEdit />);
    const imgElement = screen.getByTestId("gif-edit-img");
    fireEvent.load(imgElement);

    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute("src", testGif.staticUrl);

    fireEvent.click(imgElement);
    expect(imgElement).toHaveAttribute("src", testGif.url);

    fireEvent.click(imgElement);
    expect(imgElement).toHaveAttribute("src", testGif.staticUrl);
  });

  it("toggles play  button rendering when image is clicked", () => {
    render(<GifEdit />);
    const imgElement = screen.getByTestId("gif-edit-img");
    const playBtnByTestId = () => screen.queryByTestId("btn-play");
    fireEvent.load(imgElement);

    expect(playBtnByTestId()).toBeInTheDocument();

    fireEvent.click(imgElement);
    expect(playBtnByTestId()).not.toBeInTheDocument();

    fireEvent.click(imgElement);
    expect(playBtnByTestId()).toBeInTheDocument();
  });

  it("removes gif when BtnRemoveContent is clicked", () => {
    render(<GifEdit />);
    const btnRemove = screen.getByTestId("btn-remove-content");

    fireEvent.click(btnRemove);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("renders gif title", () => {
    render(<GifEdit />);
    expect(screen.getByText("GIF")).toBeInTheDocument();
  });
});
