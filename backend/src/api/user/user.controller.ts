import { Request, Response } from "express";
import { User } from "../../../../shared/interfaces/user.interface";
const userService = require("./user.service");
const { logger } = require("../../services/logger.service");
// import { socketService } from '../../services/socket.service.js'
// const authService = require("../auth/auth.service");
const { asyncErrorCatcher, AppError } = require("../../services/error.service");

const getUsers = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const users = (await userService.query()) as unknown as User[];

  res.status(200).send({
    status: "success",
    requestedAt: new Date().toISOString(),
    results: users.length,
    data: users,
  });
});

const getUserById = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) throw new AppError("No user id provided", 400);
  const user = (await userService.getById(id)) as unknown as User;
  if (!user) throw new AppError(`User with id ${id} not found`, 404);

  res.status(200).send({
    status: "success",
    data: user,
  });
});

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

const addUser = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const currUser = req.body;
  const user = await userService.add(currUser);

  res.status(201).send({
    status: "success",
    data: user,
  });
});

const updateUser = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) throw new AppError("No user id provided", 400);
  const userToUpdate = req.body;
  const isUserToUpdateEmpty = Object.keys(userToUpdate).length === 0;
  if (isUserToUpdateEmpty) throw new AppError("No user provided", 400);
  const updatedUser = await userService.update(id, userToUpdate);
  if (!updatedUser) throw new AppError("User not found", 404);

  res.status(200).send({
    status: "success",
    data: updatedUser,
  });
});

const removeUser = asyncErrorCatcher(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) throw new AppError("No user id provided", 400);
  const removedUser = await userService.remove(id);
  if (!removedUser) throw new AppError("User not found", 404);
  logger.warn(`User ${removedUser.username} was deleted`);
  res.status(204).send({
    status: "success",
    data: null,
  });
});

module.exports = {
  getUsers,
  getUserById,
  getUserByUsername,
  removeUser,
  updateUser,
  addUser,
};
