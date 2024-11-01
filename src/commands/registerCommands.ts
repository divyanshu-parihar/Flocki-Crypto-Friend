import { Context, Telegraf } from "telegraf";
const { message } = require("telegraf/filters");

import { startHandler } from "../handlers/startHandler";
import { fullTokenScanHandler } from "../handlers/fullTokenScanHandler";
import { compactTokenScanHandler } from "../handlers/compactTokenScanHandler";
import { chartScanHandler } from "../handlers/chartScanHandler";
import { limitedChartScanHandler } from "../handlers/limitedChartScanHandler";
import { fancyChartScanHandler } from "../handlers/fancyChartScanHandler";
import { bubbleMapHandler } from "../handlers/bubbleMapHandler";
// import { coingeckoQueryHandler } from '../handlers/coingeckoQueryHandler';
import { dexPaidCheckHandler } from "../handlers/dexPaidCheckHandler";
import { dexTrendingHandler } from "../handlers/dexTrendingHandler";
import { msTrendingHandler } from "../handlers/msTrendingHandler";
import { pfTrendingHandler } from "../handlers/pfTrendinghandler";
// import { spTrendingHandler } from "../handlers/spTrendingHandler";
import { pfQueryHandler } from "../handlers/pfQueryHandler";
import { msQueryHandler } from "../handlers/msQueryHandler";
import { indexHandler } from "../handlers/indexHandler";
import { epochHandler } from "../handlers/epochHandler";

//reminders
import { reminderHandler } from "../handlers/reminder";
//ping
import { pingHandler } from "../handlers/pingHandler";
// translation
import { translationHandler } from "../handlers/translation";

// select chat
import { personalityHandler } from "../handlers/personalityHandler";
import OpenAI from "openai";
import { changePersonality } from "../handlers/changePersonality";
import { prisma } from "../bot";
import profiles from "../profiles";
import { tokenHandler } from "../handlers/token";
import {
  burp,
  burpboard,
  idk,
  lasergun,
  watchlistHandler,
  what,
} from "../handlers/watchlistHandler";
import { monitHandler } from "../handlers/monitHandler";
import { bscanHandler } from "../handlers/bscanHandler";
import { socHandler } from "../handlers/socHandler";
import { cashCoinHandler } from "../handlers/cashCoinHandler";
import { cashCointractHandler } from "../handlers/cashContractHandler";
import { pre } from "telegraf/typings/format";
import { preHandler } from "../handlers/preHandler";
import {
  handleAnon,
  handleAutoResponder,
  handleBeta,
  handleCashTag,
  handleEmojiMode,
  handleFixTwitter,
  handleNoResultMode,
  handlePriceMode,
  handleRickNews,
  handleStickerGun,
} from "../handlers/adminONLY";
import {
  handleBalance,
  handleChatId,
  handleHelp,
  handleMyBalance,
  handleUserId,
  handleWubba,
} from "../handlers/other";
import {
  handleAicaCommand,
  handleAskCommand,
  handleDubCommand,
  handleDubxCommand,
  handleTldrCommand,
  handleVidCommand,
  storeMessage,
} from "../handlers/AI";
import { stringify } from "querystring";
import axios from "axios";

import config from "../config";
// openai client
// const configuration = new Configuration({
//   apiKey:
//     "sk-fU_-ZZ6Zil3s8uMzQ2gUl98-gytCE8A33YmjLN4t6FT3BlbkFJX_kJvcvI9aggaV5ARMZrEicgRbQqVAwdKNd6U_wLEA",
// });
export const openai = new OpenAI({
  apiKey:
    "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",
  // "sk-fU_-ZZ6Zil3s8uMzQ2gUl98-gytCE8A33YmjLN4t6FT3BlbkFJX_kJvcvI9aggaV5ARMZrEicgRbQqVAwdKNd6U_wLEA",
});

