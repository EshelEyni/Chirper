const express = require("express");
// import { requireAuth, requireAdmin } from "../../middlewares/requireAuth.middleware.js";
const { getUser, getUsers, deleteUser, updateUser, addUser } = require("./user.controller");

const router = express.Router();
router.get("/", getUsers);
router.get("/:id", getUser);

router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

router.post("/", addUser);

module.exports = router;
