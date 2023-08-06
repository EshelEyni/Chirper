import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import router from "./auth.router";
import { AppError, errorHandler } from "../../../services/error/error.service";
import authService from "../service/auth.service";
import { UserCredenitials } from "../../../../../shared/interfaces/user.interface";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(router);
app.use(errorHandler);

jest.mock("../../../middlewares/authGuards/authGuards.middleware", () => ({
  checkUserAuthentication: jest.fn().mockImplementation((req, res, next) => {
    req.loggedinUserId = "some-id";
    next();
  }),
}));

jest.mock("../../../services/rate-limiter.service", () => ({
  authRequestLimiter: jest.fn().mockImplementation((req, res, next) => next()),
}));

jest.mock("../service/auth.service", () => ({
  login: jest.fn().mockReturnValue({}),
  loginWithToken: jest.fn().mockReturnValue({}),
  signup: jest.fn().mockReturnValue({}),
  sendPasswordResetEmail: jest.fn().mockReturnValue({}),
  resetPassword: jest.fn().mockReturnValue({}),
  updatePassword: jest.fn().mockReturnValue({}),
}));

describe("Auth Router", () => {
  const mockUser = {
    id: "some-id",
    name: "John Doe",
    email: "email@email.com",
    password: "password",
    passwordConfirm: "password",
  };

  const mockToken = "some-token";

  const mockUserCredenitials: UserCredenitials = {
    username: "Test User",
    fullname: "Test User",
    email: "test@example.com",
    password: "test-password",
    passwordConfirm: "test-password",
  };

  describe("POST /login/with-token", () => {
    it("should handle auto-login", async () => {
      (authService.loginWithToken as jest.Mock).mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });
      const response = await request(app)
        .post("/login/with-token")
        .set("Cookie", ["loginToken=some-token"]);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: "success",
        data: mockUser,
        token: mockToken,
      });
    });

    it("should send a succesfull response with no user if an invalid token is provided", async () => {
      const response = await request(app).post("/login/with-token");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: "success",
        data: null,
      });
    });

    it("should send a succesfull response with no user if an invalid token is provided", async () => {
      const emptyStr = "";
      const response = await request(app)
        .post("/login/with-token")
        .set("Cookie", [`loginToken=${emptyStr}`]);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: "success",
        data: null,
      });
    });
  });

  describe("POST /login", () => {
    const mockUsername = "username";
    const mockPassword = "password";

    it("should handle login", async () => {
      (authService.login as jest.Mock).mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });
      const response = await request(app)
        .post("/login")
        .send({ username: mockUsername, password: mockPassword });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: "success",
        data: mockUser,
        token: mockToken,
      });
    });

    it("should send a 400 error if no username is provided", async () => {
      (authService.login as jest.Mock).mockRejectedValue(
        new Error("Incorrect username or password")
      );
      const response = await request(app).post("/login").send({
        password: mockPassword,
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Username and password are required");
    });

    it("should send a 400 error if no password is provided", async () => {
      const response = await request(app).post("/login").send({
        username: mockUsername,
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Username and password are required");
    });

    it("should send a 400 error if no username and password are provided", async () => {
      const response = await request(app).post("/login");
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Username and password are required");
    });

    it("should send a 404 error if the user is not found", async () => {
      (authService.login as jest.Mock).mockRejectedValue(new AppError("User not found", 404));
      const response = await request(app)
        .post("/login")
        .send({ username: mockUsername, password: mockPassword });
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found");
    });

    it("should send a 401 error if the username or password is incorrect", async () => {
      (authService.login as jest.Mock).mockRejectedValue(new AppError("Incorrect password", 401));
      const response = await request(app)
        .post("/login")
        .send({ username: mockUsername, password: mockPassword });
      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Incorrect password");
    });
  });

  describe("POST /signup", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should handle signup", async () => {
      (authService.signup as jest.Mock).mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });
      const response = await request(app).post("/signup").send(mockUserCredenitials);
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        status: "success",
        data: mockUser,
        token: mockToken,
      });
    });

    it("should send a 400 error if no userCredentials is provided", async () => {
      const response = await request(app).post("/signup");
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("User credentials are required");
    });

    it.each(Object.keys(mockUserCredenitials))(
      "should send a 400 error if %s is not provided",
      async key => {
        const userCredentials = { ...mockUserCredenitials };
        delete userCredentials[key as keyof UserCredenitials];
        const response = await request(app).post("/signup").send(userCredentials);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe(`${key} is required`);
      }
    );
  });

  describe("POST /logout", () => {
    it("should handle logout", async () => {
      const response = await request(app).post("/logout");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: "success",
        data: {
          msg: "Logged out successfully",
        },
      });
    });
  });

  describe("POST /updatePassword", () => {
    const mockReqBody = {
      currentPassword: "password",
      newPassword: "new-password",
      newPasswordConfirm: "new-password",
    };
    it("should handle update password", async () => {
      (authService.updatePassword as jest.Mock).mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });
      const response = await request(app)
        .patch("/updatePassword")
        .set("Cookie", ["loginToken=some-token"])
        .send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: "success",
        data: mockUser,
        token: mockToken,
      });
    });

    it.each(Object.keys(mockReqBody))(
      "should send a 400 error if %s is not provided",
      async key => {
        const reqBody = { ...mockReqBody };
        delete reqBody[key as keyof typeof mockReqBody];
        const response = await request(app)
          .patch("/updatePassword")
          .set("Cookie", ["loginToken=some-token"])
          .send(reqBody);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe(`${key} is required`);
      }
    );

    it("should send a 400 error if newPassword and newPasswordConfirm do not match", async () => {
      const response = await request(app)
        .patch("/updatePassword")
        .set("Cookie", ["loginToken=some-token"])
        .send({
          ...mockReqBody,
          newPasswordConfirm: "new-password-confirm",
        });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Passwords do not match");
    });
  });

  describe("POST /forgotPassword", () => {
    const mockReqBody = {
      email: "email@email.com",
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should handle forgot password", async () => {
      authService.sendPasswordResetEmail = jest.fn();
      const response = await request(app).post("/forgotPassword").send(mockReqBody);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: "success",
        message: "Password reset email sent successfully",
      });
    });

    it("should send a 400 error if no email is provided", async () => {
      const response = await request(app).post("/forgotPassword");
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Email is required");
    });

    it("should send a 400 error if email is invalid", async () => {
      const response = await request(app).post("/forgotPassword").send({
        email: "invalid-email",
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Email is invalid");
    });
  });

  describe("POST /resetPassword", () => {
    const mockReqBody = {
      password: "password",
      passwordConfirm: "password",
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should handle reset password", async () => {
      (authService.resetPassword as jest.Mock).mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });
      const response = await request(app).patch("/resetPassword/some-token").send(mockReqBody);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: "success",
        data: mockUser,
        token: mockToken,
      });
    });

    it.each(Object.keys(mockReqBody))(
      "should send a 400 error if %s is not provided",
      async key => {
        const reqBody = { ...mockReqBody };
        delete reqBody[key as keyof typeof mockReqBody];
        const response = await request(app).patch("/resetPassword/some-token").send(reqBody);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe(`${key} is required`);
      }
    );
  });
});
