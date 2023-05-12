import { User } from "../../../../shared/interfaces/user.interface";
import { UserModel } from "../user/user.model";
import jwt from "jsonwebtoken";
import config from "../../config";
import { AppError } from "../../services/error.service";
import { sendEmail } from "../../services/util.service";
import crypto from "crypto";

async function login(username: string, password: string): Promise<{ user: User; token: string }> {
  const user = await UserModel.findOne({ username }).select("+password");
  if (!user || !(await user.checkPassword(password, user.password))) {
    throw new AppError("Incorrect username or password", 400);
  }
  const token = signToken(user.id);

  return {
    user: user as unknown as User,
    token,
  };
}

async function signup(user: User): Promise<{ savedUser: User; token: string }> {
  const savedUser = await UserModel.create(user);
  const token = signToken(savedUser.id);
  return {
    savedUser: savedUser as unknown as User,
    token,
  };
}

function signToken(id: string) {
  if (!config.jwtSecretCode) throw new AppError("jwtSecretCode not found in config", 500);
  if (!config.jwtExpirationTime) throw new AppError("jwtExpirationTime not found in config", 500);

  return jwt.sign({ id }, config.jwtSecretCode, {
    expiresIn: config.jwtExpirationTime,
  });
}

async function verifyToken(token: string): Promise<{ id: string; timeStamp: number }> {
  if (!config.jwtSecretCode) throw new AppError("jwtSecretCode not found in config", 500);

  try {
    const decoded = jwt.verify(token, config.jwtSecretCode) as {
      id: string;
      iat: number;
    };
    const { id, iat } = decoded;
    return { id, timeStamp: iat };
  } catch (err) {
    throw new AppError("Token verification failed", 401);
  }
}

async function sendPasswordResetEmail(email: string, resetURL: string) {
  const user = await UserModel.findOne({ email });
  if (!user) throw new AppError("User not found", 404);

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${
    resetURL + resetToken
  }.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError("There was an error sending the email. Try again later!", 500);
  }
}

async function resetPassword(
  token: string,
  password: string,
  passwordConfirm: string
): Promise<{ user: User; newToken: string }> {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw new AppError("Token is invalid or has expired", 400);
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  const newToken = signToken(user.id);

  return {
    user: user as unknown as User,
    newToken,
  };
}

export default { login, signup, signToken, verifyToken, sendPasswordResetEmail, resetPassword };
