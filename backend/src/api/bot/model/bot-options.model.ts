import mongoose from "mongoose";
import { IBotPrompt } from "../../../Types/ITypes";

const botPromptSchema = new mongoose.Schema<IBotPrompt>(
  {
    botId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A bot prompt must have a bot id"],
      validate: {
        validator: async (botId: string) => {
          const bot = await mongoose.models.User.findById(botId);
          if (!bot) return false;
          return bot.isBot;
        },
        message: "Bot not found",
      },
    },
    prompt: {
      type: String,
      required: [true, "A bot prompt must have a prompt"],
    },
    type: {
      type: String,
      enum: ["text", "image", "poll", "video"],
      default: "text",
    },
  },
  {
    timestamps: true,
  }
);

botPromptSchema.index({ botId: 1, prompt: 1 }, { unique: true });

export const BotPromptModel = mongoose.model<IBotPrompt>(
  "BotPrompt",
  botPromptSchema,
  "bot_prompts"
);
