import { it, describe, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Logo } from "./Logo";
import { MemoryRouter } from "react-router-dom";

describe("Logo", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders static logo when staticLogo option is true", () => {
    render(
      <MemoryRouter>
        <Logo options={{ staticLogo: true, autoAnimate: false, height: 50, width: 50 }} />
      </MemoryRouter>
    );
    expect(screen.getByRole("link")).toHaveClass("logo-container");
    expect(screen.getByTestId("static-logo")).toBeInTheDocument();
  });

  it("applies auto-animation class when autoAnimate option is true", () => {
    render(
      <MemoryRouter>
        <Logo options={{ staticLogo: false, autoAnimate: true, height: 50, width: 50 }} />
      </MemoryRouter>
    );
    expect(screen.getByRole("link")).toHaveClass("auto-animation");
  });

  it("sets height and width styles when provided", () => {
    render(
      <MemoryRouter>
        <Logo options={{ staticLogo: false, autoAnimate: false, height: 50, width: 50 }} />
      </MemoryRouter>
    );
    const linkElement = screen.getByRole("link");
    expect(linkElement).toHaveStyle({ height: "50px", width: "50px" });
  });

  it("renders animated logo when staticLogo option is false", () => {
    render(
      <MemoryRouter>
        <Logo options={{ staticLogo: false, autoAnimate: false, height: 50, width: 50 }} />
      </MemoryRouter>
    );
    expect(screen.getByRole("link")).toHaveClass("logo-container");
    expect(screen.getByTestId("bird")).toBeInTheDocument();
  });
});
