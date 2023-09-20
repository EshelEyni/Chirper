import { it, describe, expect, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Provider } from "react-redux";
import { PollLengthInputs } from "./PollLengthInputs";
import { PostEditProvider } from "../../../contexts/PostEditContext";
import testService from "../../../../test/service/testService";
import { store } from "../../../store/store";

describe.skip("PollLengthInputs", () => {
  beforeEach(() => {
    testService.disptachUpdateNewPostWithPoll();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the Poll length title", () => {
    render(
      <Provider store={store}>
        <PostEditProvider>
          <PollLengthInputs />
        </PostEditProvider>
      </Provider>
    );
    expect(screen.getByText("Poll length")).toBeInTheDocument();
  });

  it("renders CustomSelect components", () => {
    render(
      <Provider store={store}>
        <PostEditProvider>
          <PollLengthInputs />
        </PostEditProvider>
      </Provider>
    );
    const customSelects = screen.getAllByTestId("custom-select");
    expect(customSelects.length).toBe(3);
  });

  it("disables Hours and Minutes when Days is 7", async () => {
    testService.disptachUpdateNewPostWithPoll(
      testService.createTestPoll({ length: { days: 7, hours: 0, minutes: 0 } })
    );

    render(
      <Provider store={store}>
        <PostEditProvider>
          <PollLengthInputs />
        </PostEditProvider>
      </Provider>
    );

    // await the useEffect hook to finish
    await testService.waitForTick();

    const customSelects = screen.getAllByTestId("custom-select");
    expect(customSelects[1]).toHaveClass("disabled");
    expect(customSelects[2]).toHaveClass("disabled");
  });

  it("enables Hours and Minutes when Days is less than 7", async () => {
    testService.disptachUpdateNewPostWithPoll(
      testService.createTestPoll({ length: { days: 6, hours: 0, minutes: 0 } })
    );

    render(
      <Provider store={store}>
        <PostEditProvider>
          <PollLengthInputs />
        </PostEditProvider>
      </Provider>
    );

    // await the useEffect hook to finish
    await testService.waitForTick();

    const customSelects = screen.getAllByTestId("custom-select");
    expect(customSelects[1]).not.toHaveClass("disabled");
    expect(customSelects[2]).not.toHaveClass("disabled");
  });

  it("initializes Days, Hours, and Minutes with correct values", async () => {
    const initialPollLength = { days: 2, hours: 12, minutes: 30 };

    testService.disptachUpdateNewPostWithPoll(
      testService.createTestPoll({ length: initialPollLength })
    );

    render(
      <Provider store={store}>
        <PostEditProvider>
          <PollLengthInputs />
        </PostEditProvider>
      </Provider>
    );

    // await the useEffect hook to finish
    await testService.waitForTick();
    const customSelects = screen.getAllByTestId("custom-select");

    Object.keys(initialPollLength).forEach((key, index) => {
      const valueSpan = customSelects[index].querySelector(".custom-select-value");
      const actualValue = valueSpan?.textContent;
      const expectedValue = String(initialPollLength[key as keyof typeof initialPollLength]);
      expect(actualValue).toBe(expectedValue);
    });
  });

  it("calls handleValueChange when a CustomSelect value is changed", async () => {
    render(
      <Provider store={store}>
        <PostEditProvider>
          <PollLengthInputs />
        </PostEditProvider>
      </Provider>
    );

    // await the useEffect hook to finish
    await testService.waitForTick();

    const customSelects = screen.getAllByTestId("custom-select");

    testService.selectAndCheckValue(customSelects[0], 6, "6");
    testService.selectAndCheckValue(customSelects[1], 23, "23");
    testService.selectAndCheckValue(customSelects[2], 59, "59");
  });

  it("resets Hours and Minutes to zero when Days is set to 7", async () => {
    testService.disptachUpdateNewPostWithPoll(
      testService.createTestPoll({ length: { days: 6, hours: 12, minutes: 30 } })
    );

    render(
      <Provider store={store}>
        <PostEditProvider>
          <PollLengthInputs />
        </PostEditProvider>
      </Provider>
    );

    // await the useEffect hook to finish
    await testService.waitForTick();
    const customSelects = screen.getAllByTestId("custom-select");

    const hoursValue1 = customSelects[1].querySelector(".custom-select-value")?.textContent;
    const minutesValue1 = customSelects[2].querySelector(".custom-select-value")?.textContent;

    expect(hoursValue1).toBe("12");
    expect(minutesValue1).toBe("30");

    // Set Days to 7
    testService.selectAndCheckValue(customSelects[0], 7, "7");

    // Check that Hours and Minutes are reset to zero
    const hoursValue = customSelects[1].querySelector(".custom-select-value")?.textContent;
    const minutesValue = customSelects[2].querySelector(".custom-select-value")?.textContent;

    expect(hoursValue).toBe("0");
    expect(minutesValue).toBe("0");
  });

  it("does not open dropdowns when CustomSelect is disabled", async () => {
    // Set Days to 7 to disable Hours and Minutes
    testService.disptachUpdateNewPostWithPoll(
      testService.createTestPoll({ length: { days: 7, hours: 12, minutes: 30 } })
    );

    render(
      <Provider store={store}>
        <PostEditProvider>
          <PollLengthInputs />
        </PostEditProvider>
      </Provider>
    );

    await testService.waitForTick();

    const customSelects = screen.getAllByTestId("custom-select");

    fireEvent.click(customSelects[1]);
    const dropdownItems = customSelects[1].querySelectorAll(".custom-select-dropdown-item");
    expect(dropdownItems.length).toBe(0);

    fireEvent.click(customSelects[2]);
    const dropdownItems2 = customSelects[2].querySelectorAll(".custom-select-dropdown-item");
    expect(dropdownItems2.length).toBe(0);
  });
});
