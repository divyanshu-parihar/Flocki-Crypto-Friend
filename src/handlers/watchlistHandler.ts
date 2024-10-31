import { Context } from "telegraf";
import { prisma } from "../bot";

export const watchlistHandler = async (ctx: Context) => {
  try {
    const userId = String(ctx.from?.id);

    // Fetch last 10 tokens scanned by the user from the database
    const lastCheckedTokens = await prisma.scannedTokens.findMany({
      where: {
        scannedBy: userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 10,
    });

    // Check if there are any tokens in the user's watchlist
    if (lastCheckedTokens.length === 0) {
      return ctx.reply("You haven't checked any tokens yet.");
    }

    // Format the list of tokens for the reply message
    const tokenList = lastCheckedTokens
      .map(
        (token, index) =>
          `${index + 1}. ${token.token} (Checked ${token.count} times)`
      )
      .join("\n");

    // Send the token list to the user
    ctx.reply(`Here are your last 10 checked tokens:\n\n${tokenList}`);
  } catch (error) {
    console.error("Error retrieving watchlist:", error);
    ctx.reply("Sorry, I couldn't retrieve your watchlist.");
  }
};
export async function burp(ctx: Context) {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const tokens = await prisma.scannedTokens.findMany({
      where: { createdAt: { gte: oneHourAgo } },
      orderBy: { createdAt: "desc" },
    });

    if (tokens.length === 0) {
      return ctx.reply("No new tokens tracked in the last hour.");
    }

    let message = "🌐 **New Tokens Tracked in the Last Hour**:\n";
    tokens.forEach((token) => {
      message += `\n${token.token} (${token.token})`;
    });

    ctx.reply(message);
  } catch (error) {
    console.error("Error fetching new tokens:", error);
    ctx.reply("Failed to retrieve new tokens.");
  }
}

export async function what(ctx: Context) {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const tokens = await prisma.scannedTokens.findMany({
      where: { updatedAt: { gte: oneHourAgo } },
      orderBy: { count: "desc" },
    });

    if (tokens.length === 0) {
      return ctx.reply("No tokens found in the last 1 hour.");
    }

    let message = "📊 **Tokens Checked in Last 1H (Sorted by Scan Count)**:\n";
    tokens.forEach((token) => {
      message += `\n${token.token} - Scans: ${token.count}`;
    });

    ctx.reply(message);
  } catch (error) {
    console.error("Error fetching tokens by scan count:", error);
    ctx.reply("Failed to retrieve token data.");
  }
}
export async function idk(ctx: Context) {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const tokens = await prisma.scannedTokens.findMany({
      where: { updatedAt: { gte: fiveMinutesAgo } },
      orderBy: { count: "desc" },
      take: 5,
    });

    if (tokens.length === 0) {
      return ctx.reply("No tokens found in the last 5 minutes.");
    }

    let message = "🔥 **Best Tokens in Last 5 Minutes**:\n";
    tokens.forEach((token) => {
      message += `\n${token.token} - Scans: ${token.count}`;
    });

    ctx.reply(message);
  } catch (error) {
    console.error("Error fetching best tokens:", error);
    ctx.reply("Failed to retrieve recent tokens.");
  }
}
export async function lasergun(ctx: Context) {
  try {
    const tokens = await prisma.scannedTokens.findMany({
      orderBy: { updatedAt: "desc" },
      take: 10,
    });

    if (tokens.length === 0) {
      return ctx.reply("No tokens found.");
    }

    let message = "🚀 **Last 10 Tokens by Latest Scan Time**:\n";
    tokens.forEach((token) => {
      message += `\n${
        token.token
      } - Last Scanned At: ${token.updatedAt.toLocaleString()}`;
    });

    ctx.reply(message);
  } catch (error) {
    console.error("Error fetching tokens by latest scan time:", error);
    ctx.reply("Failed to retrieve token data.");
  }
}
export async function burpboard(ctx: Context) {
  const leaderboardUrl = "https://t.me/c/1449530338/2";
  ctx.reply(`🏆 **Leaderboard Channel**: [Click here](${leaderboardUrl})`, {
    parse_mode: "Markdown",
  });
}
