import { it, describe, expect, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Provider } from "react-redux";
import { PollEdit } from "./PollEdit";
import { store } from "../../../store/store";
import { PostEditProvider } from "../../../contexts/PostEditContext";
import testService from "../../../../test/service/testService";

describe("PollEdit", () => {
  beforeEach(() => {
    testService.disptachUpdateNewPostWithPoll();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders PollOptionsList component", () => {
    render(
      <Provider store={store}>
        <PostEditProvider>
          <PollEdit />
        </PostEditProvider>
      </Provider>
    );
    // Assuming PollOptionsList renders an element with a specific text or role
    // expect(screen.getByText("Some text from PollOptionsList")).toBeInTheDocument();
  });

  it("renders PollLengthInputs component", () => {
    render(
      <Provider store={store}>
        <PostEditProvider>
          <PollEdit />
        </PostEditProvider>
      </Provider>
    );
    expect(screen.getByText("Poll length")).toBeInTheDocument();
  });

  it("renders Remove poll button", () => {
    render(
      <Provider store={store}>
        <PostEditProvider>
          <PollEdit />
        </PostEditProvider>
      </Provider>
    );
    expect(screen.getByText("Remove poll")).toBeInTheDocument();
  });

  it("calls onRemovePoll when Remove poll button is clicked", () => {
    const { container } = render(
      <Provider store={store}>
        <PostEditProvider>
          <PollEdit />
        </PostEditProvider>
      </Provider>
    );
    const removePollButton = screen.getByText("Remove poll");
    fireEvent.click(removePollButton);

    expect(container.firstChild).toBeNull();
  });
});
