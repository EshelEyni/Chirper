import { Request, Response } from "express";
import userService from "../services/user/user.service";
import { logger } from "../../../services/logger/logger.service";
import {
  asyncErrorCatcher,
  AppError,
  validatePatchRequestBody,
} from "../../../services/error/error.service";
import { getOne, createOne, updateOne, deleteOne } from "../../../services/factory/factory.service";
import { UserModel } from "../models/user.model";
import { QueryObj, validateIds } from "../../../services/util/util.service";
import followerService from "../services/follower/follower.service";

const getUsers = asyncErrorCatcher(async (req: Request, res: Response) => {
  const queryString = req.query;
  const users = await userService.query(queryString as QueryObj);
  res.send({
    status: "success",
    requestedAt: new Date().toISOString(),
    results: users.length,
    data: users,
  });
});

const getUserById = getOne(UserModel);
const addUser = createOne(UserModel);
const updateUser = updateOne(UserModel, [
  "username",
  "email",
  "fullname",
  "imgUrl",
  "email",
  "isApprovedLocation",
]);
const removeUser = deleteOne(UserModel);

const getUserByUsername = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { username } = req.params;
  if (!username) throw new AppError("No user username provided", 400);
  const user = await userService.getByUsername(username);

  res.send({
    status: "success",
    requestedAt: new Date().toISOString(),
    data: user,
  });
});

const updateLoggedInUser = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const userToUpdate = req.body;
  validatePatchRequestBody(userToUpdate);
  const { loggedInUserId } = req;
  if (!loggedInUserId) throw new AppError("User not logged in", 401);
  const updatedUser = await userService.update(loggedInUserId, userToUpdate);

  res.send({
    status: "success",
    data: updatedUser,
  });
});

const removeLoggedInUser = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { loggedInUserId } = req;
  if (!loggedInUserId) throw new AppError("User not logged in", 401);
  const removedUser = await userService.removeAccount(loggedInUserId);
  logger.warn(`User ${removedUser.username} was deactivated`);

  res.status(204).send({
    status: "success",
    data: null,
  });
});

const addFollowings = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { loggedInUserId } = req;
  const toUserId = req.params.id;
  validateIds(
    { id: loggedInUserId, entityName: "loggedInUser" },
    { id: toUserId, entityName: "user" }
  );
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const updatedUsers = await followerService.add(loggedInUserId!, toUserId);

  res.send({
    status: "success",
    data: updatedUsers,
  });
});

const removeFollowings = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { loggedInUserId } = req;
  const toUserId = req.params.id;
  validateIds(
    { id: loggedInUserId, entityName: "loggedInUser" },
    { id: toUserId, entityName: "user" }
  );
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const updatedUser = await followerService.remove(loggedInUserId!, toUserId);

  res.send({
    status: "success",
    data: updatedUser,
  });
});

const addFollowingsFromPost = asyncErrorCatcher(
  async (req: Request, res: Response): Promise<void> => {
    const { loggedInUserId } = req;
    const { postId, userId: toUserId } = req.params;

    validateIds(
      { id: loggedInUserId, entityName: "loggedInUser" },
      { id: toUserId, entityName: "user" },
      { id: postId, entityName: "post" }
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const updatedPost = await followerService.add(loggedInUserId!, toUserId, postId);

    res.send({
      status: "success",
      data: updatedPost,
    });
  }
);

const removeFollowingsFromPost = asyncErrorCatcher(
  async (req: Request, res: Response): Promise<void> => {
    const { loggedInUserId } = req;
    const { postId, userId: toUserId } = req.params;

    validateIds(
      { id: loggedInUserId, entityName: "loggedInUser" },
      { id: toUserId, entityName: "user" },
      { id: postId, entityName: "post" }
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const updatedPost = await followerService.remove(loggedInUserId!, toUserId, postId);

    res.send({
      status: "success",
      data: updatedPost,
    });
  }
);

export {
  getUsers,
  getUserById,
  getUserByUsername,
  addUser,
  updateUser,
  removeUser,
  updateLoggedInUser,
  removeLoggedInUser,
  addFollowings,
  removeFollowings,
  addFollowingsFromPost,
  removeFollowingsFromPost,
};
