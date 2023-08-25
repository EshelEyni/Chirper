import express from "express";
import { getBots } from "../controllers/bot/bot.controller";
import { addPost } from "../controllers/post/post.controller";
import {
  addBotManyPrompts,
  addBotPrompt,
  getBotPrompts,
} from "../controllers/prompt/prompt.controller";
import {
  checkAdminAuthorization,
  checkUserAuthentication,
} from "../../../middlewares/authGuards/authGuards.middleware";

const router = express.Router();

router.use(checkUserAuthentication);
router.use(checkAdminAuthorization);

router.get("/prompts", getBotPrompts);
router.get("/", getBots);
router.post("/:id([a-fA-F0-9]{24})", addPost);
router.post("/botPrompt", addBotPrompt);
router.post("/manyBotPrompts", addBotManyPrompts);

export default router;
