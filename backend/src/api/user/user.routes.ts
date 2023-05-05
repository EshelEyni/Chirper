import { Router } from "express";
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/requireAuth.middleware.js";
import {
  getUser,
  getUsers,
  deleteUser,
  updateUser,
  addUser,
} from "./user.controller.js";

const router = Router();
router.get("/", getUsers);
router.get("/:id", getUser);

router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

router.post("/", addUser);

export default router;
