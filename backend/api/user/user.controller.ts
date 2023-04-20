import { userService } from "./user.service";
import { error } from "../../services/logger.service";
// import { socketService } from '../../services/socket.service'
import { authService } from "../auth/auth.service";
import { Request, Response } from "express";

export async function getUser(req: Request, res: Response) {
  try {
    const user = await userService.getById(req.params.id);
    res.send(user);
  } catch (err) {
    error("Failed to get user", err);
    res.status(500).send({ err: "Failed to get user" });
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await userService.query();
    res.send(users);
  } catch (err) {
    error("Failed to get users", err);
    res.status(500).send({ err: "Failed to get users" });
  }
}

export async function addUser(req: Request, res: Response) {
  const currUser = req.body;
  const user = await userService.add(currUser);
  res.send(user);
}

export async function deleteUser(req: Request, res: Response) {
  try {
    await userService.remove(req.params.id);
    res.send({ msg: "Deleted successfully" });
  } catch (err) {
    error("Failed to delete user", err);
    res.status(500).send({ err: "Failed to delete user" });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const userToUpdate = req.body;
    const updatedUser = await userService.update(userToUpdate);
    res.send(updatedUser);
  } catch (err) {
    error("Failed to update user", err);
    res.status(500).send({ err: "Failed to update user" });
  }
}
