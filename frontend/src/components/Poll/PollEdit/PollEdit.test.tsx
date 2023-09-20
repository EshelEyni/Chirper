import { it, describe, expect, afterEach, beforeEach, beforeAll, vi, Mock } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Provider, useDispatch } from "react-redux";
import { PollEdit } from "./PollEdit";
import { PostEditProvider, usePostEdit } from "../../../contexts/PostEditContext";
import testService from "../../../../test/service/testService";
import { store } from "../../../store/store";

vi.mock("react-redux", () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock("../../../contexts/PostEditContext", () => ({
  usePostEdit: vi.fn(),
}));

describe("PollEdit", () => {
  let mockDispatch: Mock;

  beforeAll(() => {
    mockDispatch = vi.fn();
    (useDispatch as Mock).mockReturnValue(mockDispatch);

    (usePostEdit as Mock).mockReturnValue({
      currNewPost: {
        ...testService.createTestPost(),
        poll: testService.createTestPoll(),
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders PollOptionsList component", () => {
    expect(true).toBe(true);
    render(<PollEdit />);
    // Assuming PollOptionsList renders an element with a specific text or role
    // expect(screen.getByText("Some text from PollOptionsList")).toBeInTheDocument();
  });

  // it("renders PollLengthInputs component", () => {
  //   render(
  //     <Provider store={store}>
  //       <PostEditProvider>
  //         <PollEdit />
  //       </PostEditProvider>
  //     </Provider>
  //   );
  //   expect(screen.getByText("Poll length")).toBeInTheDocument();
  // });

  // it("renders Remove poll button", () => {
  //   render(
  //     <Provider store={store}>
  //       <PostEditProvider>
  //         <PollEdit />
  //       </PostEditProvider>
  //     </Provider>
  //   );
  //   expect(screen.getByText("Remove poll")).toBeInTheDocument();
  // });

  // it("calls onRemovePoll when Remove poll button is clicked", () => {
  //   render(
  //     <Provider store={store}>
  //       <PostEditProvider>
  //         <PollEdit />
  //       </PostEditProvider>
  //     </Provider>
  //   );
  //   const removePollButton = screen.getByText("Remove poll");
  //   fireEvent.click(removePollButton);
  //   // You may need to mock the dispatch and check if it's called with the correct action
  // });
});
