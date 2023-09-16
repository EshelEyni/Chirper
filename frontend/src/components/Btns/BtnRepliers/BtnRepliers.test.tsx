/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, describe, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BtnRepliers } from "./BtnRepliers";
import * as PostEditContextModule from "../../../contexts/PostEditContext";
import { Provider } from "react-redux";
import { store } from "../../../store/store";

describe("BtnRepliers", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the button with the correct initial title", () => {
    setSpyUsePostEdit();

    render(
      <Provider store={store}>
        <div id="app">
          <BtnRepliers />
        </div>
      </Provider>
    );

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(screen.getByText("Everyone can reply")).toBeInTheDocument();
  });

  it("renders the modal after clicking the button", () => {
    setSpyUsePostEdit();

    render(
      <Provider store={store}>
        <div id="app">
          <BtnRepliers />
        </div>
      </Provider>
    );

    fireEvent.click(screen.getByRole("button"));
    const modal = screen.getByTestId("modal-window");
    expect(modal).toBeInTheDocument();
  });

  it("renders the modal with the correct options", () => {
    setSpyUsePostEdit();

    render(
      <Provider store={store}>
        <div id="app">
          <BtnRepliers />
        </div>
      </Provider>
    );

    fireEvent.click(screen.getByRole("button"));
    const modal = screen.getByTestId("modal-window");
    expect(within(modal).getByText("Everyone")).toBeInTheDocument();
    expect(within(modal).getByText("Only people you follow")).toBeInTheDocument();
    expect(within(modal).getByText("Only people you mentioned")).toBeInTheDocument();
  });

  it("should update current post repliers type after a click on Everyone option", () => {
    setSpyUsePostEdit();

    const { rerender } = render(
      <Provider store={store}>
        <div id="app">
          <BtnRepliers />
        </div>
      </Provider>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    const modal = screen.getByTestId("modal-window");
    fireEvent.click(within(modal).getByText("Everyone"));
    const updatedPost = getCurrNewPostFromStore();
    expect(updatedPost.repliersType).toBe("everyone");

    setSpyUsePostEdit();

    rerender(
      <Provider store={store}>
        <div id="app">
          <BtnRepliers />
        </div>
      </Provider>
    );

    expect(button).toHaveTextContent("Everyone can reply");
  });

  it("should update current post repliers type after a click on followed option", () => {
    setSpyUsePostEdit();

    const { rerender } = render(
      <Provider store={store}>
        <div id="app">
          <BtnRepliers />
        </div>
      </Provider>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    const modal = screen.getByTestId("modal-window");
    fireEvent.click(within(modal).getByText("Only people you follow"));
    const updatedPost = getCurrNewPostFromStore();
    expect(updatedPost.repliersType).toBe("followed");

    setSpyUsePostEdit();

    rerender(
      <Provider store={store}>
        <div id="app">
          <BtnRepliers />
        </div>
      </Provider>
    );

    expect(button).toHaveTextContent("Only people you follow can reply");
  });

  it("should update current post repliers type after a click on mentioned option", () => {
    setSpyUsePostEdit();

    const { rerender } = render(
      <Provider store={store}>
        <div id="app">
          <BtnRepliers />
        </div>
      </Provider>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    const modal = screen.getByTestId("modal-window");
    fireEvent.click(within(modal).getByText("Only people you mentioned"));
    const updatedPost = getCurrNewPostFromStore();
    expect(updatedPost.repliersType).toBe("mentioned");

    setSpyUsePostEdit();

    rerender(
      <Provider store={store}>
        <div id="app">
          <BtnRepliers />
        </div>
      </Provider>
    );

    expect(button).toHaveTextContent("Only people you mentioned can reply");
  });

  it("should close the modal after a click on an option", () => {
    setSpyUsePostEdit();

    render(
      <Provider store={store}>
        <div id="app">
          <BtnRepliers />
        </div>
      </Provider>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    const modal = screen.getByTestId("modal-window");
    fireEvent.click(within(modal).getByText("Everyone"));
    expect(modal).not.toBeInTheDocument();
  });
});

function getCurrNewPostFromStore() {
  const state = store.getState();
  return state.postEdit.homePage.posts[0];
}

function setSpyUsePostEdit() {
  vi.spyOn(PostEditContextModule, "usePostEdit").mockReturnValue({
    currNewPost: getCurrNewPostFromStore(),
  } as any);
}
