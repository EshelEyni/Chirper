import { it, describe, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LoginSignupMsg } from "./LoginSignupMsg";
import {
  MockHomePage,
  MockLoginPage,
  MockSignupPage,
} from "../../../../test/service/MockComponents";

describe("LoginSignupMsg", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the message and buttons correctly", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LoginSignupMsg />
      </MemoryRouter>
    );
    expect(screen.getByText(`Don't miss what's happening`)).toBeInTheDocument();
    expect(screen.getByText("People on Chirper are the first to know")).toBeInTheDocument();
    expect(screen.getByText("Log in")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it("navigates to the correct path when buttons are clicked", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LoginSignupMsg />
        <Routes>
          <Route path="/" element={<MockHomePage />} />
          <Route path="/login" element={<MockLoginPage />} />
          <Route path="/signup" element={<MockSignupPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Log in"));
    expect(screen.getByTestId("login-page")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Sign up"));
    expect(screen.getByTestId("signup-page")).toBeInTheDocument();
  });
});
