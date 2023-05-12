import express from "express";
// import { requireAuth, requireAdmin } from "../../middlewares/requireAuth.middleware.js";
import {
  getUserById,
  getUserByUsername,
  getUsers,
  removeUser,
  updateUser,
  addUser,
  updateLoggedInUser,
} from "./user.controller";
import { requireAuth } from "../../middlewares/requireAuth.middleware";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.get("/username/:username", getUserByUsername);

router.patch("/loggedinUser", requireAuth, updateLoggedInUser);

router.patch("/:id", requireAuth, updateUser);
router.delete("/:id", requireAuth, removeUser);

router.post("/", addUser);

export default router;
