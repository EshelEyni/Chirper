import express from "express";
import {
  checkAdminAuthorization,
  checkUserAuthentication,
} from "../../../middlewares/authGuards/authGuards.middleware";
import {
  addPost,
  getBots,
  getBotPrompts,
  addBotPrompt,
  addBotManyPrompt,
} from "../controller/bot.controller";
const router = express.Router();

router.use(checkUserAuthentication);
router.use(checkAdminAuthorization);

router.get("/prompts", getBotPrompts);
router.get("/", getBots);
router.post("/:id([a-fA-F0-9]{24})", addPost);
router.post("/botPrompt", addBotPrompt);
router.post("/manyBotPrompts", addBotManyPrompt);

export default router;
