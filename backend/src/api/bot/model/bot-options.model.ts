import mongoose from "mongoose";

const botPromptSchema = new mongoose.Schema(
  {
    botId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A bot prompt must have a bot id"],
    },
    prompt: {
      type: String,
      required: [true, "A bot prompt must have a prompt"],
    },
  },
  {
    timestamps: true,
  }
);

export const BotPromptModel = mongoose.model("BotPrompt", botPromptSchema);
