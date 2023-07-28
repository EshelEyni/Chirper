import { Request, Response, NextFunction } from "express";
import { checkUserAuthentication } from "./authGuards.middleware";
import { UserModel } from "../../api/user/user.model";
import tokenService from "../../services/token/token.service";

jest.mock("../../api/user/user.model");
jest.mock("../../services/token/token.service");

const validMongoId = "5f8d0a6f9d6d7d2f3c0d7d2f";
const token = "some-token";

describe("Auth Gaurds Middleware", () => {
  describe("checkUserAuthentication", () => {
    let reqMock: Partial<Request>;
    let resMock: Partial<Response>;
    const nextMock: NextFunction = jest.fn();

    beforeEach(() => {
      reqMock = {
        cookies: { loginToken: token },
        loggedinUserId: null,
      } as any as Partial<Request>;
      resMock = {
        json: jest.fn(),
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("Should successfully authenticate user", async () => {
      reqMock.cookies = { loginToken: token };
      (tokenService.getTokenFromRequest as jest.Mock).mockReturnValue(token);
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
      expect(tokenService.getTokenFromRequest).toHaveBeenCalledWith(reqMock as any);
      expect(tokenService.verifyToken).toHaveBeenCalledWith(token);
      expect(UserModel.findById).toHaveBeenCalledWith(validMongoId);

      expect(reqMock.loggedinUserId).toEqual(validMongoId);
      expect(nextMock).toHaveBeenCalled();
    });
  });
});
