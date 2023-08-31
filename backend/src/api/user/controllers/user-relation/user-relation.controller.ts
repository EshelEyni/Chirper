import { NextFunction, Request, Response } from "express";
import { asyncErrorCatcher } from "../../../../services/error/error.service";
import { validateIds } from "../../../../services/util/util.service";
import userRelationService, {
  UserRelationParams,
} from "../../services/user-relation/user-relation.service";
import { getLoggedInUserIdFromReq } from "../../../../services/als.service";
import { UserRelationKind } from "../../models/user-relation/user-relation.model";

type CreateRelationMiddleWareParams = {
  action: "add" | "remove";
  kind: UserRelationKind;
};

const addFollow = asyncErrorCatcher(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const addUserRelationMiddleware = createUserRelationMiddleware({
      action: "add",
      kind: UserRelationKind.Follow,
    });
    await addUserRelationMiddleware(req, res, next);
  }
);

const removeFollow = asyncErrorCatcher(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const removeUserRelationMiddleware = createUserRelationMiddleware({
      action: "remove",
      kind: UserRelationKind.Follow,
    });
    await removeUserRelationMiddleware(req, res, next);
  }
);

const addBlock = asyncErrorCatcher(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const addUserRelationMiddleware = createUserRelationMiddleware({
      action: "add",
      kind: UserRelationKind.Block,
    });

    await addUserRelationMiddleware(req, res, next);
  }
);

const removeBlock = asyncErrorCatcher(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const removeUserRelationMiddleware = createUserRelationMiddleware({
      action: "remove",
      kind: UserRelationKind.Block,
    });

    await removeUserRelationMiddleware(req, res, next);
  }
);

const addMute = asyncErrorCatcher(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const addUserRelationMiddleware = createUserRelationMiddleware({
      action: "add",
      kind: UserRelationKind.Mute,
    });

    await addUserRelationMiddleware(req, res, next);
  }
);

const removeMute = asyncErrorCatcher(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const removeUserRelationMiddleware = createUserRelationMiddleware({
      action: "remove",
      kind: UserRelationKind.Mute,
    });

    await removeUserRelationMiddleware(req, res, next);
  }
);

const createUserRelationMiddleware = ({ action, kind }: CreateRelationMiddleWareParams) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fromUserId = getLoggedInUserIdFromReq();
      const toUserId = req.params.id || req.params.userId;
      const { postId } = req.params;

      validateIds(
        { id: fromUserId, entityName: "loggedInUser" },
        { id: toUserId, entityName: "user" }
      );

      const query: UserRelationParams = { fromUserId, toUserId, kind };

      if (postId) {
        validateIds({ id: postId, entityName: "post" });
        query["postId"] = postId;
      }

      const result = await userRelationService[action](query);

      res.send({
        status: "success",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
};

export { addFollow, removeFollow, addBlock, removeBlock, addMute, removeMute };
