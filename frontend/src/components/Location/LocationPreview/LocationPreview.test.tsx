import { it, describe, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { LocationPreview } from "./LocationPreview";
import testService from "../../../../test/service/testService";

describe("LocationPreview", () => {
  afterEach(() => {
    cleanup();
  });

  const mockLocation = testService.createMockLocation(1);
  const { name: mockLocationName } = mockLocation;

  const mockOnClickLocation = vi.fn();

  it("renders location name correctly", () => {
    render(
      <LocationPreview
        location={mockLocation}
        selectedLocation={null}
        onClickLocation={mockOnClickLocation}
      />
    );
    expect(screen.getByText(mockLocationName)).toBeInTheDocument();
  });

  it("invokes onClickLocation when clicked", () => {
    render(
      <LocationPreview
        location={mockLocation}
        selectedLocation={null}
        onClickLocation={mockOnClickLocation}
      />
    );
    fireEvent.click(screen.getByText(mockLocationName));
    expect(mockOnClickLocation).toHaveBeenCalledWith(mockLocation);
  });

  it("displays check icon when location is selected", () => {
    render(
      <LocationPreview
        location={mockLocation}
        selectedLocation={mockLocation}
        onClickLocation={mockOnClickLocation}
      />
    );
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
  });

  it("does not display check icon when location is not selected", () => {
    render(
      <LocationPreview
        location={mockLocation}
        selectedLocation={null}
        onClickLocation={mockOnClickLocation}
      />
    );
    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();

    cleanup();

    render(
      <LocationPreview
        location={mockLocation}
        selectedLocation={testService.createMockLocation(2)}
        onClickLocation={mockOnClickLocation}
      />
    );
    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();
  });
});
