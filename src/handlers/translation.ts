import { Context } from "telegraf";
import { openai } from "../commands/registerCommands";

export const translationHandler = async (ctx: Context) => {
  const target = ctx.text?.split(" ")[1];
  const text = ctx.text?.split(" ").slice(2).join(" ");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",

      messages: [
        {
          role: "assistant",
          content: `you change the text to ${target} language without any other text in response.`,
        },
        { role: "user", content: text + "." },
      ],
      max_tokens: 150,
    });

    const botReply = response.choices[0].message.content;
    ctx.reply(botReply as string);
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    ctx.reply("Sorry, I am having trouble connecting to OpenAI.");
  }
};
