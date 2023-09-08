import express from "express";
import {
  getUserById,
  getUserByUsername,
  getUsers,
  removeUser,
  updateUser,
  addUser,
  updateLoggedInUser,
  removeLoggedInUser,
} from "../../Controllers/User/UserController";
import {
  checkUserAuthentication,
  checkAdminAuthorization,
} from "../../Middlewares/AuthGuards/AuthGuardsMiddleware";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.get("/username/:username", getUserByUsername);

router.use(checkUserAuthentication);
router.patch("/loggedInUser", updateLoggedInUser);
router.delete("/loggedInUser", removeLoggedInUser);

router.use(checkAdminAuthorization);
router.post("/", addUser);
router.patch("/:id", updateUser);
router.delete("/:id", removeUser);

export default router;
