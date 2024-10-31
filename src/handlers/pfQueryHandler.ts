import { Context } from "telegraf";
import { addTokenCount } from "../utils/addTokenCount";

export const pfQueryHandler = async (ctx: Context) => {
  const token = ctx.text?.split(" ")[1];

  if (!token) {
    await ctx.reply("Please provide a token symbol to query.");
    return;
  }
  await addTokenCount(token, ctx.from?.id.toString() || "0");
  const url = "https://api.dexscreener.com/latest/dex/tokens/" + token;
  let message = "";
  try {
    addTokenCount(token, String(ctx.from?.id));
  } catch (e) {
    console.log(e);
  }
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("adaa", data);
    if (data == null) return ctx.reply("Token not found");
    // Extract token data
    const tokenData = data.pairs[0];
    const baseToken = tokenData.baseToken;
    const priceUsd = parseFloat(tokenData.priceUsd).toFixed(6);
    const priceChange1h = tokenData.priceChange.h1.toFixed(2);
    const fdv = parseFloat(tokenData.fdv).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 1,
    });
    console.log(tokenData);
    const liquidityUsd = parseFloat(tokenData.liquidity.usd).toLocaleString(
      "en-US",
      {
        style: "currency",
        currency: "USD",
      }
    );
    const createdAt = new Date(tokenData.pairCreatedAt).toLocaleString();

    // Generate formatted message
    message += `🌜 [${baseToken.name}](${tokenData.url}) (${baseToken.symbol}) - [${priceChange1h}%]\n`;
    message += `💎 FDV: ${fdv} 🕰️ Created at ${createdAt}\n`;
    message += `💧 Liquidity: ${liquidityUsd}\n`;
    message += `Price (USD): $${priceUsd} - Volatility: ${priceChange1h}% (1h)\n\n`;

    // Add links to different platforms for further details or actions
    message += `👥 [More info on Dexscreener](${tokenData.url}) ⋅ [Solscan](https://solscan.io/token/${baseToken.address}) ⋅ [Trade on Photon](https://photon-sol.tinyastro.io/@RickBurpBot)`;

    ctx.reply(message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error fetching token data:", error);
  }
};
