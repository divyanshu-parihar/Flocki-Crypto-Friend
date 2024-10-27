import { Context } from 'telegraf';

export const startHandler = async (ctx: Context) => {
    const userMessage = ctx.message || '';
    await ctx.reply('Hello');
};