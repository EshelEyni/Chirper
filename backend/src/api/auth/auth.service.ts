import { User } from "../../../../shared/interfaces/user.interface";
const { promisify } = require("util");
const userService = require("../user/user.service");
const { logger } = require("../../services/logger.service");
const { UserModel } = require("../user/user.model");
const jwt = require("jsonwebtoken");
const config = require("../../config");

async function login(username: string, password: string | Buffer) {
  logger.debug(`auth.service - login with username: ${username}`);

  const user = await userService.getByUsername(username);
  if (!user) return Promise.reject("Invalid username or password");
  // const match = await bcrypt.compare(password, user.password);
  // if (!match) return Promise.reject("Invalid username or password");

  delete user.password;
  return user;
}

async function signup(user: User) {
  const savedUser = await UserModel.create(user);
  return savedUser;
}

function signToken(id: string) {
  return jwt.sign({ id }, config.jwtSecretCode, {
    expiresIn: config.jwtExpirationTime,
  });
}

async function verifyToken(token: string): Promise<{ id: string; timeStamp: number }> {
  const decoded = await promisify(jwt.verify)(token, config.jwtSecretCode);
  const { id, iat } = decoded;
  return { id, timeStamp: iat };
}

module.exports = {
  login,
  signup,
  signToken,
  verifyToken,
};
