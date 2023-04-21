import { Router } from "express";
import {
  requireAuth,
  requireAdmin,
} from "../../middlewares/requireAuth.middleware";
import {
  getUser,
  getUsers,
  deleteUser,
  updateUser,
  addUser,
} from "./user.controller";

const router = Router();
router.get("/", getUsers);
router.get("/:id", getUser);

router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

router.post("/", addUser);

export default router;