export const registerCommands = (bot: Telegraf) => {
  bot.start(startHandler);
  bot.command("x", fullTokenScanHandler);
  bot.command("z", compactTokenScanHandler);
  bot.command("c", chartScanHandler);
  bot.command("cx", limitedChartScanHandler);
  bot.command("cc", fancyChartScanHandler);
  bot.command("bm", bubbleMapHandler);
  bot.command("dp", dexPaidCheckHandler);
  bot.command("dt", dexTrendingHandler);
  bot.command("mst", msTrendingHandler);
  bot.command("pft", pfTrendingHandler);
  bot.command("pf", pfQueryHandler);
  bot.command("ms", msQueryHandler);
  bot.command("index", indexHandler);
  bot.command("epoch", epochHandler);

  // reminders
  bot.command("remind", reminderHandler);
  bot.command("listreminders", reminderHandler);
  bot.command("nevermind", reminderHandler);
  bot.command("ping", pingHandler);
  bot.command("translate", translationHandler);
  // every other mf text
  bot.command("vibe", personalityHandler);
  // bot.action(/personality-\d+/, changePersonality);
  //management
  bot.command("token", tokenHandler);

  // Leaderboard

  bot.command("watchlist", isMainChat, watchlistHandler);
  bot.command("burp", isMainChat, burp);
  bot.command("what", isMainChat, what);
  bot.command("idk", isMainChat, idk);
  bot.command("lasergun", isMainChat, lasergun);
  bot.command("burpboard", isMainChat, burpboard);

  // research
  bot.command("monit", monitHandler);
  // scanning
  bot.command("bscan", bscanHandler);
  bot.command("soc", socHandler);

  // text commands

  // bot.hears(/zap/i, async (ctx) => {
  //   const response = await getChatGPTResponse("zap keyword message"); // Call OpenAI API function here
  //   await ctx.reply(response);
  // });
  // bot.hears(/^(\w+)/i, cashCointractHandler);
  bot.hears(/\$(\w+)/, async (ctx) => {
    const tokenName = ctx.match[1];
    const loadingMsg = await ctx.reply(`Searching for $${tokenName}...`);

    const tokenInfo = await fetchTokenInfo(tokenName);
    const response = formatTokenResponse(tokenInfo);

    // Delete loading message and send formatted response
    await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
    await ctx.reply(response, {
      parse_mode: "HTML",
    });
  });
  bot.hears(/zap/i, async (ctx: Context) => {
    console.log("here responding to zap");
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4", // or "gpt-3.5-turbo" if you're using that model
        messages: [
          {
            role: "system",
            content: config.zap_persoanality,
          },
          {
            role: "user",
            content: ctx.text as string,
          },
        ],
        max_tokens: 150, // Adjust based on how detailed you want the response to be
        temperature: 1, // Higher values make output more creative; lower values make it more focused
      });

      await ctx.reply(response.choices[0].message.content as string);
    } catch (error) {
      console.log(error);
    }
  });
  //score
  bot.command("pre", preHandler);

  // admin only commands
  bot.command("ricknews", handleRickNews);
  bot.command("autoresponder", handleAutoResponder);
  bot.command("noresultmode", handleNoResultMode);
  bot.command("pricemode", handlePriceMode);
  bot.command("emojimode", handleEmojiMode);
  bot.command("anon", handleAnon);
  bot.command("fixtwitter", handleFixTwitter);
  bot.command("cashtag", handleCashTag);
  bot.command("stickergun", handleStickerGun);
  bot.command("beta", handleBeta);

  //others
  bot.command("balance", handleBalance);
  bot.command("mybalance", handleMyBalance);
  bot.command("userid", handleUserId);
  bot.command("chatid", handleChatId);
  bot.command("wubba", handleWubba);
  bot.command("help", handleHelp);

  // rick ai

  bot.command("aica", handleAicaCommand);
  bot.command("dub", handleDubCommand);
  bot.command("dubx", handleDubxCommand);
  bot.command("ask", handleAskCommand);
  bot.command("uhh", handleAskCommand); // Alias for ask
  bot.command("tldr", handleTldrCommand);
  bot.command("vid", handleVidCommand);

  // Handle sticker and GIF deletion if stickerGun is enabled
  bot.on(["sticker", "animation"], async (ctx) => {
    const chatSettings = await prisma.chatSettings.findUnique({
      where: { chatId: ctx.chat.id.toString() },
    });

    if (chatSettings?.stickerGun) {
      try {
        await ctx.deleteMessage();
      } catch (error) {
        console.error("Failed to delete sticker/GIF:", error);
      }
    }
  });
  bot.on("text", cashCoinHandler);
  bot.on("text", async (ctx) => {
    console.log("Message text");
    await storeMessage(ctx.message);
  });
  // text handlers
  bot.command("chat", isGroupChat, async (ctx) => {
    console.log(ctx);
    const userMessage = ctx.text;
    console.log("hello");
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: config.zap_persoanality,
          },
          { role: "user", content: userMessage },
        ],
        max_tokens: 50,
      });

      const botReply = response.choices[0].message.content;
      ctx.reply(botReply as string);
    } catch (error) {
      console.error("Error with OpenAI API:", error);
      ctx.reply("Sorry, I am having trouble connecting to OpenAI.");
    }
  });
  bot.command("help", async (ctx) => {
    const helpMessage = `
  Here are the available commands:
  
  General Commands:
  - /start - Initializes the bot and provides a welcome message.
  - /help - Shows this help message.
  - /ping - Checks the bot's connection status.
  - /translate - Translates a provided text.
  - /vibe - Checks the bot's personality.
  - /chat - Engages the bot in conversation (only in group chats).
  
  Token Scans and Chart Commands:
  - /x - Executes a full token scan.
  - /z - Executes a compact token scan.
  - /c - Runs a chart scan.
  - /cx - Runs a limited chart scan.
  - /cc - Executes a fancy chart scan with enhanced visuals.
  
  Map and Exchange Commands:
  - /bm - Generates a bubble map.
  - /dp - Checks payment status on decentralized exchanges.
  - /dt - Retrieves trending assets on decentralized exchanges.
  - /mst - Shows trending assets in the ms category.
  - /pft - Shows trending assets in the pf category.
  
  Category-Specific Queries:
  - /pf - Handles queries specific to the pf category.
  - /ms - Handles queries specific to the ms category.
  - /index - Retrieves the current index data.
  - /epoch - Provides epoch time details.
  
  Reminders:
  - /remind - Sets a reminder.
  - /listreminders - Lists all active reminders.
  - /nevermind - Cancels a specific reminder.
  
  Watchlist and Fun Commands (only in private chats):
  - /watchlist - Shows the last 10 checked tokens.
  - /burp - Executes a 'burp' command.
  - /what - Executes a 'what' command.
  - /idk - Executes an 'idk' command.
  - /lasergun - Executes a 'lasergun' command.
  - /burpboard - Shows the 'burpboard' leaderboard.
  
  For more details on each command, please try them out or ask in the group chat!
  `;

    await ctx.reply(helpMessage);
  });
};
const isMainChat = (ctx: Context, next: Function) => {
  if (String(ctx.chat?.id) === "-1002371334829") {
    return next();
  } else {
    ctx.reply("This command can only be used in private chats.");
  }
};
const isGroupChat = (ctx: Context, next: Function) => {
  if (ctx.chat?.type === "group" || ctx.chat?.type === "supergroup") {
    return next();
  } else {
    ctx.reply("This command can only be used in group chats.");
  }
};

