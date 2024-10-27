import { Context } from "telegraf";

export const pfTrendingHandler = async (ctx: Context) => {
  const url =
    "https://app.geckoterminal.com/api/p1/tags/pump-fun/pools?page=1&include=dex.network%2Ctokens&sort=-1h_trend_score";
  let message = "📈 Trending DEX tokens\n\n";
  const rankingEmojis = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Sort tokens based on 1-hour trend score (if necessary)
    const trendingTokens = data.data;

    // Generate message for top 5 tokens
    trendingTokens.slice(-5).forEach((tokenData: any, index: any) => {
      const rankEmoji = rankingEmojis[index] || `${index + 1}️⃣`;
      const tokenAttributes = tokenData.attributes;

      const tokenName = tokenAttributes.name.split(" / ")[0]; // Extract base token name
      const tokenLink = `https://app.geckoterminal.com/solana/pools/${tokenAttributes.address}`;
      const tokenChange =
        tokenAttributes.price_percent_changes.last_1h || "N/A";
      const tokenVolume = parseFloat(
        tokenAttributes.reserve_in_usd
      ).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });

      message += `${rankEmoji} [pump.fun] 📈 [${tokenName}](${tokenLink}) @ ${tokenVolume} ➜ ${tokenChange} 🕰️ 1h\n`;
    });

    message +=
      "\n🏆 TIP: Check more trending tokens on GeckoTerminal for potential opportunities!";

    // Log or send the message to your chat application
    await ctx.reply(message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error fetching GeckoTerminal tokens:", error);
  }
};
