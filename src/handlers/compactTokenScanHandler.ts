import { Context } from "telegraf";
import axios from "axios";
import {escapeMarkdown} from "../utils/escapeMarkdown";

export const compactTokenScanHandler = async (ctx: Context) => {
    try {
        // Default to a specific token address if none is provided
        const tokenAddress = ctx.text?.split(' ')[1] || "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

        // Dexscreener API endpoint for token info
        const apiUrl = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;

        // Fetch data from Dexscreener API
        const response = await axios.get(apiUrl);
        const data = response.data.pairs.filter((el:any)=>el.dexId === 'uniswap')[0];

        // Check if response data is valid
        // console.log(data)
        if (!data) {
            await ctx.reply('Token data not found. Please check the token address and try again.');
            return;
        }

        // Parse the relevant fields for the message
        const { baseToken, priceUsd, fdv, liquidity, volume, priceChange, txns, url } = data;
        const age = Math.floor((Date.now() - data.pairCreatedAt) / (1000 * 60 * 60 * 24));  // Age in days
        const fdvInBillions = (fdv / 1e9).toFixed(1);
        const liquidityUsd = liquidity?.usd?.toFixed(1) || "N/A";
        const volume24h = volume?.h24?.toFixed(1) || "N/A";
        const priceChange1h = priceChange?.h1?.toFixed(2) || "0";
        const buys24h = txns?.h24?.buys || 0;
        const sells24h = txns?.h24?.sells || 0;

        // Format the message
        const message = `
🟡 [${escapeMarkdown(baseToken.name)} (${escapeMarkdown(baseToken.symbol)}) on DexScreener](${escapeMarkdown(url)})  
🌐 ${escapeMarkdown(data.chainId.charAt(0).toUpperCase() + data.chainId.slice(1))} @ ${escapeMarkdown(data.dexId.charAt(0).toUpperCase() + data.dexId.slice(1))}  
💰 USD: \$${parseFloat(priceUsd).toFixed(2)}  
💎 FDV: \$${fdvInBillions}B  
💦 Liq: \$${liquidityUsd}M 🐡 \\[x${liquidity?.base || 0}\\]  
📊 Vol (24h): \$${volume24h} 🕰️ Age: ${age}d  
📉 1H Change: ${priceChange1h}% \\⋅ Buys: ${buys24h} / Sells: ${sells24h}  
🧰 [More on DexScreener](${escapeMarkdown(url)})
`;

// Send the formatted message
        await ctx.reply(message, { parse_mode: "Markdown" });

// Helper function to escape special characters for MarkdownV
    } catch (error) {
        console.error(error);
        await ctx.reply("An error occurred while fetching token data. Please try again later.");
    }
};
