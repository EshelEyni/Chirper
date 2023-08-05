import { Request, Response } from "express";
import { checkAdminAuthorization, checkUserAuthentication } from "./authGuards.middleware";
import tokenService from "../../services/token/token.service";
import { AppError } from "../../services/error/error.service";
import mongoose from "mongoose";
import { UserModel } from "../../api/user/user.model";

jest.mock("../../services/token/token.service");
jest.mock("../../api/user/user.model", () => ({
  UserModel: {
    findById: jest.fn(),
  },
}));

describe("Auth Guards Middleware", () => {
  describe("checkUserAuthentication", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
      req = {};
      res = {};
      next = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should call next with an error if no token is provided", () => {
      (tokenService.getTokenFromRequest as jest.Mock).mockReturnValue(null);
      checkUserAuthentication(req as Request, res as Response, next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: "You are not logged in! Please log in to get access." })
      );
    });

    it("should call next with an error if the token is invalid", () => {
      (tokenService.getTokenFromRequest as jest.Mock).mockReturnValue("token");
      (tokenService.verifyToken as jest.Mock).mockReturnValue(null);
      next = jest.fn().mockImplementation(err => {
        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: "Invalid Token" }));
      });
      checkUserAuthentication(req as Request, res as Response, next);
    });

    it("should call next with an error if the user ID in the token is not valid", () => {
      (tokenService.getTokenFromRequest as jest.Mock).mockReturnValue("token");
      (tokenService.verifyToken as jest.Mock).mockReturnValue({
        id: "invalid",
        timeStamp: Date.now(),
      });
      next = jest.fn().mockImplementation(err => {
        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: "Invalid User Id" }));
      });
      checkUserAuthentication(req as Request, res as Response, next);
    });

    it("should call next with an error if the user does not exist", done => {
      (tokenService.getTokenFromRequest as jest.Mock).mockReturnValue("token");
      (tokenService.verifyToken as jest.Mock).mockReturnValue({
        id: new mongoose.Types.ObjectId(),
        timeStamp: Date.now(),
      });
      (UserModel.findById as jest.Mock).mockResolvedValue(null);

      next = jest.fn().mockImplementation(err => {
        expect(err).toBeInstanceOf(AppError);
        expect(err).toEqual(
          expect.objectContaining({ message: "The user belonging to this token does not exist." })
        );
        done();
      });

      checkUserAuthentication(req as Request, res as Response, next);
    });

    it("should call next with an error if the user has changed their password", done => {
      const user = {
        changedPasswordAfter: jest.fn().mockReturnValue(true),
      };
      (tokenService.getTokenFromRequest as jest.Mock).mockReturnValue("token");
      (tokenService.verifyToken as jest.Mock).mockReturnValue({
        id: new mongoose.Types.ObjectId(),
        timeStamp: Date.now(),
      });
      (UserModel.findById as jest.Mock).mockReturnValue(user);

      next = jest.fn().mockImplementation(err => {
        expect(err).toBeInstanceOf(AppError);
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "User recently changed password! Please log in again.",
          })
        );
        done();
      });

      checkUserAuthentication(req as Request, res as Response, next);
    });

    it("should set req.loggedinUserId and call next with no arguments if the authentication is successful", done => {
      const id = new mongoose.Types.ObjectId();
      const user = {
        changedPasswordAfter: jest.fn().mockReturnValue(false),
      };
      (tokenService.getTokenFromRequest as jest.Mock).mockReturnValue("token");
      (tokenService.verifyToken as jest.Mock).mockReturnValue({ id, timeStamp: Date.now() });
      (UserModel.findById as jest.Mock).mockReturnValue(user);

      next = jest.fn().mockImplementation(() => {
        expect(req.loggedinUserId).toBe(id);
        expect(next).toHaveBeenCalled();
        done();
      });

      checkUserAuthentication(req as Request, res as Response, next);
    });
  });

  describe("checkAdminAuthorization", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;
    const validMongoId = new mongoose.Types.ObjectId().toString();

    beforeEach(() => {
      req = {};
      res = {};
      next = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should call next with an error if no user is logged in", done => {
      req.loggedinUserId = undefined;
      next = jest.fn().mockImplementation(err => {
        expect(err).toBeInstanceOf(AppError);
        expect(err).toEqual(expect.objectContaining({ message: "User not logged in" }));
        done();
      });
      checkAdminAuthorization(req as Request, res as Response, next);
    });

    it("should call next with an error if the user does not exist", done => {
      req.loggedinUserId = validMongoId;
      (UserModel.findById as jest.Mock).mockResolvedValue(null);
      next = jest.fn().mockImplementation(err => {
        expect(err).toBeInstanceOf(AppError);
        expect(err).toEqual(expect.objectContaining({ message: "User not found" }));
        done();
      });
      checkAdminAuthorization(req as Request, res as Response, next);
    });

    it("should call next with an error if the user is not an admin", done => {
      const user = { isAdmin: false };
      req.loggedinUserId = validMongoId;
      (UserModel.findById as jest.Mock).mockResolvedValue(user);
      next = jest.fn().mockImplementation(err => {
        expect(err).toBeInstanceOf(AppError);
        expect(err).toEqual(expect.objectContaining({ message: "User not authorized" }));
        done();
      });
      checkAdminAuthorization(req as Request, res as Response, next);
    });

    it("should call next with no arguments if the user is an admin", done => {
      const user = { isAdmin: true };
      req.loggedinUserId = validMongoId;
      (UserModel.findById as jest.Mock).mockResolvedValue(user);
      next = jest.fn().mockImplementation(() => {
        expect(next).toHaveBeenCalled();
        done();
      });
      checkAdminAuthorization(req as Request, res as Response, next);
    });
  });
});
