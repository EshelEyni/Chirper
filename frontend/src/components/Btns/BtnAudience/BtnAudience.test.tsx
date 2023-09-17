/* eslint-disable @typescript-eslint/no-explicit-any */
import { it, describe, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BtnAudience } from "./BtnAudience";
import { Provider } from "react-redux";
import { store } from "../../../store/store";
import testService from "../../../../test/service/testService";

describe("BtnAudience", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the button with the correct initial title", () => {
    testService.setSpyUsePostEdit();

    // Wrap the BtnAudience component with a div having an id of "app".
    // This is necessary because the Modal component uses a portal to attach itself to this root element.
    render(
      <Provider store={store}>
        <div id="app">
          <BtnAudience />
        </div>
      </Provider>
    );
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(screen.getByText("Everyone")).toBeInTheDocument();
  });

  it("renders the modal after clicking the button", () => {
    testService.setSpyUsePostEdit();

    render(
      <Provider store={store}>
        <div id="app">
          <BtnAudience />
        </div>
      </Provider>
    );

    fireEvent.click(screen.getByRole("button"));
    const modal = screen.getByTestId("modal-window");
    expect(modal).toBeInTheDocument();
  });

  it("renders the modal with the correct options", () => {
    testService.setSpyUsePostEdit();

    render(
      <Provider store={store}>
        <div id="app">
          <BtnAudience />
        </div>
      </Provider>
    );

    fireEvent.click(screen.getByRole("button"));
    const modal = screen.getByTestId("modal-window");
    expect(within(modal).getByText("Everyone")).toBeInTheDocument();
    expect(within(modal).getByText("Chirper Circle")).toBeInTheDocument();
  });

  it("should update current post audience type after a click on Everyone option", () => {
    testService.setSpyUsePostEdit();

    const { rerender } = render(
      <Provider store={store}>
        <div id="app">
          <BtnAudience />
        </div>
      </Provider>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    const modal = screen.getByTestId("modal-window");
    fireEvent.click(within(modal).getByText("Everyone"));
    const updatedPost = testService.getCurrNewPostFromStore();
    expect(updatedPost.audience).toBe("everyone");

    testService.setSpyUsePostEdit();

    rerender(
      <Provider store={store}>
        <div id="app">
          <BtnAudience />
        </div>
      </Provider>
    );

    expect(button).toHaveTextContent("Everyone");
  });

  it("should update current post audience type after a click on Chirper Circle option", () => {
    testService.setSpyUsePostEdit();

    const { rerender } = render(
      <Provider store={store}>
        <div id="app">
          <BtnAudience />
        </div>
      </Provider>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    const modal = screen.getByTestId("modal-window");
    fireEvent.click(within(modal).getByText("Chirper Circle"));
    const updatedPost = testService.getCurrNewPostFromStore();
    expect(updatedPost.audience).toBe("chirper-circle");

    testService.setSpyUsePostEdit();

    rerender(
      <Provider store={store}>
        <div id="app">
          <BtnAudience />
        </div>
      </Provider>
    );

    expect(button).toHaveTextContent("Chirper Circle");
  });

  it("should close the modal after a click on an option", () => {
    testService.setSpyUsePostEdit();

    render(
      <Provider store={store}>
        <div id="app">
          <BtnAudience />
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
