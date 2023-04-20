// const Cryptr = require('cryptr')

// const bcrypt = require('bcrypt')
// const userService = require('../user/user.service')
// const logger = require('../../services/logger.service')
// const config = require('../../config')

import Cryptr from "cryptr";
import bcrypt from "bcrypt";
import { userService } from "../user/user.service";
import { debug } from "../../services/logger.service";
import config from "../../config";
import { User } from "../../models/user.model";

const cryptr = new Cryptr(config.sessionKey);

async function login(username, password) {
  debug(`auth.service - login with username: ${username}`);

  const user = await userService.getByUsername(username);
  if (!user) return Promise.reject("Invalid username or password");
  const match = await bcrypt.compare(password, user.password);
  if (!match) return Promise.reject("Invalid username or password");

  delete user.password;
  return user;
}

async function signup(username, password, fullname) {
  const saltRounds = 10;

  debug(
    `auth.service - signup with username: ${username}, fullname: ${fullname}`
  );
  if (!username || !password || !fullname)
    return Promise.reject("fullname, username and password are required!");
  const users = await userService.query();
  if (users.find((currUser) => currUser.username === username)) {
    return Promise.reject("username already exists!");
  }
  const hash = await bcrypt.hash(password, saltRounds);
  return userService.add({ username, password: hash, fullname });
}

function getLoginToken(user) {
  return cryptr.encrypt(JSON.stringify(user._id));
}

async function validateToken(loginToken): Promise<User | null> {
  try {
    const json = cryptr.decrypt(loginToken);
    const loggedinUserId = JSON.parse(json);
    const loggedinUser = await userService.getById(loggedinUserId);
    return loggedinUser;
  } catch (err) {
    console.log("Invalid login token: " + err);
  }
  return null;
}

export const authService = {
  signup,
  login,
  getLoginToken,
  validateToken,
};
