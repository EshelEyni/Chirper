import express from "express";
import {
  login,
  signup,
  logout,
  sendPasswordResetEmail,
  resetPassword,
  updatePassword,
} from "./auth.controller";
import { requireAuth } from "../../middlewares/requireAuth.middleware";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);
router.patch("/updatePassword", requireAuth, updatePassword);
router.post("/forgotPassword", sendPasswordResetEmail);
router.patch("/resetPassword/:token", resetPassword);

export default router;
