import express from "express";
import {
  login,
  loginWithToken,
  signup,
  logout,
  sendPasswordResetEmail,
  resetPassword,
  updatePassword,
} from "../../Controllers/Auth/AuthController";
import { checkUserAuthentication } from "../../Middlewares/AuthGuards/AuthGuardsMiddleware";
import { authRequestLimiter } from "../../Services/RateLimiterService";

const router = express.Router();

router.post("/login/with-token", loginWithToken);

router.use(authRequestLimiter);
router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);
router.patch("/updatePassword", checkUserAuthentication, updatePassword);
router.post("/forgotPassword", sendPasswordResetEmail);
router.patch("/resetPassword/:token", resetPassword);

export default router;
