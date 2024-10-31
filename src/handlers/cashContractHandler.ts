import { addTokenCount } from "../utils/addTokenCount";
import axios from "axios";
export async function cashCointractHandler(ctx: any) {
  try {
    // Extract the token address or default to a specific address
    const tokenAddress =
      ctx.match[1] || "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    // Custom function to track or record token count (if implemented)
    await addTokenCount(tokenAddress, ctx.from?.id.toString() || "0");

    // Dexscreener API endpoint for token info
    const apiUrl = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;

    // Fetch data from Dexscreener API
    const response = await axios.get(apiUrl);
    const data = response.data.pairs.find((el: any) => el.dexId === "uniswap");

    // Check if response data is valid
    if (!data) {
      await ctx.reply(
        "Token data not found. Please check the token address and try again."
      );
      return;
    }

    // Extract and format data fields for the message
    const {
      baseToken,
      priceUsd,
      fdv,
      liquidity,
      volume,
      priceChange,
      txns,
      url,
      chainId,
      dexId,
      pairCreatedAt,
    } = data;
    const age = Math.floor(
      (Date.now() - pairCreatedAt) / (1000 * 60 * 60 * 24)
    ); // Age in days
    const fdvInBillions = (fdv / 1e9).toFixed(1);
    const liquidityUsd = liquidity?.usd?.toFixed(1) || "N/A";
    const volume24h = volume?.h24?.toFixed(1) || "N/A";
    const priceChange1h = priceChange?.h1?.toFixed(2) || "0";
    const buys24h = txns?.h24?.buys || 0;
    const sells24h = txns?.h24?.sells || 0;

    // Format the message
    const message = `🟡 [${baseToken.name} (${
      baseToken.symbol
    }) on DexScreener](${url})\n🌐 ${
      chainId.charAt(0).toUpperCase() + chainId.slice(1)
    } @ ${
      dexId.charAt(0).toUpperCase() + dexId.slice(1)
    }\n💰 USD: \$${parseFloat(priceUsd).toFixed(
      2
    )}\n💎 FDV: \$${fdvInBillions}B\n💦 Liq: \$${liquidityUsd}M 🐡 \\[x${
      liquidity?.base || 0
    }\\]\n📊 Vol (24h): \$${volume24h}\n🕰️ Age: ${age}d\n📉 1H Change: ${priceChange1h}%\n⋅ Buys: ${buys24h} / Sells: ${sells24h}\n🧰 [More on DexScreener](${url})`;

    // Send the formatted message
    await ctx.reply(message, { parse_mode: "MarkdownV2" });
  } catch (error) {
    console.error("Error fetching token data:", error);
    await ctx.reply(
      "An error occurred while fetching token data. Please try again later."
    );
  }
}
