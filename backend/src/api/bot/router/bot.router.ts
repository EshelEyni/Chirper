import express from "express";
import {
  checkAdminAuthorization,
  checkUserAuthentication,
} from "../../../middlewares/authGuards/authGuards.middleware";
import { addPost, getBots, addBotPrompt } from "../controller/bot.controller";
const router = express.Router();

router.use(checkUserAuthentication);
router.use(checkAdminAuthorization);

router.get("/", getBots);
router.post("/:id([a-fA-F0-9]{24})", addPost);
router.post("/botPrompt", addBotPrompt);

export default router;
