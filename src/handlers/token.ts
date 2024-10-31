import { Context } from "telegraf";

export const tokenHandler = async (ctx: Context) => {
  ctx.reply("Chat token is " + ctx.chat?.id);
};
