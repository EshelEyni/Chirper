import { it, describe, expect, afterEach, vi, Mock } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import postEditSlice from "../../../store/slices/postEditSlice";
import { PollLengthInputs } from "./PollLengthInputs";
import { usePostEdit } from "../../../contexts/PostEditContext";
import testService from "../../../../test/service/testService";

vi.mock("../../../contexts/PostEditContext", () => ({
  usePostEdit: vi.fn(),
}));

const store = configureStore({
  reducer: {
    postEdit: postEditSlice,
  },
});

describe("PollLengthInputs", () => {
  (usePostEdit as Mock).mockReturnValue({
    currNewPost: {
      poll: testService.createTestPoll(),
    },
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the Poll length title", () => {
    render(
      <Provider store={store}>
        <PollLengthInputs />
      </Provider>
    );
    expect(screen.getByText("Poll length")).toBeInTheDocument();
  });

  it("renders CustomSelect components", () => {
    render(
      <Provider store={store}>
        <PollLengthInputs />
      </Provider>
    );
    const customSelects = screen.getAllByTestId("custom-select");
    expect(customSelects.length).toBe(3);
  });

  it.only("disables Hours and Minutes when Days is 7", async () => {
    (usePostEdit as Mock).mockReturnValue({
      currNewPost: {
        poll: testService.createTestPoll({ length: { days: 7, hours: 0, minutes: 0 } }),
      },
    });

    render(
      <Provider store={store}>
        <PollLengthInputs />
      </Provider>
    );

    // await the useEffect hook to finish
    await testService.waitForTick();

    const customSelects = screen.getAllByTestId("custom-select");
    expect(customSelects[1]).toHaveClass("disabled");
    expect(customSelects[2]).toHaveClass("disabled");
  });
});
