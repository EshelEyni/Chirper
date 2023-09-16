import { it, describe, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BtnLink } from "./BtnLink";
import { Location, MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

let testLocation: Location;

function CaptureLocation() {
  const location = useLocation();
  testLocation = location;
  return null;
}

describe("BtnLink", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the link button with the correct title", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <BtnLink path="/destination" title="Go To Destination" />
      </MemoryRouter>
    );
    const linkButton = screen.getByRole("button", { name: /Go To Destination/i });
    expect(linkButton).toBeInTheDocument();
  });

  it("navigates to the correct path when clicked", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <BtnLink path="/destination" title="Go To Destination" />
        <Routes>
          <Route path="*" element={<CaptureLocation />} />
        </Routes>
      </MemoryRouter>
    );

    const linkButton = screen.getByRole("button", { name: /Go To Destination/i });
    fireEvent.click(linkButton);

    expect(testLocation.pathname).toBe("/destination");
  });
});
