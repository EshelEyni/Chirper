import express from "express";
import {
  login,
  autoLogin,
  signup,
  logout,
  sendPasswordResetEmail,
  resetPassword,
  updatePassword,
} from "./auth.controller";
import { requireAuth } from "../../middlewares/requireAuth.middleware";
import { authRequestLimiter, postRequestLimiter } from "../../services/rate-limiter.service";

const router = express.Router();

router.post("/login", authRequestLimiter, login);
router.post("/auto-login", postRequestLimiter, autoLogin);
router.post("/signup", authRequestLimiter, signup);
router.post("/logout", authRequestLimiter, logout);
router.patch("/updatePassword", authRequestLimiter, requireAuth, updatePassword);
router.post("/forgotPassword", authRequestLimiter, sendPasswordResetEmail);
router.patch("/resetPassword/:token", authRequestLimiter, resetPassword);

export default router;
