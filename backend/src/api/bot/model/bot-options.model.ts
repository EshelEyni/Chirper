import mongoose from "mongoose";

export interface BotPromptDocument extends mongoose.Document {
  botId: string;
  prompt: string;
}

const botPromptSchema = new mongoose.Schema(
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
        message: "Post must have no more than 4 images.",
      },
    },
    prompt: {
      type: String,
      required: [true, "A bot prompt must have a prompt"],
    },
    type: {
      type: String,
      enum: ["text", "image"],
      default: "text",
    },
  },
  {
    timestamps: true,
  }
);

botPromptSchema.index({ botId: 1, prompt: 1 }, { unique: true });

export const BotPromptModel = mongoose.model("BotPrompt", botPromptSchema, "bot_prompts");
