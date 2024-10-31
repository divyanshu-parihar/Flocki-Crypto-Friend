import { Context, Markup } from "telegraf";
import config from "../profiles";
export const personalityHandler = async (ctx: Context) => {
  let profiles = config.profiles;
  let keyboard = [];
  for (let i = 0; i < 10; i++) {
    keyboard.push([
      { text: profiles[i].name, callback_data: "personality-" + i },
    ]);
  }

  await ctx.reply(
    "Select chat mode",
    Markup.inlineKeyboard([...keyboard.slice(0, 10)])
  );
};
