import axios from "axios";
import { Context } from "telegraf";

export async function socHandler(ctx: Context) {
  const tokenName = ctx.text?.split(" ")[1];
  if (!tokenName) {
    return ctx.reply("Please provide a token name.");
  }

  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${tokenName}`
    );
    const data = response.data.links;
    const socials = `
**Token Name:** ${data.name}
**Twitter:** @${data.twitter_screen_name || "Not Available"}
**Facebook:** ${data.facebook_username || "Not Available"}
**Reddit:** ${data.subreddit_url || "Not Available"}
**Telegram:** ${data.telegram_channel_identifier || "Not Available"}

`;

    await ctx.reply(socials, { parse_mode: "Markdown" });
  } catch (error) {
    console.log(error);
    ctx.reply("An error occurred while fetching the social media links.");
  }
}
