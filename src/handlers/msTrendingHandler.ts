import { Context } from "telegraf";

export const msTrendingHandler = async (ctx: Context) => {
  const url =
    "https://api.moonshot.cc/trades/v2/latest/solana?minVolumeUsd=5&limit=30";
  let message = "📈 Trending Moonshot Tokens\n\n";
  const rankingEmojis = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Sort tokens by volume in USD (descending)
    let sortedTokens = data.sort(
      (a: any, b: any) => parseFloat(b.volumeUsd) - parseFloat(a.volumeUsd)
    );

    // Take top 5 tokens
    sortedTokens = sortedTokens.filter((el: any) => el.dexId == "moonshot");
    sortedTokens.slice(0, 5).forEach((token: any, index: number) => {
      const rankEmoji = rankingEmojis[index] || `${index + 1}️⃣`;
      const tokenNameLink = `${token.baseToken.symbol}`;
      const priceChange = `@ ${parseFloat(token.priceUsd).toFixed(
        8
      )} ➜ $${parseFloat(token.volumeUsd).toFixed(2)}`;

      message += `${rankEmoji} [sol] 📈 ${tokenNameLink} ${priceChange}\n`;
    });

    // Send the message to Telegram chat or console for this example
    await ctx.reply(message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error fetching Moonshot tokens(VOLUME):", error);
  }
};
