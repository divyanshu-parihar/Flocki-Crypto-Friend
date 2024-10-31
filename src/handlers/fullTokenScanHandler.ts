import axios from "axios";
import { Context } from "telegraf";

export const fullTokenScanHandler = async (ctx: Context) => {
  try {
    // Set the default token symbol to MXUSDT if no token is provided
    const token = ctx.text?.split(" ")[1] || "ETHUSDT";

    // API endpoint for 24-hour ticker
    const apiUrl = `https://api.mexc.in/api/v3/ticker/24hr?symbol=${token}`;

    // Fetch ticker data from MEXC API
    const response = await axios.get(apiUrl);
    const data = response.data;

    // Check if the response data is valid
    if (!data.symbol) {
      await ctx.reply(
        "Token not found. Please check the symbol and try again."
      );
      return;
    }

    // Parse and format the response data
    const message = `
🟡 [View on MEXC](https://www.mexc.com/token/${data.symbol})  
🌐 ${data.symbol} @ MEXC  
💰 Last Price: \$${parseFloat(data.lastPrice).toFixed(2)}  
💎 Price Change: \$${parseFloat(data.priceChange).toFixed(2)} \(${
      data.priceChangePercent
    }\%\)  
💦 High: \$${parseFloat(data.highPrice).toFixed(2)}  
📉 Low: \$${parseFloat(data.lowPrice).toFixed(2)}  
📊 Volume: ${parseFloat(data.volume).toFixed(2)} ${data.symbol.replace(
      /USDT/,
      ""
    )}  
🔹 Bid Price: \$${parseFloat(data.bidPrice).toFixed(2)}  
🔸 Ask Price: \$${parseFloat(data.askPrice).toFixed(2)}  
🧰 More: [📊 MEXC](https://www.mexc.com/token/${data.symbol})  
`;

    await ctx.reply(message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error fetching token data:", error);
    ctx.reply("Failed to retrieve token information.");
  }
};
