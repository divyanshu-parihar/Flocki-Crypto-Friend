import { Context } from "telegraf";

export async function pingHandler(ctx: Context) {
  const messageText = ctx.text?.trim();
  const command = messageText?.split(" ")[0];
  if (!command) {
    return;
  }
  const additionalMessage = messageText?.slice(command.length).trim();

  try {
    if (!messageText || command !== "/ping") {
      return ctx.reply(
        "To use this command, type /ping followed by an optional message."
      );
    }

    // Case 1: Ping an existing message by replying to it
    if ((ctx.message as any)?.reply_to_message) {
      const repliedMessage = (ctx.message as any)?.reply_to_message;
      await ctx.reply(
        `📢 Pinging everyone: ${
          repliedMessage.text || repliedMessage.caption || "Attachment"
        }`,
        {
          reply_parameters: {
            message_id: repliedMessage.message_id,
          },
        }
      );
    }
    // Case 2: Fast ping with no additional message
    else if (!additionalMessage) {
      await ctx.reply("📢 Pinging everyone!");
    }
    // Case 3: Message ping with additional text
    else {
      const sentMessage = await ctx.reply(
        `📢 Pinging everyone: ${additionalMessage}`
      );
      await ctx.pinChatMessage(sentMessage.message_id, {
        disable_notification: false,
      });
    }
  } catch (error) {
    console.error("Error in ping handler:", error);
    ctx.reply("An error occurred while processing your ping request.");
  }
}
