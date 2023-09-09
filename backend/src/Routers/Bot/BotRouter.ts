import express from "express";
import { getBots } from "../../controllers/bot/botController";
import { addPost } from "../../controllers/botPost/botPostController";
import {
  addBotManyPrompts,
  addBotPrompt,
  getBotPrompts,
} from "../../controllers/botPrompt/botPromptController";
import {
  checkAdminAuthorization,
  checkUserAuthentication,
} from "../../middlewares/authGuards/authGuardsMiddleware";

const router = express.Router();

router.use(checkUserAuthentication);
router.use(checkAdminAuthorization);

router.get("/prompts", getBotPrompts);
router.get("/", getBots);
router.post("/:id([a-fA-F0-9]{24})", addPost);
router.post("/botPrompt", addBotPrompt);
router.post("/manyBotPrompts", addBotManyPrompts);

export default router;
