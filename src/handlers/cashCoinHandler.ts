import axios from "axios";
import { Context } from "telegraf";
import { Connection, PublicKey } from "@solana/web3.js";
import { escapeMarkdown } from "../utils/escapeMarkdown";
import { addTokenCount } from "../utils/addTokenCount";
import { openai } from "../commands/registerCommands";
import profiles from "../profiles";
import config from "../config";
import { prisma } from "../bot";

// Regular expressions for Instagram and Twitter/X links
const INSTAGRAM_PATTERN = /https?:\/\/(?:www\.)?instagram\.com\/[^\s]+/g;
const TWITTER_PATTERN = /https?:\/\/(?:www\.)?(twitter\.com|x\.com)\/[^\s]+/g;

// Helper function to find social media links
function findSocialMediaLinks(text: any){
  const links = [];
  let match;

  // Find Instagram links
  while ((match = INSTAGRAM_PATTERN.exec(text )) !== null) {
    const originalUrl = match[0];
    const modifiedUrl = originalUrl.replace('instagram.com', 'ddinstagram.com');
    links.push({ url: modifiedUrl, type: 'instagram' });
  }

  // Find Twitter/X links
  while ((match = TWITTER_PATTERN.exec(text)) !== null) {
    const originalUrl = match[0];
    const modifiedUrl = originalUrl
        .replace('twitter.com', 'fxtwitter.com')
        .replace('x.com', 'fxtwitter.com');
    links.push({ url: modifiedUrl, type: 'twitter' });
  }

  return links;
}
function formatNumber(num: number): string {
  if (Math.abs(num) >= 1e9) {
    return (num / 1e9).toFixed(1).replace(/\.0$/, "") + "b";
  } else if (Math.abs(num) >= 1e6) {
    return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "m";
  } else if (Math.abs(num) >= 1e3) {
    return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "k";
  } else {
    return num.toString();
  }
}
const solanaRpcUrl = "https://api.mainnet-beta.solana.com";
const connection = new Connection(solanaRpcUrl, "confirmed");
function createFormattedMessage(
    userName: string,
    link: { url: string, type: string },
) {
  const platformEmoji = link.type === 'instagram' ? '📷' : '🐦';
  const platformText = link.type === 'instagram' ? 'IG post' : 'X post';
  return `${platformEmoji} shared by ${userName}: ${platformText}\n\n\u200B${link.url}`;;
}
export async function cashCoinHandler(ctx: any) {
  console.log("here");

  // changs for the post
  try {
    // Check if message contains text
    if (!ctx.message.text) return;

    // Find social media links in the message
    const links = findSocialMediaLinks(ctx.message.text);

    if (links.length > 0) {
      // Get user information
      const user = ctx.message.from;
      const userName = user.username
        ? `@${user.username}`
        : `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`;

      // Delete original message
      await ctx.deleteMessage();

      // Send new formatted message for each link
      for (const link of links) {
        await ctx.replyWithHTML(
          createFormattedMessage(userName, link),
          {
            disable_web_page_preview: false,
            parse_mode :'HTML'
            // reply_markup: {
            //   inline_keyboard: [
            //     [
            //       {
            //         text: "🔍 Open",
            //         url: link,
            //       },
            //     ],
            //   ],
            // },
          }
        );
      }
    }
  } catch (error: any) {
    console.error("Error processing message:", error);

    // If error is about deletion permissions, send warning
    if (error.description && error.description.includes("delete")) {
      await ctx.reply("Error: Bot needs admin privileges to delete messages.", {
        reply_to_message_id: ctx.message.message_id,
      });
    }
  }
  if (
    ctx.message.reply_to_message &&
    ctx.message.reply_to_message.from?.id === ctx.botInfo.id
  ) {
    const userMessage = ctx.message.text;

    // let persoanlity = await prisma.currentInteraction.findUnique({
    //   where: {
    //     userid: String(ctx.from?.id),
    //   },
    // });
    // if (!persoanlity) {
    //   return;
    // }
    // console.log(
    //   "persoanlity",
    //   profiles.profiles[persoanlity?.personality].desc
    // );
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: config.zap_persoanality,
          },
          {
            role: "assistant",
            content: (ctx.message.reply_to_message as any).text,
          },
          { role: "user", content: userMessage },
        ],
        max_tokens: 150,
      });

      const botReply = response.choices[0].message.content;
      ctx.reply(botReply as string);
      return;
    } catch (error) {
      console.error("Error with OpenAI API:", error);
      ctx.reply("Sorry, I am having trouble connecting to OpenAI.");
      return;
    }
  }
  try {
    // Default to a specific token address if none is provided
    if (ctx.text.split(" ").length >= 2) {
      return;
    }

    const tokenAddress = ctx.text;
    const userId = ctx.from?.id.toString() || "0";

    // Fetch previous request for this token
    const previousRequest = await prisma.tokenRequest.findFirst({
      where: {
        tokenAddress,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    await addTokenCount(tokenAddress, userId);

    // Dexscreener API endpoint for token info
    const apiUrl = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;

    // Fetch data from Dexscreener API
    const response = await axios.get(apiUrl);
    const data = response.data.pairs[0];

    // Check if response data is valid
    if (!data) {
      await ctx.reply(
        "Token data not found. Please check the token address and try again."
      );
      return;
    }

    // Parse the relevant fields
    const {
      baseToken,
      priceUsd,
      fdv,
      liquidity,
      volume,
      priceChange,
      txns,
      url,
    } = data;

    const age = Math.floor(
      (Date.now() - data.pairCreatedAt) / (1000 * 60 * 60 * 24)
    );

    const currentData = {
      priceUsd: parseFloat(priceUsd),
      fdv: fdv,
      liquidityUsd: liquidity?.usd,
      volume24h: volume?.h24,
      priceChange1h: priceChange?.h1,
      buys24h: txns?.h24?.buys || 0,
      sells24h: txns?.h24?.sells || 0,
    };

    // Store current request
    await prisma.tokenRequest.create({
      data: {
        tokenAddress,
        userId,
        ...currentData,
      },
    });

    const fdvInBillions = formatNumber(fdv);
    const liquidityUsd = formatNumber(liquidity?.usd) || "N/A";
    const volume24h = formatNumber(volume?.h24) || "N/A";
    const priceChange1h = priceChange?.h1?.toFixed(2) || "0";
    const buys24h = txns?.h24?.buys || 0;
    const sells24h = txns?.h24?.sells || 0;

    let message;
    let previousUserInfo = null;
    if (previousRequest) {
      try {
        previousUserInfo = await ctx.telegram.getChatMember(
          previousRequest.userId,
          parseInt(previousRequest.userId)
        );
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    }
    if (previousRequest) {
      // Calculate changes
      const userMention = previousUserInfo?.user?.username
        ? `@${previousUserInfo.user.username}`
        : `[${previousUserInfo?.user?.first_name || "User"}](tg://user?id=${
            previousRequest.userId
          })`;
      const priceChange = (
        ((currentData.priceUsd - previousRequest.priceUsd) /
          previousRequest.priceUsd) *
        100
      ).toFixed(2);
      const fdvChange = previousRequest.fdv
        ? (
            ((currentData.fdv - previousRequest.fdv) / previousRequest.fdv) *
            100
          ).toFixed(2)
        : "N/A";
      const liqChange = previousRequest.liquidityUsd
        ? (
            ((currentData.liquidityUsd - previousRequest.liquidityUsd) /
              previousRequest.liquidityUsd) *
            100
          ).toFixed(2)
        : "N/A";
      const volChange = previousRequest.volume24h
        ? (
            ((currentData.volume24h - previousRequest.volume24h) /
              previousRequest.volume24h) *
            100
          ).toFixed(2)
        : "N/A";

      const timeSinceLastRequest = formatTimeAgo(previousRequest.createdAt);

      message = `
🟡 [${escapeMarkdown(baseToken.name)} (${escapeMarkdown(
        baseToken.symbol
      )}) on DexScreener](${escapeMarkdown(url)})  
🌐 ${escapeMarkdown(
        data.chainId.charAt(0).toUpperCase() + data.chainId.slice(1)
      )} @ ${escapeMarkdown(
        data.dexId.charAt(0).toUpperCase() + data.dexId.slice(1)
      )}  
💰 USD: $${parseFloat(priceUsd).toFixed(9)} (${priceChange}% since last request)
💎 FDV: $${fdvInBillions} (${fdvChange}%)
💦 Liq: $${liquidityUsd} (${liqChange}%) 🐡 [x${liquidity?.base || 0}]  
📊 Vol (24h): $${volume24h} (${volChange}%) 🕰️ Age: ${age}d  
📉 1H Change: ${priceChange1h}% · Buys: ${buys24h} / Sells: ${sells24h}  
⏱️ Last requested: ${timeSinceLastRequest} ago by ${userMention}
🧰 [More on DexScreener](${escapeMarkdown(url)})
      `;
    } else {
      message = `
🟡 [${escapeMarkdown(baseToken.name)} (${escapeMarkdown(
        baseToken.symbol
      )}) on DexScreener](${escapeMarkdown(url)})  
🌐 ${escapeMarkdown(
        data.chainId.charAt(0).toUpperCase() + data.chainId.slice(1)
      )} @ ${escapeMarkdown(
        data.dexId.charAt(0).toUpperCase() + data.dexId.slice(1)
      )}  
💰 USD: $${parseFloat(priceUsd).toFixed(9)}  
💎 FDV: $${fdvInBillions} 
💦 Liq: $${liquidityUsd} 🐡 [x${liquidity?.base || 0}]  
📊 Vol (24h): $${volume24h} 🕰️ Age: ${age}d  
📉 1H Change: ${priceChange1h}% · Buys: ${buys24h} / Sells: ${sells24h}  
🧰 [More on DexScreener](${escapeMarkdown(url)})
      `;
    }

    await ctx.reply(message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error(error);
  }
}
// Helper function to format time ago
function formatTimeAgo(date: Date) {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years";

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months";

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days";

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours";

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes";

  return Math.floor(seconds) + " seconds";
}
async function getTokenContractIdFromName(tokenName: string) {
  const response = await connection.getParsedProgramAccounts(
    new PublicKey("TokenkegQfeZyiNwAJbNbGzvb6uLTyH1n9z2E9B4v2D2"), // Token Program ID
    {
      filters: [
        {
          dataSize: 165, // size of token account
        },
        {
          memcmp: {
            offset: 64, // offset for the token name
            bytes: tokenName, // token name
          },
        },
      ],
    }
  );

  console.log(response);
  // Return the token contract ID if found
}
