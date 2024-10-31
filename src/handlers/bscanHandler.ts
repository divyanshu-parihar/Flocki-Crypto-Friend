import axios from "axios";
import { Context } from "telegraf";
export async function bscanHandler(ctx: Context) {
  const input = ctx.text?.split(" ")[1];
  if (!input) {
    return ctx.reply(
      "Please provide a pool address. Usage: /bscan <pool_address>"
    );
  }

  const url = `https://app.geckoterminal.com/api/p1/base/pools/${input}?include=tokens.tags`;

  try {
    // Make API request
    const response = await axios.get(url);
    const poolData = response.data.data.attributes;
    console.log(response.data);
    const tokens = response.data.included.filter(
      (item: any) => item.type === "token"
    );

    // Format the message with pool and token details
    let message = `
<b>Pool Name:</b> ${poolData.name}
<b>Address:</b> ${poolData.address}
<b>Fully Diluted Valuation:</b> $${parseFloat(
      poolData.fully_diluted_valuation
    ).toLocaleString()}
<b>Price (USD):</b> $${parseFloat(poolData.price_in_usd).toFixed(2)}
<b>24h Price Change:</b> ${poolData.price_percent_change}
<b>24h Volume:</b> $${parseFloat(poolData.from_volume_in_usd).toLocaleString()}
<b>GT Score:</b> ${poolData.gt_score.toFixed(2)}
<b>Swap Count (24h):</b> ${poolData.swap_count_24h}
<b>Token Details:</b>
        `;

    // Loop through each token in the pool
    tokens.forEach((token: any) => {
      const links = token.attributes.links;
      message += `
<b>Token:</b> ${token.attributes.name} (${token.attributes.symbol})
<b>Circulating Supply:</b> ${token.attributes.circulating_supply || "N/A"}
<b>Website:</b> ${links.websites ? links.websites[0] : "N/A"}
<b>Twitter:</b> ${
        links.twitter_handle
          ? `https://twitter.com/${links.twitter_handle}`
          : "N/A"
      }
<b>Telegram:</b> ${
        links.telegram_handle ? `https://t.me/${links.telegram_handle}` : "N/A"
      }
<b>Description:</b> ${token.attributes.description.en}
            `;
    });

    // Send the formatted message
    ctx.replyWithHTML(message);
  } catch (error) {
    console.error(error);
    ctx.reply(
      "There was an error retrieving the pool information. Please check the pool address or try again later."
    );
  }
}
