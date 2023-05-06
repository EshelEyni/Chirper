module.exports = () => {
  const express = require("express");
  // import { requireAuth, requireAdmin } from "../../middlewares/requireAuth.middleware.js";
  const {
    getUserById,
    getUserByUsername,
    getUsers,
    deleteUser,
    updateUser,
    addUser,
  } = require("./user.controller");

  const router = express.Router();

  router.get("/", getUsers);
  router.get("/:id", getUserById);
  router.get("/username/:username", getUserByUsername);

  router.patch("/:id", updateUser);
  router.delete("/:id", deleteUser);

  router.post("/", addUser);

  return router;
};
