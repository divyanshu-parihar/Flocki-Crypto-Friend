import { Context } from "telegraf";
import { prisma } from "../bot";
import { lchown } from "fs";

async function isAdmin(ctx: Context): Promise<boolean> {
  const member = await ctx.telegram.getChatMember(
    ctx.chat?.id as number,
    ctx.from!.id
  );
  return ["creator", "administrator"].includes(member.status);
}

// Helper function to get or create chat settings
async function getChatSettings(chatId: string) {
  return prisma.chatSettings.upsert({
    where: { chatId },
    create: { chatId },
    update: {},
  });
}

// Command handler functions
export async function handleRickNews(ctx: Context) {
  if (!(await isAdmin(ctx))) {
    return ctx.reply("Only administrators can use this command.");
  }

  const arg = ctx.text?.split(" ")[1]?.toLowerCase();
  if (arg !== "on" && arg !== "off") {
    return ctx.reply('Please specify either "on" or "off".');
  }

  const enabled = arg === "on";
  await prisma.chatSettings.upsert({
    where: { chatId: String(ctx.chat?.id) },
    create: { chatId: String(ctx.chat?.id), rickNews: enabled },
    update: { rickNews: enabled },
  });

  return ctx.reply(
    `Rick news updates are now ${enabled ? "enabled" : "disabled"}.`
  );
}

export async function handleAutoResponder(ctx: Context) {
  if (!(await isAdmin(ctx))) {
    return ctx.reply("Only administrators can use this command.");
  }

  const arg = ctx.text?.split(" ")[1]?.toLowerCase();
  if (arg !== "on" && arg !== "off") {
    return ctx.reply('Please specify either "on" or "off".');
  }

  const enabled = arg === "on";
  await prisma.chatSettings.upsert({
    where: { chatId: String(ctx.chat?.id) },
    create: { chatId: String(ctx.chat?.id), autoResponder: enabled },
    update: { autoResponder: enabled },
  });

  return ctx.reply(
    `Auto-responder is now ${enabled ? "enabled" : "disabled"}.`
  );
}

export async function handleNoResultMode(ctx: Context) {
  if (!(await isAdmin(ctx))) {
    return ctx.reply("Only administrators can use this command.");
  }

  const arg = ctx.text?.split(" ")[1]?.toLowerCase();
  if (arg !== "on" && arg !== "off") {
    return ctx.reply('Please specify either "on" or "off".');
  }

  const enabled = arg === "on";
  await prisma.chatSettings.upsert({
    where: { chatId: String(ctx.chat?.id) },
    create: { chatId: String(ctx.chat?.id), noResultMode: enabled },
    update: { noResultMode: enabled },
  });

  return ctx.reply(
    `No result mode is now ${enabled ? "enabled" : "disabled"}.`
  );
}

export async function handlePriceMode(ctx: Context) {
  if (!(await isAdmin(ctx))) {
    return ctx.reply("Only administrators can use this command.");
  }

  const arg = ctx.text?.split(" ")[1]?.toLowerCase();
  if (arg !== "sim" && arg !== "adv") {
    return ctx.reply('Please specify either "sim" or "adv".');
  }

  await prisma.chatSettings.upsert({
    where: { chatId: String(ctx.chat?.id) },
    create: { chatId: String(ctx.chat?.id), priceMode: arg },
    update: { priceMode: arg },
  });

  return ctx.reply(`Price mode is now set to ${arg}.`);
}

export async function handleEmojiMode(ctx: Context) {
  if (!(await isAdmin(ctx))) {
    return ctx.reply("Only administrators can use this command.");
  }

  const arg = ctx.text?.split(" ")[1]?.toLowerCase();
  if (arg !== "on" && arg !== "off") {
    return ctx.reply('Please specify either "on" or "off".');
  }

  const enabled = arg === "on";
  await prisma.chatSettings.upsert({
    where: { chatId: String(ctx.chat?.id) },
    create: { chatId: String(ctx.chat?.id), emojiMode: enabled },
    update: { emojiMode: enabled },
  });

  return ctx.reply(`Emoji mode is now ${enabled ? "enabled" : "disabled"}.`);
}

