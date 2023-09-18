import { it, describe, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Logo } from "./Logo";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { MockExplorePage, MockHomePage } from "../../../../test/service/MockComponents";

describe("Logo", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the static logo when staticLogo is true", () => {
    render(
      <MemoryRouter>
        <Logo staticLogo={true} size={{ height: 100, width: 100 }} />
      </MemoryRouter>
    );
    expect(screen.getByTestId("static-logo")).toBeInTheDocument();
  });

  it("renders the dynamic logo when staticLogo is false", () => {
    render(
      <MemoryRouter>
        <Logo />
      </MemoryRouter>
    );
    expect(screen.getByTestId("logo")).toBeInTheDocument();
  });

  it("navigates to home page when clicked and linkEnabled is true", () => {
    render(
      <MemoryRouter initialEntries={["/explore"]} initialIndex={0}>
        <Routes>
          <Route path="/explore" element={<MockExplorePage />} />
          <Route path="/" element={<MockHomePage />} />
        </Routes>
        <Logo linkEnabled={true} />
      </MemoryRouter>
    );

    expect(screen.getByTestId("explore-page")).toBeInTheDocument();
    expect(screen.queryByTestId("home-page")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("logo"));

    expect(screen.queryByTestId("explore-page")).not.toBeInTheDocument();
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  it("does not navigate when clicked and linkEnabled is false", () => {
    render(
      <MemoryRouter initialEntries={["/explore"]} initialIndex={0}>
        <Routes>
          <Route path="/" element={<MockHomePage />} />
          <Route path="/explore" element={<MockExplorePage />} />
        </Routes>
        <Logo linkEnabled={false} />
      </MemoryRouter>
    );

    expect(screen.getByTestId("explore-page")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("logo"));
    expect(screen.getByTestId("explore-page")).toBeInTheDocument();
    expect(screen.queryByTestId("home-page")).not.toBeInTheDocument();
  });

  it("applies auto-animation class when autoAnimate is true", () => {
    render(
      <MemoryRouter>
        <Logo autoAnimate={true} />
      </MemoryRouter>
    );
    expect(screen.getByTestId("logo").closest(".logo-container")).toHaveClass("auto-animation");
  });
});
