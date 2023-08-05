import express from "express";
import {
  login,
  autoLogin,
  signup,
  logout,
  sendPasswordResetEmail,
  resetPassword,
  updatePassword,
} from "./controller/auth.controller";
import { checkUserAuthentication } from "../../middlewares/authGuards/authGuards.middleware";
import { authRequestLimiter } from "../../services/rate-limiter.service";

const router = express.Router();

router.post("/auto-login", autoLogin);

router.use(authRequestLimiter);
router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);
router.patch("/updatePassword", checkUserAuthentication, updatePassword);
router.post("/forgotPassword", sendPasswordResetEmail);
router.patch("/resetPassword/:token", resetPassword);

export default router;
