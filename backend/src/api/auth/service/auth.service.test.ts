import authService, { UserDoc } from "./auth.service";
import { UserModel } from "../../user/user.model";
import tokenService from "../../../services/token/token.service";
import { UserCredenitials } from "../../../../../shared/interfaces/user.interface";
import { AppError } from "../../../services/error/error.service";
import { isValidId } from "../../../services/util/util.service";

jest.mock("../../user/user.model");
jest.mock("../../../services/token/token.service");
jest.mock("../../../services/util/util.service");

describe("Auth Service", () => {
  describe("login", () => {
    let user: Partial<UserDoc>;

    beforeEach(() => {
      user = {
        id: "1",
        loginAttempts: 0,
        lockedUntil: 0,
        checkPassword: jest.fn().mockResolvedValue(true),
        save: jest.fn(),
      };
      (UserModel.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(user),
      });
      (tokenService.signToken as jest.Mock).mockReturnValue("token");
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should throw an error if the user does not exist", async () => {
      (UserModel.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });
      await expect(authService.login("username", "password")).rejects.toThrow(
        new AppError("Incorrect username", 400)
      );
    });

    it("should throw an error if the password is incorrect", async () => {
      user.checkPassword = jest.fn().mockResolvedValue(false);
      await expect(authService.login("username", "password")).rejects.toThrow(
        new AppError("Incorrect password", 400)
      );
    });

    it("should return a user and a token if the username and password are correct", async () => {
      const result = await authService.login("username", "password");
      expect(result).toEqual({ user, token: "token" });
    });

    it("should increment loginAttempts if user is not locked", async () => {
      user.checkPassword = jest.fn().mockResolvedValue(false);
      await expect(authService.login("username", "password")).rejects.toThrow(
        new AppError("Incorrect password", 400)
      );
      expect(user.loginAttempts).toBe(1);
      expect(user.save).toHaveBeenCalled();
    });

    it("should lock the user for 1 hour if loginAttempts is 10 and user is not currently locked", async () => {
      user.loginAttempts = 10;
      user.lockedUntil = Date.now() - 1;
      const HOUR = 60 * 60 * 1000;

      await expect(authService.login("username", "password")).rejects.toThrow(
        new AppError("Too many failed login attempts. Try again in 1 hour", 400)
      );

      expect(user.lockedUntil).toBeGreaterThan(Date.now() + HOUR - 1000);
      expect(user.save).toHaveBeenCalled();
    });

    it("should throw an error if the user is currently locked", async () => {
      user.lockedUntil = Date.now() + 60000;
      await expect(authService.login("username", "password")).rejects.toThrow(
        new AppError("Account locked. Try again in 1 minutes", 400)
      );
      expect(user.save).not.toHaveBeenCalled();
    });

    it("should reset loginAttempts to 0 if the user is not locked", async () => {
      user.loginAttempts = 9;
      user.lockedUntil = Date.now() - 1;
      await authService.login("username", "password");
      expect(user.loginAttempts).toBe(0);
      expect(user.lockedUntil).toBe(0);
      expect(user.save).toHaveBeenCalled();
    });

    it("should throw an error if the signToken function fails", async () => {
      (tokenService.signToken as jest.Mock).mockImplementation(() => {
        throw new Error("Token generation failed");
      });

      await expect(authService.login("username", "password")).rejects.toThrow(
        "Token generation failed"
      );
    });
  });

  describe("autoLogin", () => {
    it("should return user and token if login is successful", async () => {
      const mockUser = { id: "123", name: "Test User" };
      (tokenService.verifyToken as jest.Mock).mockResolvedValue({ id: "123" });
      (isValidId as jest.Mock).mockReturnValue(true);
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);
      (tokenService.signToken as jest.Mock).mockReturnValue("validToken");
      const result = await authService.autoLogin("validToken");
      expect(result).toEqual({ user: mockUser, token: "validToken" });
    });

    it("should throw an error if token is invalid", async () => {
      (tokenService.verifyToken as jest.Mock).mockResolvedValue(null);
      await expect(authService.autoLogin("invalidToken")).rejects.toThrow(
        new AppError("Invalid token", 400)
      );
    });

    it("should throw an error if id is invalid", async () => {
      (tokenService.verifyToken as jest.Mock).mockResolvedValue({ id: "123" });
      (isValidId as jest.Mock).mockReturnValue(false);
      await expect(authService.autoLogin("validToken")).rejects.toThrow(
        new AppError("Invalid Id", 400)
      );
    });

    it("should throw an error if user is not found", async () => {
      (tokenService.verifyToken as jest.Mock).mockResolvedValue({ id: "123" });
      (isValidId as jest.Mock).mockReturnValue(true);
      (UserModel.findById as jest.Mock).mockResolvedValue(null);
      await expect(authService.autoLogin("validToken")).rejects.toThrow(
        new AppError("User not found", 404)
      );
    });
  });

  describe("signup", () => {
    const mockUserCredenitials = {
      username: "Test User",
      fullname: "Test User",
      email: "test@example.com",
      password: "test-password",
      passwordConfirm: "test-password",
    };

    const mockUser = { id: "1", username: "Test User", email: "test@example.com" };
    const mockToken = "test-token";

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should create a new user and return the user and a token", async () => {
      (UserModel.create as jest.Mock).mockResolvedValue(mockUser);
      (tokenService.signToken as jest.Mock).mockReturnValue(mockToken);
      const result = await authService.signup(mockUserCredenitials as UserCredenitials);
      expect(UserModel.create).toHaveBeenCalledWith(mockUserCredenitials);
      expect(tokenService.signToken).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({ savedUser: mockUser, token: mockToken });
    });

    it("should throw an error if the passwords do not match", async () => {
      (UserModel.create as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Passwords do not match");
      });
      await expect(authService.signup(mockUserCredenitials as UserCredenitials)).rejects.toThrow(
        "Passwords do not match"
      );
      expect(tokenService.signToken).not.toHaveBeenCalled();
    });

    it("should throw an error if token generation fails", async () => {
      (UserModel.create as jest.Mock).mockResolvedValue(mockUser);
      (tokenService.signToken as jest.Mock).mockImplementation(() => {
        throw new Error("Token generation failed");
      });
      await expect(authService.signup(mockUserCredenitials)).rejects.toThrow(
        "Token generation failed"
      );
    });
  });

  fdescribe("updatePassword", () => {
    it("should return user and token if password update is successful", async () => {
      const mockUser = {
        id: "123",
        name: "Test User",
        password: "oldPassword",
        checkPassword: jest.fn().mockReturnValue(true),
        save: jest.fn(),
      };
      (UserModel.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      (tokenService.signToken as jest.Mock).mockReturnValue("validToken");

      const result = await authService.updatePassword(
        "123",
        "oldPassword",
        "newPassword",
        "newPassword"
      );

      expect(result).toEqual({ user: mockUser, token: "validToken" });
      expect(mockUser.password).toBe("newPassword");
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should throw an error if user is not found", async () => {
      (UserModel.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(
        authService.updatePassword("123", "oldPassword", "newPassword", "newPassword")
      ).rejects.toThrow(new AppError("User not found", 404));
    });

    it("should throw an error if current password is incorrect", async () => {
      const mockUser = {
        id: "123",
        name: "Test User",
        password: "oldPassword",
        checkPassword: jest.fn().mockReturnValue(false),
      };
      (UserModel.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      await expect(
        authService.updatePassword("123", "wrongPassword", "newPassword", "newPassword")
      ).rejects.toThrow(
        new AppError("Current password is incorrect. Please enter the correct password", 400)
      );
    });
  });
});
