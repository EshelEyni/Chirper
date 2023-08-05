import { Request, Response } from "express";
import userService from "./user.service";
import { logger } from "../../services/logger/logger.service";
import {
  asyncErrorCatcher,
  AppError,
  validatePatchRequestBody,
} from "../../services/error/error.service";
import { getOne, createOne, updateOne, deleteOne } from "../../services/factory/factory.service";
import { UserModel } from "./user.model";
import { User } from "../../../../shared/interfaces/user.interface";
import { QueryObj } from "../../services/util/util.service";

const getUsers = asyncErrorCatcher(async (req: Request, res: Response) => {
  const queryString = req.query;
  const users = (await userService.query(queryString as QueryObj)) as unknown as User[];

  res.json({
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
  if (!user) throw new AppError(`User with username ${username} not found`, 404);

  res.send({
    status: "success",
    requestedAt: new Date().toISOString(),
    data: user,
  });
});

const updateLoggedInUser = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const userToUpdate = req.body;
  validatePatchRequestBody(userToUpdate);
  const { loggedinUserId } = req;
  if (!loggedinUserId) throw new AppError("User not logged in", 401);
  const updatedUser = await userService.update(loggedinUserId, userToUpdate);
  // TODO: check if this error is needed
  if (!updatedUser) throw new AppError("User not found", 404);

  res.send({
    status: "success",
    data: updatedUser,
  });
});

const removeLoggedInUser = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { loggedinUserId } = req;
  if (!loggedinUserId) throw new AppError("User not logged in", 401);
  const removedUser = await userService.removeAccount(loggedinUserId);
  if (!removedUser) throw new AppError("User not found", 404);
  logger.warn(`User ${removedUser.username} was deactivated`);

  res.status(204).send({
    status: "success",
    data: null,
  });
});

const addFollowings = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { loggedinUserId } = req;
  const toUserId = req.params.id;
  if (!loggedinUserId) throw new AppError("No logged in user id provided", 400);
  if (!toUserId) throw new AppError("No user id provided", 400);
  const updatedUser = await userService.addFollowings(loggedinUserId, toUserId);

  res.send({
    status: "success",
    data: updatedUser,
  });
});

const removeFollowings = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { loggedinUserId } = req;
  const toUserId = req.params.id;
  if (!loggedinUserId) throw new AppError("No logged in user id provided", 400);
  if (!toUserId) throw new AppError("No user id provided", 400);
  const updatedUser = await userService.removeFollowings(loggedinUserId, toUserId);

  res.send({
    status: "success",
    data: updatedUser,
  });
});

const addFollowingsFromPost = asyncErrorCatcher(
  async (req: Request, res: Response): Promise<void> => {
    const { loggedinUserId } = req;
    const { postId, userId: toUserId } = req.params;
    if (!loggedinUserId) throw new AppError("No logged in user id provided", 400);
    if (!toUserId) throw new AppError("No user id provided", 400);
    if (!postId) throw new AppError("No post id provided", 400);

    const updatedPost = await userService.addFollowings(loggedinUserId, toUserId, postId);

    res.send({
      status: "success",
      data: updatedPost,
    });
  }
);

const removeFollowingsFromPost = asyncErrorCatcher(
  async (req: Request, res: Response): Promise<void> => {
    const { loggedinUserId } = req;
    const { postId, userId: toUserId } = req.params;

    if (!loggedinUserId) throw new AppError("No logged in user id provided", 400);
    if (!toUserId) throw new AppError("No user id provided", 400);
    if (!postId) throw new AppError("No post id provided", 400);
    const updatedPost = await userService.removeFollowings(loggedinUserId, toUserId, postId);

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
