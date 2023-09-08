import express from "express";

import { checkUserAuthentication } from "../../Middlewares/AuthGuards/AuthGuardsMiddleware";
import {
  addFollow,
  removeFollow,
  addBlock,
  removeBlock,
  addMute,
  removeMute,
} from "../../Controllers/UserRelation/UserRelationController";

const router = express.Router();

router.use(checkUserAuthentication);

router.post("/:id/follow", addFollow);
router.post("/:userId/follow/:postId/fromPost", addFollow);

router.delete("/:id/follow", removeFollow);
router.delete("/:userId/follow/:postId/fromPost", removeFollow);

router.post("/:id/mute", addMute);
router.post("/:userId/mute/:postId/fromPost", addMute);
router.delete("/:id/mute", removeMute);
router.delete("/:userId/mute/:postId/fromPost", removeMute);

router.post("/:id/block", addBlock);
router.post("/:userId/block/:postId/fromPost", addBlock);
router.delete("/:id/block", removeBlock);
router.delete("/:userId/block/:postId/fromPost", removeBlock);

export default router;
