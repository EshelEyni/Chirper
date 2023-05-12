import express from "express";
// import { requireAuth, requireAdmin } from "../../middlewares/requireAuth.middleware.js";
import {
  getUserById,
  getUserByUsername,
  getUsers,
  removeUser,
  updateUser,
  addUser,
} from "./user.controller";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.get("/username/:username", getUserByUsername);

router.patch("/:id", updateUser);
router.delete("/:id", removeUser);

router.post("/", addUser);

export default router;
