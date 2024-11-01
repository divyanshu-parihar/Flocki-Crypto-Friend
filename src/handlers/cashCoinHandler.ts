import axios from "axios";
import { Context } from "telegraf";
import { Connection, PublicKey } from "@solana/web3.js";
import { escapeMarkdown } from "../utils/escapeMarkdown";
import { addTokenCount } from "../utils/addTokenCount";
import { openai } from "../commands/registerCommands";
import profiles from "../profiles";
import { config } from "../config";

// Regular expressions for Instagram and Twitter/X links
const INSTAGRAM_PATTERN = /https?:\/\/(?:www\.)?instagram\.com\/[^\s]+/g;
const TWITTER_PATTERN = /https?:\/\/(?:www\.)?(twitter\.com|x\.com)\/[^\s]+/g;

// Helper function to find social media links
function findSocialMediaLinks(text: any) {
  const links = [];
  let match;

  // Find Instagram links
  while ((match = INSTAGRAM_PATTERN.exec(text)) !== null) {
    links.push(match[0]);
  }

  // Find Twitter/X links
  while ((match = TWITTER_PATTERN.exec(text)) !== null) {
    links.push(match[0]);
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
  link: string,
  platform: string
) {
  const platformText = platform === "instagram" ? "IG post" : "X post";
  // Using the 📷 emoji for Instagram and platform-specific formatting
  return `📷 shared by ${userName}: ${platformText}`;
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
          createFormattedMessage(userName, link, "instagram"),
          {
            disable_web_page_preview: false,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🔍 Open",
                    url: link,
                  },
                ],
              ],
            },
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

    await addTokenCount(tokenAddress, ctx.from?.id.toString() || "0");
    // Dexscreener API endpoint for token info
    const apiUrl = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;

    // Fetch data from Dexscreener API
    const response = await axios.get(apiUrl);
    const data = response.data.pairs[0];

    // Check if response data is valid
    // console.log(data)
    if (!data) {
      await ctx.reply(
        "Token data not found. Please check the token address and try again."
      );
      return;
    }

    // Parse the relevant fields for the message
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
    ); // Age in days
    console.log("fdv", fdv);
    const fdvInBillions = formatNumber(fdv);
    const liquidityUsd = formatNumber(liquidity?.usd) || "N/A";
    const volume24h = formatNumber(volume?.h24) || "N/A";
    const priceChange1h = priceChange?.h1?.toFixed(2) || "0";
    const buys24h = txns?.h24?.buys || 0;
    const sells24h = txns?.h24?.sells || 0;

    // Format the message
    const message = `
🟡 [${escapeMarkdown(baseToken.name)} (${escapeMarkdown(
      baseToken.symbol
    )}) on DexScreener](${escapeMarkdown(url)})  
🌐 ${escapeMarkdown(
      data.chainId.charAt(0).toUpperCase() + data.chainId.slice(1)
    )} @ ${escapeMarkdown(
      data.dexId.charAt(0).toUpperCase() + data.dexId.slice(1)
    )}  
💰 USD: \$${parseFloat(priceUsd).toFixed(9)}  
💎 FDV: \$${fdvInBillions} 
💦 Liq: \$${liquidityUsd} 🐡 \\[x${liquidity?.base || 0}\\]  
📊 Vol (24h): \$${volume24h} 🕰️ Age: ${age}d  
📉 1H Change: ${priceChange1h}% \\⋅ Buys: ${buys24h} / Sells: ${sells24h}  
🧰 [More on DexScreener](${escapeMarkdown(url)})
    `;

    // Send the formatted message
    await ctx.reply(message, { parse_mode: "Markdown" });

    // Helper function to escape special characters for MarkdownV
  } catch (error) {
    console.error(error);
    // await ctx.reply(
    //   "An error occurred while fetching token data. Please try again later."
    // );
  }
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
