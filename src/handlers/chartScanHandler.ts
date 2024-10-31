import { Context } from "telegraf";
import { generateLineChart } from "../utils/generateChart"; // Ensure QuickChart is imported
import { addTokenCount } from "../utils/addTokenCount";
export const chartScanHandler = async (ctx: Context) => {
  const args = ctx.text?.split(" ").slice(1) || [];
  const token = args[0] || "ETHUSDT"; // Default to 'BTCUSDT' if no token provided
  const timeframe = args[1] || "5m"; // Default to '5m' if no timeframe provided
  //   await addTokenCount(token, ctx.from?.id.toString() || "0");
  // Validate timeframe
  const validTimeframes = ["1m", "5m", "15m", "60m", "4h", "1d", "1W", "1M"];
  if (!validTimeframes.includes(timeframe)) {
    return ctx.reply(
      "Invalid timeframe format (/c token timeframe). Supported timeframes: 1m, 5m, 15m, 60m, 4h, 1d, 1W, 1M"
    );
  }

  // Generate chart URL
  const chartUrl = await generateLineChart(token, timeframe);
  if (!chartUrl) {
    return ctx.reply("Error generating chart. Please try again later.");
  }

  // Send the chart as a photo
  await ctx.replyWithPhoto(
    { url: chartUrl },
    { caption: `${token} over ${timeframe}` }
  );
};
