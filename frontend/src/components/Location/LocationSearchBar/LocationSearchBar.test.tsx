import { it, describe, expect, afterEach, vi, Mock } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { LocationSearchBar } from "./LocationSearchBar";
import locationService from "../../../services/location/locationService";
import testService from "../../../../test/service/testService";

vi.mock("../../../services/location/locationService");

describe("LocationSearchBar", () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  const mockSetLocations = vi.fn();
  const mockFetchLocations = vi.fn();
  const mockSetIsLoading = vi.fn();

  it("renders search bar correctly", () => {
    render(
      <LocationSearchBar
        setLocations={mockSetLocations}
        fetchLocations={mockFetchLocations}
        setIsLoading={mockSetIsLoading}
      />
    );

    expect(screen.getByTestId("location-search-bar-label")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search locations")).toBeInTheDocument();
    const closeIcon = screen.queryByTestId("location-search-bar-close-icon");
    expect(closeIcon).not.toBeInTheDocument();
  });

  it("calls fetchLocations on initial render", () => {
    render(
      <LocationSearchBar
        setLocations={mockSetLocations}
        fetchLocations={mockFetchLocations}
        setIsLoading={mockSetIsLoading}
      />
    );
    expect(mockFetchLocations).toHaveBeenCalled();
  });

  it("should call getLocationsBySearchTerm when change value is truthy", async () => {
    const mockLocations = testService.createManyMockLocations(5);
    vi.useFakeTimers();
    (locationService.getLocationsBySearchTerm as Mock).mockResolvedValue(mockLocations);
    render(
      <LocationSearchBar
        setLocations={mockSetLocations}
        fetchLocations={mockFetchLocations}
        setIsLoading={mockSetIsLoading}
      />
    );
    const input = screen.getByPlaceholderText("Search locations");
    fireEvent.change(input, { target: { value: "New" } });

    vi.advanceTimersByTime(1500);
    expect(locationService.getLocationsBySearchTerm).toHaveBeenCalledWith("New");
    vi.useRealTimers();
  });

  it("should call SetIsLoading twice when change value is truthy", async () => {
    const mockLocations = testService.createManyMockLocations(5);
    vi.useFakeTimers();
    (locationService.getLocationsBySearchTerm as Mock).mockResolvedValue(mockLocations);
    render(
      <LocationSearchBar
        setLocations={mockSetLocations}
        fetchLocations={mockFetchLocations}
        setIsLoading={mockSetIsLoading}
      />
    );
    const input = screen.getByPlaceholderText("Search locations");
    fireEvent.change(input, { target: { value: "New" } });

    vi.advanceTimersByTime(1500);
    expect(mockSetIsLoading).toHaveBeenNthCalledWith(1, true);
    vi.useRealTimers();
    await testService.waitForTick();
    expect(mockSetIsLoading).toHaveBeenCalledTimes(2);
    expect(mockSetIsLoading).toHaveBeenNthCalledWith(2, false);
  });

  it("should SetLocations with locations when change value is truthy", async () => {
    const mockLocations = testService.createManyMockLocations(5);
    vi.useFakeTimers();
    (locationService.getLocationsBySearchTerm as Mock).mockResolvedValue(mockLocations);
    render(
      <LocationSearchBar
        setLocations={mockSetLocations}
        fetchLocations={mockFetchLocations}
        setIsLoading={mockSetIsLoading}
      />
    );
    const input = screen.getByPlaceholderText("Search locations");
    fireEvent.change(input, { target: { value: "New" } });

    vi.advanceTimersByTime(1500);
    vi.useRealTimers();
    await testService.waitForTick();
    expect(mockSetLocations).toHaveBeenCalledWith(mockLocations);
  });

  it("should not call getLocationsBySearchTerm when change value is falsy", () => {
    vi.useFakeTimers();
    (locationService.getLocationsBySearchTerm as Mock).mockResolvedValue([]);

    render(
      <LocationSearchBar
        setLocations={mockSetLocations}
        fetchLocations={mockFetchLocations}
        setIsLoading={mockSetIsLoading}
      />
    );

    const input = screen.getByPlaceholderText("Search locations");
    fireEvent.change(input, { target: { value: "" } });

    vi.advanceTimersByTime(1500);

    expect(locationService.getLocationsBySearchTerm).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("calls fetchLocations when change value is falsy", () => {
    vi.useFakeTimers();
    (locationService.getLocationsBySearchTerm as Mock).mockResolvedValue([]);

    render(
      <LocationSearchBar
        setLocations={mockSetLocations}
        fetchLocations={mockFetchLocations}
        setIsLoading={mockSetIsLoading}
      />
    );

    const input = screen.getByPlaceholderText("Search locations");
    fireEvent.change(input, { target: { value: "" } });

    vi.advanceTimersByTime(1500);

    expect(mockFetchLocations).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("clears search term when close icon is clicked", () => {
    vi.useFakeTimers();
    (locationService.getLocationsBySearchTerm as Mock).mockResolvedValue([]);

    const { rerender } = render(
      <LocationSearchBar
        setLocations={mockSetLocations}
        fetchLocations={mockFetchLocations}
        setIsLoading={mockSetIsLoading}
      />
    );

    const input = screen.getByPlaceholderText("Search locations");
    fireEvent.change(input, { target: { value: "New" } });

    vi.advanceTimersByTime(1500);

    rerender(
      <LocationSearchBar
        setLocations={mockSetLocations}
        fetchLocations={mockFetchLocations}
        setIsLoading={mockSetIsLoading}
      />
    );

    const closeIcon = screen.getByTestId("location-search-bar-close-icon");
    fireEvent.mouseDown(closeIcon);

    expect(input).toHaveValue("");
    expect(mockFetchLocations).toHaveBeenCalled();

    vi.useRealTimers();
  });
});
