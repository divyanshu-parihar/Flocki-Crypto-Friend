import { Context } from "telegraf";
import axios from "axios";

export async function dexTrendingHandler(ctx: Context) {
  try {
    // Fetch trending tokens from DexScreener API
    const response = await axios.get(
      "https://api.dexscreener.com/token-boosts/latest/v1"
    );
    const trendingTokens = response.data;
    // Format the message with trending tokens
    let message = "📈 Trending DEX tokens\n\n";

    const rankingEmojis = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

    trendingTokens.slice(0, 5).forEach((token: any, index: number) => {
      console.log(token);
      const rankEmoji = rankingEmojis[index];
      const tokenLink = `${token.chainId}`;
      const tokenNameLink = `[${"TOKEN"}](${token.url})`;
      const priceChange = `@ ${token.amount}`;

      message += `${rankEmoji} ${tokenLink} ${tokenNameLink} ${priceChange}\n`;
    });

    message +=
      "\n🏆 TIP: [ATH leaderboards](https://talk.markets/t/new-ath-leaderboards/3111) with /ga";

    // Send the message to the Telegram chat
    await ctx.reply(message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error fetching trending tokens:", error);
    await ctx.reply(
      "⚠️ Failed to fetch trending tokens. Please try again later."
    );
  }
}
