import { Request, Response, NextFunction } from "express";
import { checkUserAuthentication } from "./authGuards.middleware";
import { UserModel } from "../../api/user/user.model";
import tokenService from "../../services/token/token.service";

jest.mock("../../api/user/user.model");
jest.mock("../../services/token/token.service");

const validMongoId = "5f8d0a6f9d6d7d2f3c0d7d2f";

describe("Auth Gaurds Middleware", () => {
  describe("checkUserAuthentication", () => {
    let reqMock: Partial<Request>;
    let resMock: Partial<Response>;
    const nextMock: NextFunction = jest.fn();

    beforeEach(() => {
      reqMock = {};
      resMock = {
        json: jest.fn(),
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("Should successfully authenticate user", async () => {
      reqMock.cookies = {
        loginToken: "some-token",
      };
      (tokenService.getTokenFromRequest as jest.Mock).mockReturnValue("some-token");
      (tokenService.verifyToken as jest.Mock).mockResolvedValue({
        id: validMongoId,
        timeStamp: 123456,
      });

      (UserModel.findById as jest.Mock).mockResolvedValue({
        id: validMongoId,
        isAdmin: false,
        changedPasswordAfter: jest.fn().mockReturnValue(false),
      });

      await checkUserAuthentication(reqMock as any, resMock as any, nextMock);
      expect(tokenService.getTokenFromRequest).toHaveBeenCalled();
      expect(tokenService.verifyToken).toHaveBeenCalled();
      expect(UserModel.findById).toHaveBeenCalled();

      expect(reqMock.loggedinUserId).toEqual(validMongoId);
      expect(nextMock).toHaveBeenCalled();
    });
  });
});
