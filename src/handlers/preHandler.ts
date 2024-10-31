import axios from "axios";
import { Context } from "telegraf";

export const preHandler = async (ctx: Context) => {
  const tokenAddress = ctx.text?.split(" ")[1];
  if (!tokenAddress) {
    await ctx.reply("Please provide a token address to score.");
    return;
  }

  try {
    // API request to get the score
    const apiUrl = "https://api-scanner.defiyield.app/";
    const response = await axios.post(
      apiUrl,
      {
        query: `query {
            score(address: "${tokenAddress}" network: 1) {
              score
              whitelisted
              exploited
              dimensionsAmount
              finalResult
              classicScore
              aiScore {
                dex
                organic
                totalScore
                reputation
                sybil
                utility
              }
              dimensions {
                score
                name
              }
            }
          }`,
      },
      {
        headers: {
          accept: "*/*",
          "content-type": "application/json",
          // Other headers can be omitted unless needed
        },
      }
    );

    console.log(response.data);
    const scoreData = response.data.data.score;

    // Format and send the response back to the user
    const message =
      `🏷️ Token Address: ${tokenAddress}\n` +
      `🎯 Score: ${scoreData.score}\n` +
      `✅ Whitelisted: ${scoreData.whitelisted}\n` +
      `🚫 Exploited: ${scoreData.exploited}\n` +
      `🔢 Dimensions Amount: ${scoreData.dimensionsAmount}\n` +
      `✅ Final Result: ${scoreData.finalResult}\n` +
      `📊 Classic Score: ${scoreData.classicScore}\n` +
      `🤖 AI Score Total: ${scoreData.aiScore.totalScore || "N/A"}\n`;

    await ctx.reply(message);
  } catch (error) {
    console.error("Error fetching token score:", error);
    await ctx.reply(
      "An error occurred while fetching the token score. Please try again later."
    );
  }
};
