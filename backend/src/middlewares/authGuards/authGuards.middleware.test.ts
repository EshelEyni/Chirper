import { Request, Response } from "express";
import { checkAdminAuthorization, checkUserAuthentication } from "./authGuards.middleware";
import tokenService from "../../services/token/token.service";
import { AppError } from "../../services/error/error.service";
import mongoose from "mongoose";
import { UserModel } from "../../api/user/models/user/user.model";

jest.mock("../../services/token/token.service");
jest.mock("../../api/user/models/user/user.model", () => {
  return {
    UserModel: {
      findById: jest.fn().mockReturnValue({
        setOptions: jest.fn().mockReturnValue({
          exec: jest.fn(),
        }),
      }),
    },
  };
});

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

      setMockUserModel("123");

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

      setMockUserModel(null);

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

      setMockUserModel(user);

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

    it("should set req.loggedInUserId and call next with no arguments if the authentication is successful", done => {
      const id = new mongoose.Types.ObjectId();
      const user = {
        changedPasswordAfter: jest.fn().mockReturnValue(false),
      };
      (tokenService.getTokenFromRequest as jest.Mock).mockReturnValue("token");
      (tokenService.verifyToken as jest.Mock).mockReturnValue({ id, timeStamp: Date.now() });

      setMockUserModel(user);

      next = jest.fn().mockImplementation(() => {
        expect(req.loggedInUserId).toBe(id);
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
      req.loggedInUserId = undefined;
      next = jest.fn().mockImplementation(err => {
        expect(err).toBeInstanceOf(AppError);
        expect(err).toEqual(expect.objectContaining({ message: "User not logged in" }));
        done();
      });
      checkAdminAuthorization(req as Request, res as Response, next);
    });

    it("should call next with an error if the user does not exist", done => {
      req.loggedInUserId = validMongoId;

      setMockUserModel(null);

      next = jest.fn().mockImplementation(err => {
        expect(err).toBeInstanceOf(AppError);
        expect(err).toEqual(expect.objectContaining({ message: "User not found" }));
        done();
      });
      checkAdminAuthorization(req as Request, res as Response, next);
    });

    it("should call next with an error if the user is not an admin", done => {
      const user = { isAdmin: false };
      req.loggedInUserId = validMongoId;

      setMockUserModel(user);

      next = jest.fn().mockImplementation(err => {
        expect(err).toBeInstanceOf(AppError);
        expect(err).toEqual(
          expect.objectContaining({ message: "You do not have permission to perform this action" })
        );
        done();
      });
      checkAdminAuthorization(req as Request, res as Response, next);
    });

    it("should call next with no arguments if the user is an admin", done => {
      const user = { isAdmin: true };
      req.loggedInUserId = validMongoId;

      setMockUserModel(user);

      next = jest.fn().mockImplementation(() => {
        expect(next).toHaveBeenCalled();
        done();
      });
      checkAdminAuthorization(req as Request, res as Response, next);
    });
  });
});

function setMockUserModel(value: any) {
  UserModel.findById = jest.fn().mockImplementation(() => {
    return {
      setOptions: jest.fn().mockImplementation(() => {
        return {
          exec: jest.fn().mockResolvedValue(value),
        };
      }),
    };
  });
}
