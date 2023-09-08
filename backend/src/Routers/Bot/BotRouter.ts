import express from "express";
import { getBots } from "../../Controllers/Bot/BotBontroller";
import { addPost } from "../../Controllers/BotPost/BotPostController";
import {
  addBotManyPrompts,
  addBotPrompt,
  getBotPrompts,
} from "../../Controllers/BotPrompt/BotPromptController";
import {
  checkAdminAuthorization,
  checkUserAuthentication,
} from "../../Middlewares/AuthGuards/AuthGuardsMiddleware";

const router = express.Router();

router.use(checkUserAuthentication);
router.use(checkAdminAuthorization);

router.get("/prompts", getBotPrompts);
router.get("/", getBots);
router.post("/:id([a-fA-F0-9]{24})", addPost);
router.post("/botPrompt", addBotPrompt);
router.post("/manyBotPrompts", addBotManyPrompts);

export default router;
