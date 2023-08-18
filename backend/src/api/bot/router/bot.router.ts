import express from "express";
import {
  checkAdminAuthorization,
  checkUserAuthentication,
} from "../../../middlewares/authGuards/authGuards.middleware";
import { addPost, getBots } from "../controller/bot.controller";
const router = express.Router();

router.use(checkUserAuthentication);
router.use(checkAdminAuthorization);

router.get("/", getBots);
router.post("/:id", addPost);

export default router;
