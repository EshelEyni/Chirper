import express from "express";

import { checkUserAuthentication } from "../../../middlewares/authGuards/authGuards.middleware";
import {
  addFollowings,
  addFollowingsFromPost,
  removeFollowings,
  removeFollowingsFromPost,
} from "../controllers/user-relation/user-relation.controller";

const router = express.Router();

router.use(checkUserAuthentication);

router.post("/:id/following", addFollowings);
router.delete("/:id/following", removeFollowings);
router.post("/:userId/following/:postId/fromPost", addFollowingsFromPost);
router.delete("/:userId/following/:postId/fromPost", removeFollowingsFromPost);

export default router;