export async function handleAnon(ctx: Context) {
  const arg = ctx.text?.split(" ")[1]?.toLowerCase();
  if (arg !== "on" && arg !== "off") {
    return ctx.reply('Please specify either "on" or "off".');
  }

  const anonymous = arg === "on";
  await prisma.member.upsert({
    where: {
      userId_chatId: {
        userId: String(ctx.from?.id.toString()),
        chatId: String(ctx.chat?.id),
      },
    },
    create: {
      userId: String(ctx.from?.id),
      chatId: String(ctx.chat?.id),
      anonymous,
      username: ctx.from?.username,
    },
    update: { anonymous },
  });

  return ctx.reply(
    `Your anonymity setting is now ${anonymous ? "enabled" : "disabled"}.`
  );
}

export async function handleFixTwitter(ctx: Context) {
  if (!(await isAdmin(ctx))) {
    return ctx.reply("Only administrators can use this command.");
  }

  const arg = ctx.text?.split(" ")[1]?.toLowerCase();
  if (arg !== "on" && arg !== "off") {
    return ctx.reply('Please specify either "on" or "off".');
  }

  const enabled = arg === "on";
  await prisma.chatSettings.upsert({
    where: { chatId: String(ctx.chat?.id) },
    create: { chatId: String(ctx.chat?.id), fixTwitter: enabled },
    update: { fixTwitter: enabled },
  });

  return ctx.reply(
    `Twitter URL rewriting is now ${enabled ? "enabled" : "disabled"}.`
  );
}

export async function handleCashTag(ctx: Context) {
  if (!(await isAdmin(ctx))) {
    return ctx.reply("Only administrators can use this command.");
  }

  const arg = ctx.text?.split(" ")[1]?.toLowerCase();
  if (arg !== "on" && arg !== "off") {
    return ctx.reply('Please specify either "on" or "off".');
  }

  const enabled = arg === "on";
  await prisma.chatSettings.upsert({
    where: { chatId: String(ctx.chat?.id) },
    create: { chatId: String(ctx.chat?.id), cashTag: enabled },
    update: { cashTag: enabled },
  });

  return ctx.reply(
    `Cashtag responder is now ${enabled ? "enabled" : "disabled"}.`
  );
}

export async function handleStickerGun(ctx: Context) {
  if (!(await isAdmin(ctx))) {
    return ctx.reply("Only administrators can use this command.");
  }

  const arg = ctx.text?.split(" ")[1]?.toLowerCase();
  if (arg !== "on" && arg !== "off") {
    return ctx.reply('Please specify either "on" or "off".');
  }

  const enabled = arg === "on";
  await prisma.chatSettings.upsert({
    where: { chatId: String(ctx.chat?.id) },
    create: { chatId: String(ctx.chat?.id), stickerGun: enabled },
    update: { stickerGun: enabled },
  });

  return ctx.reply(
    `Sticker/GIF auto-delete is now ${enabled ? "enabled" : "disabled"}.`
  );
}

export async function handleBeta(ctx: Context) {
  if (!(await isAdmin(ctx))) {
    return ctx.reply("Only administrators can use this command.");
  }

  const arg = ctx.text?.split(" ")[1]?.toLowerCase();
  if (arg !== "on" && arg !== "off") {
    return ctx.reply('Please specify either "on" or "off".');
  }

  const enabled = arg === "on";
  await prisma.chatSettings.upsert({
    where: { chatId: String(ctx.chat?.id) },
    create: { chatId: String(ctx.chat?.id), betaFeatures: enabled },
    update: { betaFeatures: enabled },
  });

  return ctx.reply(
    `Beta features are now ${enabled ? "enabled" : "disabled"}.`
  );
}
