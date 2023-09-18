import { it, describe, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { LocationList } from "./LocationList";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import testService from "../../../../test/service/testService";
import { MockExplorePage, MockHomePage } from "../../../../test/service/MockComponents";
import { store } from "../../../store/store";

describe("LocationList", () => {
  const mockLocations = testService.createManyMockLocations(3);
  const mockNewPost = testService.getCurrNewPostFromStore();
  const setSelectedLocation = vi.fn();

  afterEach(() => {
    cleanup();
  });

  it("renders correctly", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <LocationList
            currNewPost={mockNewPost}
            locations={mockLocations}
            selectedLocation={null}
            setSelectedLocation={setSelectedLocation}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("renders correct number of LocationPreview components", () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <LocationList
            currNewPost={mockNewPost}
            locations={mockLocations}
            selectedLocation={null}
            setSelectedLocation={setSelectedLocation}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getAllByRole("listitem").length).toBe(mockLocations.length);
  });

  it("updates selected location and navigates to home on click", () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/explore"]}>
          <Routes>
            <Route path="/home" element={<MockHomePage />} />
            <Route path="/explore" element={<MockExplorePage />} />
          </Routes>
          <LocationList
            currNewPost={mockNewPost}
            locations={mockLocations}
            selectedLocation={null}
            setSelectedLocation={setSelectedLocation}
          />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.click(screen.getByText(mockLocations[0].name));
    expect(setSelectedLocation).toHaveBeenCalledWith(mockLocations[0]);
    const updatedPost = testService.getCurrNewPostFromStore();
    expect(updatedPost.location).toBe(mockLocations[0]);
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });
});
