const userService = require("./user.service");
const { logger } = require("../../services/logger.service");
// import { socketService } from '../../services/socket.service.js'
// const authService = require("../auth/auth.service");
import { Request, Response } from "express";

async function getUsers(req: Request, res: Response) {
  try {
    const users = await userService.query();
    res.send(users);
  } catch (err) {
    logger.error("Failed to get users", err as Error);
    res.status(500).send({ err: "Failed to get users" });
  }
}

async function getUser(req: Request, res: Response) {
  try {
    const user = await userService.getById(req.params.id);
    // TODO: remove password from user
    // TODO: refactor to jsend format

    res.send(user);
  } catch (err) {
    logger.error("Failed to get user", err as Error);
    res.status(500).send({ err: "Failed to get user" });
  }
}

async function addUser(req: Request, res: Response) {
  const currUser = req.body;
  const user = await userService.add(currUser);
  res.send(user);
}

async function deleteUser(req: Request, res: Response) {
  try {
    await userService.remove(req.params.id);
    res.send({ msg: "Deleted successfully" });
  } catch (err) {
    logger.error("Failed to delete user", err as Error);
    res.status(500).send({ err: "Failed to delete user" });
  }
}

async function updateUser(req: Request, res: Response) {
  try {
    const userToUpdate = req.body;
    const updatedUser = await userService.update(userToUpdate);
    res.send(updatedUser);
  } catch (err) {
    logger.error("Failed to update user", err as Error);
    res.status(500).send({ err: "Failed to update user" });
  }
}

module.exports = {
  getUser,
  getUsers,
  deleteUser,
  updateUser,
  addUser,
};
