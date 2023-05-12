import express from "express";
import { login, signup, logout, sendPasswordResetEmail, resetPassword } from "./auth.controller";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);
router.post("/forgotPassword", sendPasswordResetEmail);
router.patch("/resetPassword/:token", resetPassword);

export default router;
