import { Context } from "telegraf";
import { prisma } from "../bot";

export async function handleBalance(ctx: Context) {
  try {
    if (!ctx.message?.from?.id) {
      return await ctx.reply("Could not identify user.");
    }

    if (ctx.chat?.type !== "private") {
      return await ctx.reply(
        "This command can only be used in private messages."
      );
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: ctx.message.from.id.toString() },
    });

    if (!user) {
      return await ctx.reply("User not found. Please register first.");
    }

    await ctx.reply(`Your current balance is: ${user.credits} credits`);
  } catch (error) {
    console.error("Balance command error:", error);
    await ctx.reply("An error occurred while checking your balance.");
  }
}

// handlers/myBalanceHandler.ts
export async function handleMyBalance(ctx: Context) {
  try {
    if (!ctx.message?.from?.id) {
      return await ctx.reply("Could not identify user.");
    }

    const user = await prisma.user.findUnique({
      where: { telegramId: ctx.message.from.id.toString() },
    });

    if (!user) {
      return await ctx.reply("User not found. Please register first.");
    }

    await ctx.reply(`Your current balance is: ${user.credits} credits`);
  } catch (error) {
    console.error("MyBalance command error:", error);
    await ctx.reply("An error occurred while checking your balance.");
  }
}

// handlers/userIdHandler.ts
export async function handleUserId(ctx: Context) {
  try {
    const userId = ctx.message?.from?.id;
    if (!userId) {
      return await ctx.reply("Could not identify user.");
    }
    await ctx.reply(`Your user ID is: ${userId}`);
  } catch (error) {
    console.error("UserID command error:", error);
    await ctx.reply("An error occurred while getting your user ID.");
  }
}

// handlers/chatIdHandler.ts
export async function handleChatId(ctx: Context) {
  try {
    const chatId = ctx.chat?.id;
    if (!chatId) {
      return await ctx.reply("Could not identify chat.");
    }
    await ctx.reply(`Current chat ID is: ${chatId}`);

    await prisma.chat.upsert({
      where: { chatId: chatId.toString() },
      update: { name: ctx.chat?.type || "Private Chat" },
      create: {
        chatId: chatId.toString(),
        name: ctx.chat?.type || "Private Chat",
      },
    });
  } catch (error) {
    console.error("ChatID command error:", error);
    await ctx.reply("An error occurred while getting the chat ID.");
  }
}

// handlers/wubbaHandler.ts
export async function handleWubba(ctx: Context) {
  try {
    await ctx.reply("Lubba dub dub! 🤖");
  } catch (error) {
    console.error("Wubba command error:", error);
    await ctx.reply("An error occurred with the ping command.");
  }
}

// handlers/helpHandler.ts
export async function handleHelp(ctx: Context) {
  try {
    await ctx.reply(
      "📚 Check out our documentation at: https://your-docs-url.com"
    );
  } catch (error) {
    console.error("Help command error:", error);
    await ctx.reply("An error occurred while showing the help message.");
  }
}
