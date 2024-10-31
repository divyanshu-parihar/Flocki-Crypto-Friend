import { Context } from "telegraf";
import { prisma } from "../bot";
import { openai } from "../commands/registerCommands";

export async function handleAicaCommand(ctx: any) {
  try {
    const address = ctx.message.text.split(" ")[1];

    // if (!address || !address.startsWith("0x")) {
    //   return ctx.reply(
    //     "Please provide a valid contract address starting with 0x"
    //   );
    // }

    // // Validate if it's a contract address (you might want to add more validation)
    // if (address.length !== 42) {
    //   return ctx.reply("Invalid contract address length");
    // }

    // Here you would integrate with your contract analysis service
    const analysis = await analyzeContract(address);

    // Store the analysis
    await prisma.contractAnalysis.create({
      data: {
        address,
        analysis: JSON.stringify(analysis),
      },
    });

    return ctx.reply(`Contract Analysis for ${address}:\n${analysis}`);
  } catch (error) {
    console.error("AICA command error:", error);
    return ctx.reply("Error analyzing contract. Please try again later.");
  }
}
export async function storeMessage(msg: any) {
  const isGroup = msg.chat.type === "group" || msg.chat.type === "supergroup";

  try {
    await prisma.message.create({
      data: {
        chatId: msg.chat.id.toString(),
        userId: msg.from.id.toString(),
        username: msg.from.username || null,
        firstName: msg.from.first_name || null,
        text: msg.text || "",
        isGroup: isGroup,
      },
    });

    // Clean up old messages, keeping only the last 15
    const messagesToKeep = await prisma.message
      .findMany({
        where: {
          chatId: msg.chat.id.toString(),
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 15,
        select: {
          id: true,
        },
      })
      .then((messages) => messages.map((m) => m.id));

    // Perform the deletion
    await prisma.message.deleteMany({
      where: {
        chatId: msg.chat.id.toString(),
        id: {
          notIn: messagesToKeep, // Use notIn instead of not
        },
      },
    });
  } catch (error) {
    console.error("Error storing message:", error);
  }
}

// Function to get recent messages
async function getRecentMessages(ctx: Context) {
  try {
    const chatId = ctx.chat?.id.toString();

    const messages = await prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 15,
    });

    if (ctx.chat?.type === "group" || ctx.chat?.type === "supergroup") {
      return messages.map((msg: any) => ({
        timestamp: msg.createdAt.getTime(),
        sender: msg.username || msg.firstName || "Unknown User",
        text: msg.text,
        formattedMessage: `[${formatTimestamp(msg.createdAt)}] ${
          msg.username || msg.firstName || "Unknown User"
        }: ${msg.text}`,
      }));
    } else {
      return messages.map((msg: any) => ({
        timestamp: msg.createdAt.getTime(),
        text: msg.text,
        formattedMessage: `[${formatTimestamp(msg.createdAt)}] ${msg.text}`,
      }));
    }
  } catch (error) {
    console.error("Error fetching recent messages:", error);
    return [];
  }
}

// Helper function to format timestamp
function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Chat Summary Command
export async function handleDubCommand(ctx: any) {
  try {
    const chatId = ctx.chat.id.toString();

    // Get recent messages from chat (implementation depends on your needs)
    const recentMessages = await getRecentMessages(chatId);

    // Generate summary using your preferred method
    const summary = await generateSummary(recentMessages);

    if (!summary) {
      return ctx.reply("No messages found to summarize.");
    }

    // Store the summary
    await prisma.chatSummary.create({
      data: {
        chatId,
        summary,
      },
    });

    return ctx.reply(`Chat Summary:\n${summary}`);
  } catch (error) {
    console.error("DUB command error:", error);
    return ctx.reply("Error generating chat summary. Please try again later.");
  }
}

// Experimental Chat Summary Command
export async function handleDubxCommand(ctx: any) {
  try {
    const chatId = ctx.chat.id.toString();

    // Get recent messages with more context or different algorithm
    const recentMessages = await getRecentMessages(chatId);

    // Generate experimental summary
    const summary = generateExperimentalSummary(recentMessages);

    return ctx.reply(`Experimental Chat Summary:\n${summary}`);
  } catch (error) {
    console.error("DUBX command error:", error);
    return ctx.reply(
      "Error generating experimental summary. Please try again later."
    );
  }
}

// AI Chat Command
export async function handleAskCommand(ctx: any) {
  try {
    const query = ctx.message.text.split(" ").slice(1).join(" ");

    if (!query) {
      return ctx.reply("Please provide a question");
    }

    // Make API call to your AI service
    const response = await getAIResponse(query);

    return ctx.reply(response);
  } catch (error) {
    console.error("ASK command error:", error);
    return ctx.reply("Error getting AI response. Please try again later.");
  }
}

// URL Summary Command
export async function handleTldrCommand(ctx: any) {
  try {
    const url = ctx.message.text.split(" ")[1];

    if (!url || !isValidUrl(url)) {
      return ctx.reply("Please provide a valid URL");
    }

    // Fetch and summarize article content
    const summary = await summarizeArticle(url);

    return ctx.reply(`Article Summary:\n${summary}`);
  } catch (error) {
    console.error("TLDR command error:", error);
    return ctx.reply("Error summarizing article. Please try again later.");
  }
}

// YouTube Video Summary Command
export async function handleVidCommand(ctx: any) {
  try {
    const url = ctx.message.text.split(" ")[1];

    if (!url || !isYouTubeUrl(url)) {
      return ctx.reply("Please provide a valid YouTube URL");
    }

    // Fetch and summarize video content
    const summary = await summarizeVideo(url);

    return ctx.reply(`Video Summary:\n${summary}`);
  } catch (error) {
    console.error("VID command error:", error);
    return ctx.reply("Error summarizing video. Please try again later.");
  }
}

// Helper functions
async function analyzeContract(address: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: String(
          "hey GPT, you summarize this contract and give me pros and cons" +
            address
        ),
      },
    ],
    max_tokens: 150,
  });
  return response.choices[0].message.content;
}

async function generateSummary(messages: any[]) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Generate a summary of the chat messages",
      },
      {
        role: "user",
        content: String(messages.map((msg) => msg.formattedMessage).join("\n")),
      },
    ],
    max_tokens: 150,
  });
  return response.choices[0].message.content;
}

async function generateExperimentalSummary(messages: any[]) {
  // Implement experimental summary generation logic
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Generate a summary of the chat messages",
      },
      {
        role: "user",
        content: String(messages.map((msg) => msg.formattedMessage).join("\n")),
      },
    ],
    max_tokens: 150,
  });
  return response.choices[0].message.content;
}

async function getAIResponse(query: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: String(query),
      },
    ],
    max_tokens: 150,
  });
  return response.choices[0].message.content;
}

async function summarizeArticle(url: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: String("Summarize the content of this article: " + url),
      },
    ],
    max_tokens: 150,
  });
  return response.choices[0].message.content;
}

async function summarizeVideo(url: string) {
  // Implement video summarization logic
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "Generate a summary of the youtube video by searching link",
      },
      {
        role: "user",
        content: `Please summarize the following video transcript:\n\n${url}`,
      },
    ],
    max_tokens: 150,
  });
  return response.choices[0].message.content;
}

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isYouTubeUrl(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be");
}
