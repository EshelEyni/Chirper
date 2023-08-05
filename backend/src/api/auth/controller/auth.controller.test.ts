/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import {
  autoLogin,
  login,
  logout,
  resetPassword,
  sendPasswordResetEmail,
  signup,
  updatePassword,
} from "./auth.controller";
import authService from "../service/auth.service";
import { AppError, asyncErrorCatcher } from "../../../services/error/error.service";
import { UserCredenitials } from "../../../../../shared/interfaces/user.interface";

jest.mock("../service/auth.service");
const nextMock = jest.fn() as jest.MockedFunction<NextFunction>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
(asyncErrorCatcher as jest.Mock) = jest.fn().mockImplementation(fn => {
  return async (...args: unknown[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      return nextMock(error);
    }
  };
});

describe("Auth Controller", () => {
  const mockUser = { id: "1", username: "username" };
  const mockToken = "token";

  let req: Partial<Request>;
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn(),
    send: jest.fn(),
  };
  const next: jest.Mock = jest.fn();

  function assertUserTokenSuccesRes(statusCode = 200) {
    expect(res.status).toHaveBeenCalledWith(statusCode);
    expect(res.cookie).toHaveBeenCalledWith("loginToken", mockToken, {
      httpOnly: true,
      expires: expect.any(Date),
      secure: false,
    });

    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
        data: mockUser,
        token: mockToken,
      })
    );
  }

  function assertBadRequestError(msg: string) {
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        status: "fail",
        message: msg,
      })
    );
  }

  describe("login", () => {
    beforeEach(() => {
      req = { body: {} };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should throw an error if no username is provided", async () => {
      const sut = login as any;
      await sut(req as Request, res as Response, next);
      assertBadRequestError("Username and password are required");
    });

    it("should throw an error if no password is provided", async () => {
      req.body!.username = "username";
      const sut = login as any;
      await sut(req as Request, res as Response, next);
      assertBadRequestError("Username and password are required");
    });

    it("should call login if username and password are provided", async () => {
      req.body!.username = "username";
      req.body!.password = "password";
      (authService.login as jest.Mock).mockResolvedValue({});
      const sut = login as any;
      await sut(req as Request, res as Response, next);
      expect(authService.login).toHaveBeenCalledWith("username", "password");
    });

    it("should send a response with the user", async () => {
      req.body!.username = "username";
      req.body!.password = "password";

      (authService.login as jest.Mock).mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });
      const sut = login as any;
      await sut(req as Request, res as Response, next);
      assertUserTokenSuccesRes();
    });
  });

  describe("autoLogin", () => {
    const invalidCookies = [null, undefined, "", 123];

    beforeEach(() => {
      req = { body: {}, cookies: {} };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should send a succesfull response with no user if no token is provided", async () => {
      const sut = autoLogin as any;
      await sut(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          data: null,
        })
      );
    });

    it.each(invalidCookies)(
      "should send a succesfull response with no user if an invalid token is provided",
      async cookie => {
        req.cookies = { loginToken: cookie };
        const sut = autoLogin as any;
        await sut(req as Request, res as Response, next);
        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.send).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "success",
            data: null,
          })
        );
      }
    );

    it("should send a succesfull response with the user if a valid token is provided", async () => {
      req.cookies = { loginToken: mockToken };
      (authService.autoLogin as jest.Mock).mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });

      const sut = autoLogin as any;
      await sut(req as Request, res as Response, next);
      assertUserTokenSuccesRes();
    });
  });

  describe("signup", () => {
    const userCreds: UserCredenitials = {
      username: "testUser",
      password: "testPassword",
      passwordConfirm: "testPassword",
      email: "test@example.com",
      fullname: "Test User",
    };

    beforeEach(() => {
      req = { body: userCreds };

      (authService.signup as jest.Mock).mockResolvedValue({ user: mockUser, token: mockToken });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should sign up successfully with valid user credentials", async () => {
      const sut = signup as any;
      await sut(req as Request, res as Response, next);
      expect(authService.signup).toHaveBeenCalledWith(userCreds);
      assertUserTokenSuccesRes(201);
    });

    it("should throw an error if user credentials are missing", async () => {
      req.body = null;
      const sut = signup as any;
      await sut(req as Request, res as Response, next);
      assertBadRequestError("User credentials are required");
    });

    it.each(["username", "password", "passwordConfirm", "email", "fullname"])(
      "should throw an error if %s is missing",
      async field => {
        req.body = { ...userCreds };
        delete req.body[field];
        const sut = signup as any;
        await sut(req as Request, res as Response, next);
        assertBadRequestError(`${field} is required`);
      }
    );
  });

  describe("logout", () => {
    beforeEach(() => {
      req = { body: {}, cookies: {} };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should clear loginToken cookie and send a successful response", async () => {
      const sut = logout as any;
      await sut(req as Request, res as Response, next);
      expect(res.clearCookie).toHaveBeenCalledWith("loginToken");
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          data: {
            msg: "Logged out successfully",
          },
        })
      );
    });
  });

  describe("updatePassword", () => {
    beforeEach(() => {
      req = {
        body: {
          currentPassword: "currentPassword",
          newPassword: "newPassword",
          newPasswordConfirm: "newPasswordConfirm",
        },
        loggedinUserId: "userId",
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should throw an error if any required field is missing", async () => {
      const sut = updatePassword as any;
      for (const field of ["currentPassword", "newPassword", "newPasswordConfirm"]) {
        req.body[field] = undefined;
        await sut(req as Request, res as Response, next);
        assertBadRequestError(`${field} is required`);
        req.body[field] = field; // Reset the field for the next iteration
      }
    });

    it("should throw an error if user is not logged in", async () => {
      req.loggedinUserId = undefined;
      const sut = updatePassword as any;
      await sut(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          status: "fail",
          message: "You are not logged in",
        })
      );
    });

    it("should update the password and send a successful response", async () => {
      (authService.updatePassword as jest.Mock).mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });
      const sut = updatePassword as any;
      await sut(req as Request, res as Response, next);
      expect(authService.updatePassword).toHaveBeenCalledWith(
        req.loggedinUserId,
        req.body.currentPassword,
        req.body.newPassword,
        req.body.newPasswordConfirm
      );
      assertUserTokenSuccesRes();
    });
  });

  describe("sendPasswordResetEmail", () => {
    beforeEach(() => {
      req = {
        body: { email: "test@example.com" },
        protocol: "http",
        get: jest.fn().mockReturnValue("localhost"),
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should throw an error if email is missing", async () => {
      req.body.email = undefined;
      const sut = sendPasswordResetEmail as any;
      await sut(req as Request, res as Response, next);
      assertBadRequestError("Email is required");
    });

    it("should send a password reset email and send a successful response", async () => {
      const resetURL = `${req.protocol}://${req.get!("host")}/api/auth/resetPassword/`;
      (authService.sendPasswordResetEmail as jest.Mock) = jest.fn();

      const sut = sendPasswordResetEmail as any;
      await sut(req as Request, res as Response, next);

      expect(authService.sendPasswordResetEmail).toHaveBeenCalledWith(req.body.email, resetURL);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          message: "Password reset email sent successfully",
        })
      );
    });
  });

  describe("resetPassword", () => {
    beforeEach(() => {
      req = {
        params: { token: "token" },
        body: {
          password: "newPassword",
          passwordConfirm: "newPasswordConfirm",
        },
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should throw an error if token is missing", async () => {
      delete req.params!.token;
      const sut = resetPassword as any;
      await sut(req as Request, res as Response, next);
      assertBadRequestError("Token is required");
    });

    it("should throw an error if any required field is missing", async () => {
      const sut = resetPassword as any;
      for (const field of ["password", "passwordConfirm"]) {
        req.body[field] = undefined;
        await sut(req as Request, res as Response, next);
        assertBadRequestError(`${field} is required`);
        req.body[field] = field; // Reset the field for the next iteration
      }
    });

    it("should reset the password and send a successful response", async () => {
      (authService.resetPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });
      const sut = resetPassword as any;
      await sut(req as Request, res as Response, next);
      expect(authService.resetPassword).toHaveBeenCalledWith(
        req.params!.token,
        req.body.password,
        req.body.passwordConfirm
      );
      assertUserTokenSuccesRes();
    });
  });
});
