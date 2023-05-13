import express from "express";
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
import {
  deleteRequestLimiter,
  getRequestLimiter,
  patchRequestLimiter,
  postRequestLimiter,
} from "../../services/rate-limiter.service";

const router = express.Router();

router.get("/", getRequestLimiter, getUsers);
router.get("/:id", getRequestLimiter, getUserById);
router.get("/username/:username", getRequestLimiter, getUserByUsername);

router.patch("/loggedinUser", patchRequestLimiter, requireAuth, updateLoggedInUser);
router.delete("/loggedinUser", deleteRequestLimiter, requireAuth, removeLoggedInUser);

router.patch("/:id", patchRequestLimiter, requireAuth, requireAdmin, updateUser);
router.delete("/:id", deleteRequestLimiter, requireAuth, requireAdmin, removeUser);
router.post("/", postRequestLimiter, requireAuth, requireAdmin, addUser);

export default router;
