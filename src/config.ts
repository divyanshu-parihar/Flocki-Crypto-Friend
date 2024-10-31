import dotenv from "dotenv";

dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN || "",
  aiApiKey: process.env.AI_API_KEY || "",
  cryptoApiKey: process.env.CRYPTO_API_KEY || "",
  MAIN_TELEGRAM_CHANNEL: "-1002371334829",
};
