import { Request, Response } from "express";
import userService from "./user.service";
import { logger } from "../../services/logger.service";
import {
  asyncErrorCatcher,
  AppError,
  validatePatchRequestBody,
} from "../../services/error.service";
import factory from "../../services/factory.service";
import { UserModel } from "./user.model";

const getUsers = factory.getAll(UserModel);
const getUserById = factory.getOne(UserModel);
const addUser = factory.createOne(UserModel);
const updateUser = factory.updateOne(UserModel, [
  "username",
  "email",
  "fullname",
  "imgUrl",
  "email",
  "isApprovedLocation",
]);
const removeUser = factory.deleteOne(UserModel);

const getUserByUsername = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { username } = req.params;
  if (!username) throw new AppError("No user username provided", 400);
  const user = await userService.getByUsername(username);
  if (!user) throw new AppError(`User with username ${username} not found`, 404);

  res.status(200).send({
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
  if (!updatedUser) throw new AppError("User not found", 404);

  res.status(200).send({
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

export {
  getUsers,
  getUserById,
  getUserByUsername,
  addUser,
  updateUser,
  removeUser,
  updateLoggedInUser,
  removeLoggedInUser,
};
