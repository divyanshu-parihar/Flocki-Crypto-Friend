import axios from "axios";
import { Context } from "telegraf";
import { Connection, PublicKey } from "@solana/web3.js";
import { escapeMarkdown } from "../utils/escapeMarkdown";
import { addTokenCount } from "../utils/addTokenCount";

const solanaRpcUrl = "https://api.mainnet-beta.solana.com";
const connection = new Connection(solanaRpcUrl, "confirmed");
export async function cashCoinHandler(ctx: any) {
  console.log("here");
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
    const fdvInBillions = (fdv / 1e9).toFixed(1);
    const liquidityUsd = liquidity?.usd?.toFixed(1) || "N/A";
    const volume24h = volume?.h24?.toFixed(1) || "N/A";
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
💰 USD: \$${parseFloat(priceUsd).toFixed(2)}  
💎 FDV: \$${fdvInBillions}B  
💦 Liq: \$${liquidityUsd}M 🐡 \\[x${liquidity?.base || 0}\\]  
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