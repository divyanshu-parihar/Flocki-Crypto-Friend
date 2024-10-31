import axios from "axios";
import { Context } from "telegraf";
export const monitHandler = async (ctx: Context) => {
  const username = ctx.text?.split(" ")[1];
  if (!username) {
    return ctx.reply("Please provide a username.");
  }

  try {
    const response = await axios.get(
      `https://twitter-bot.getmoni.io/api/observed/${username}/?changesTimeframe=H24`
    );
    const userInfo = response.data;

    if (userInfo) {
      const userData = `
${userInfo.name}・${userInfo.username} [🧠 ${userInfo.score}]
Followers: ${userInfo.followersCount}
Tweets: ${userInfo.tweetCount}
Created at: ${new Date(userInfo.twitterCreatedAt * 1000).toLocaleString()}

${userInfo.description}

🔗 Open in Moni (${userInfo.twitterUrl})
`;
      ctx.reply(userData);
    } else {
      ctx.reply("User not found.");
    }
  } catch (error) {
    ctx.reply("An error occurred while fetching user information.");
  }
};