function formatNumber(num: number | null) {
  if (num === null || num === undefined) return "N/A";
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toFixed(1);
}

// Function to calculate time difference
function getTimeDifference(timestamp: any) {
  const now: any = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - new Date(timestamp).getTime()) / (1000 * 60 * 60)
  );
  if (diffInHours < 24) return `${diffInHours}h`;
  return `${Math.floor(diffInHours / 24)}d`;
}

async function fetchTokenInfo(tokenName: any) {
  try {
    const response = await axios.get(
      `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(
        tokenName
      )}`
    );
    if (response.data.pairs && response.data.pairs.length > 0) {
      return response.data.pairs[0]; // Return first pair
    }
    return null;
  } catch (error) {
    console.error("Error fetching token info:", error);
    return null;
  }
}

function formatTokenResponse(pair: any) {
  if (!pair) return "Token not found";

  const priceUsd = parseFloat(pair.priceUsd);
  const fdv = pair.fdv;
  const liquidity = pair.liquidity?.usd;
  const volume24h = pair.volume?.h24;
  const priceChange = pair.priceChange?.h24;

  // Base template
  return `🟢 ${pair.baseToken.symbol} [${formatNumber(fdv)}/${priceChange}%] $${
    pair.baseToken.symbol
  }
🌐 ${pair.chainId} @ ${pair.dexId}
💰 USD: $${priceUsd.toFixed(7)}
💎 FDV: $${formatNumber(fdv)}
💦 Liq: $${formatNumber(liquidity)}
📊 Vol: $${formatNumber(volume24h)} 🕰️ Age: ${getTimeDifference(
    pair.pairCreatedAt
  )}
📉 1H: ${pair.priceChange?.h1 || 0}% ⋅ $${formatNumber(volume24h) || 0}

${pair.baseToken.address}
`;
}
