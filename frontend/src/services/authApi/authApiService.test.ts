import { vi, describe, it, expect, Mock } from "vitest";
import authService from "./authApiService";
import httpService from "../http/httpService";
import { handleServerResponseData } from "../util/utilService";

vi.mock("../http/httpService");
vi.mock("../util/utilService");

describe("authService", () => {
  it("calls loginWithToken with correct arguments", async () => {
    const mockUser = { username: "test", password: "password" };
    const mockResponse = { status: "success", data: mockUser };

    (httpService.post as Mock).mockResolvedValue(mockResponse);
    (handleServerResponseData as Mock).mockReturnValue(mockUser);

    const result = await authService.loginWithToken();

    expect(httpService.post).toHaveBeenCalledWith("auth/login/with-token");
    expect(handleServerResponseData).toHaveBeenCalledWith(mockResponse);
    expect(result).toEqual(mockUser);
  });

  it("calls login with correct arguments", async () => {
    const mockUser = { username: "test", password: "password" };
    const mockResponse = { status: "success", data: mockUser };

    (httpService.post as Mock).mockResolvedValue(mockResponse);
    (handleServerResponseData as Mock).mockReturnValue(mockUser);

    const result = await authService.login(mockUser.username, mockUser.password);

    expect(httpService.post).toHaveBeenCalledWith("auth/login", mockUser);
    expect(handleServerResponseData).toHaveBeenCalledWith(mockResponse);
    expect(result).toEqual(mockUser);
  });

  it("calls signup with correct arguments", async () => {
    const mockUser = {
      username: "test",
      fullname: "test",
      email: "test@email.com",
      password: "password",
      passwordConfirm: "password",
    };
    const mockResponse = { status: "success", data: mockUser };

    (httpService.post as Mock).mockResolvedValue(mockResponse);
    (handleServerResponseData as Mock).mockReturnValue(mockUser);

    const result = await authService.signup(mockUser);

    expect(httpService.post).toHaveBeenCalledWith("auth/signup", mockUser);
    expect(handleServerResponseData).toHaveBeenCalledWith(mockResponse);
    expect(result).toEqual(mockUser);
  });

  it("calls logout with correct arguments", async () => {
    const mockResponse = { status: "success" };

    (httpService.post as Mock).mockResolvedValue(mockResponse);

    const result = await authService.logout();

    expect(httpService.post).toHaveBeenCalledWith("auth/logout");
    expect(result).toEqual(mockResponse);
  });
});
