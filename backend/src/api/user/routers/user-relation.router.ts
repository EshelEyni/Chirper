import express from "express";

import { checkUserAuthentication } from "../../../middlewares/authGuards/authGuards.middleware";
import {
  addFollow,
  removeFollow,
  addBlock,
  removeBlock,
  addMute,
  removeMute,
} from "../controllers/user-relation/user-relation.controller";

const router = express.Router();

router.use(checkUserAuthentication);

router.post("/:id/follow", addFollow);
router.delete("/:id/follow", removeFollow);
router.post("/:userId/follow/:postId/fromPost", addFollow);
router.delete("/:userId/follow/:postId/fromPost", removeFollow);

router.post("/:id/block", addBlock);
router.delete("/:id/block", removeBlock);
router.post("/:userId/block/:postId/fromPost", addBlock);
router.delete("/:userId/block/:postId/fromPost", removeBlock);

router.post("/:id/mute", addMute);
router.delete("/:id/mute", removeMute);
router.post("/:userId/mute/:postId/fromPost", addMute);
router.delete("/:userId/mute/:postId/fromPost", removeMute);

export default router;
