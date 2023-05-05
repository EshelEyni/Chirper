const Cryptr = require("cryptr");
const bcrypt = require("bcrypt");
const userService = require("../user/user.service");
const { logger } = require("../../services/logger.service");
const config = require("../../config");

import { User } from "../../../../shared/interfaces/user.interface";

const cryptr = new Cryptr(config.sessionKey);

async function login(username: string, password: string | Buffer) {
  logger.debug(`auth.service - login with username: ${username}`);

  const user = await userService.getByUsername(username);
  if (!user) return Promise.reject("Invalid username or password");
  const match = await bcrypt.compare(password, user.password);
  if (!match) return Promise.reject("Invalid username or password");

  delete user.password;
  return user;
}

async function signup(username: any, password: string | Buffer, fullname: string) {
  const saltRounds = 10;

  // logger.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}`);
  // if (!username || !password || !fullname) return Promise.reject("fullname, username and password are required!");
  // const users = await userService.query();
  // if (users.find((currUser) => currUser.username === username)) {
  //   return Promise.reject("username already exists!");
  // }
  // const hash = await bcrypt.hash(password, saltRounds);
  // // return userService.add({ username, password: hash, fullname });
  // const user = await userService.add({ username } as User);
  // delete user.password;
  // return user;
}

function getLoginToken(user: User) {
  return cryptr.encrypt(JSON.stringify(user._id));
}

async function validateToken(loginToken: string): Promise<User | null> {
  try {
    const json = cryptr.decrypt(loginToken);
    const loggedinUserId = JSON.parse(json);
    const loggedinUser = await userService.getById(loggedinUserId);
    return loggedinUser;
  } catch (err) {
    logger.error("Invalid login token: " + err);
  }
  return null;
}

module.exports = {
  login,
  signup,
  getLoginToken,
  validateToken,
};
