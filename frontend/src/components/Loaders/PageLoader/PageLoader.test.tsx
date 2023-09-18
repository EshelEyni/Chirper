import { it, describe, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { PageLoader } from "./PageLoader";
import { MemoryRouter } from "react-router-dom";

describe("PageLoader", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the SpinnerLoader by default", () => {
    render(
      <MemoryRouter>
        <PageLoader />
      </MemoryRouter>
    );
    expect(screen.getByTestId("spinner-loader")).toBeInTheDocument();
  });

  it("renders the Logo and progress bar when isBirdLoader is true", () => {
    render(
      <MemoryRouter>
        <PageLoader isBirdLoader={true} />
      </MemoryRouter>
    );
    expect(screen.getByTestId("logo")).toBeInTheDocument();
    expect(screen.getByTestId("progress-bar")).toBeInTheDocument();
  });
});
