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
  removeLoggedInUser,
} from "./user.controller";
import { requireAuth, requireAdmin } from "../../middlewares/requireAuth.middleware";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.get("/username/:username", getUserByUsername);

router.patch("/loggedinUser", requireAuth, updateLoggedInUser);
router.delete("/loggedinUser", requireAuth, removeLoggedInUser);

router.patch("/:id", requireAuth, requireAdmin, updateUser);
router.delete("/:id", requireAuth, requireAdmin, removeUser);

router.post("/", addUser);

export default router;
