import { NextFunction, Request, Response } from "express";
import { asyncErrorCatcher } from "../../../../services/error/error.service";
import { validateIds } from "../../../../services/util/util.service";
import userRelationService from "../../services/user-relation/user-relation.service";

type UserRelationQuery = {
  toUserId: string;
  kind: "Follow" | "Block" | "Mute";
  postId?: string;
};

type CreateRelationMiddleWareParams = {
  action: "add" | "remove";
  kind: "Follow" | "Block" | "Mute";
};

const addFollowings = asyncErrorCatcher(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const addUserRelationMiddleware = createUserRelationMiddleware({
      action: "add",
      kind: "Follow",
    });
    await addUserRelationMiddleware(req, res, next);
  }
);

const removeFollowings = asyncErrorCatcher(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const removeUserRelationMiddleware = createUserRelationMiddleware({
      action: "remove",
      kind: "Follow",
    });
    await removeUserRelationMiddleware(req, res, next);
  }
);

const addFollowingsFromPost = asyncErrorCatcher(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const addUserRelationMiddleware = createUserRelationMiddleware({
      action: "add",
      kind: "Follow",
    });

    await addUserRelationMiddleware(req, res, next);
  }
);

const removeFollowingsFromPost = asyncErrorCatcher(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const removeUserRelationMiddleware = createUserRelationMiddleware({
      action: "remove",
      kind: "Follow",
    });

    await removeUserRelationMiddleware(req, res, next);
  }
);
const createUserRelationMiddleware = ({ action, kind }: CreateRelationMiddleWareParams) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const toUserId = req.params.id || req.params.userId;
    const { postId } = req.params;

    validateIds({ id: toUserId, entityName: "user" });

    const query: UserRelationQuery = { toUserId, kind };

    if (postId) {
      validateIds({ id: postId, entityName: "post" });
      query["postId"] = postId;
    }

    const updatedUsers = await userRelationService[action](query);

    res.send({
      status: "success",
      data: updatedUsers,
    });
  };
};

export { addFollowings, removeFollowings, addFollowingsFromPost, removeFollowingsFromPost };
