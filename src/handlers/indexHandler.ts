import { Context } from "telegraf";
import puppeteer from "puppeteer";
import { takeScreenshot } from "../utils/screnshot";
const fs = require("fs").promises;
const path = require("path");

export async function indexHandler(ctx: Context) {
  console.log("starting");
  const args = ctx.text?.split(" ").slice(1) || [];
  const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";
  let message = "";

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Generate header for the message
    message += "🌟 Top 10 coins by market cap [$2.4T]\n";
    message += "# Coin    | Price       | 24H\n---|---|---\n";

    // Loop through the first 10 cryptocurrencies and format the message
    for (let i = 0; i < 10; i++) {
      const coin = data[i];
      const name = coin.name;
      const symbol = coin.symbol.toUpperCase();
      const price = `$${coin.current_price.toFixed(2)}`;
      const priceChange24h = `${coin.price_change_percentage_24h.toFixed(2)}%`;
      const link = `🔗 [${name}](https://www.coingecko.com/en/coins/${coin.id})`;

      message += `${
        i + 1
      }. **${symbol}**  | ${price}    | ${priceChange24h} ${link}\n`;
    }

    await ctx.reply(message, { parse_mode: "Markdown" });
  } catch (e) {
    console.log(e);
  }
}
