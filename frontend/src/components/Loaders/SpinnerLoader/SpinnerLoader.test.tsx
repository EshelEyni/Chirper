import { it, describe, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { SpinnerLoader } from "./SpinnerLoader";

describe("SpinnerLoader", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders spinner-loader without container by default", () => {
    render(<SpinnerLoader />);
    expect(screen.getByTestId("spinner-loader")).toBeInTheDocument();
  });

  it("renders spinner-loader with container when withContainer is true", () => {
    render(
      <SpinnerLoader withContainer={true} containerSize={{ width: "50px", height: "50px" }} />
    );
    expect(screen.getByTestId("spinner-loader-container")).toBeInTheDocument();
  });

  it("applies custom container size when provided", () => {
    render(
      <SpinnerLoader withContainer={true} containerSize={{ width: "50px", height: "50px" }} />
    );
    const container = screen.getByTestId("spinner-loader").closest(".spinner-loader-container");
    expect(container).toHaveStyle({ width: "50px", height: "50px" });
  });

  it("uses default container size when not provided", () => {
    render(<SpinnerLoader withContainer={true} containerSize={{ width: "50px" }} />);
    const container1 = screen.getByTestId("spinner-loader").closest(".spinner-loader-container");
    expect(container1).toHaveStyle({ width: "50px", height: "100%" });

    cleanup();

    render(<SpinnerLoader withContainer={true} containerSize={{ height: "50px" }} />);
    const container2 = screen.getByTestId("spinner-loader").closest(".spinner-loader-container");
    expect(container2).toHaveStyle({ width: "100%", height: "50px" });
  });
});
