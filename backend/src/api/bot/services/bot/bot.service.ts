import { UserModel } from "../../../user/models/user/user.model";

async function getBots() {
  const bots = await UserModel.find({ isBot: true });
  return bots;
}

export default { getBots };

// Path: src\services\bot\bot.service.ts
