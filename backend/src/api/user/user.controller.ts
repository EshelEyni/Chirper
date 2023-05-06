const userService = require("./user.service");
const { logger } = require("../../services/logger.service");
// import { socketService } from '../../services/socket.service.js'
// const authService = require("../auth/auth.service");
import { Request, Response } from "express";

async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await userService.query();
    res.send(users);
  } catch (err) {
    logger.error("Failed to get users", err as Error);
    res.status(500).send({ err: "Failed to get users" });
  }
}

async function getUserById(req: Request, res: Response): Promise<void> {
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

async function getUserByUsername(req: Request, res: Response): Promise<void> {
  try {
    const user = await userService.getByUsername(req.params.username);
    res.send(user);
  } catch (err) {
    logger.error("Failed to get user", err as Error);
    res.status(500).send({ err: "Failed to get user" });
  }
}

async function addUser(req: Request, res: Response): Promise<void> {
  try {
    const currUser = req.body;
    const user = await userService.add(currUser);
    res.send(user);
  } catch (err) {
    logger.error("Failed to add user", err as Error);
    res.status(500).send({ err: "Failed to add user" });
  }
}
async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userToUpdate = req.body;
    const updatedUser = await userService.update(id, userToUpdate);
    res.send(updatedUser);
  } catch (err) {
    logger.error("Failed to update user", err as Error);
    res.status(500).send({ err: "Failed to update user" });
  }
}

async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    await userService.remove(req.params.id);
    res.send({ msg: "Deleted successfully" });
  } catch (err) {
    logger.error("Failed to delete user", err as Error);
    res.status(500).send({ err: "Failed to delete user" });
  }
}

module.exports = {
  getUsers,
  getUserById,
  getUserByUsername,
  deleteUser,
  updateUser,
  addUser,
};
