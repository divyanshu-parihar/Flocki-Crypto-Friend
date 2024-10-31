import { Context } from "telegraf";
import { prisma } from "../bot";
import { parseDuration } from "../utils/parseDuration";

export async function reminderHandler(ctx: Context) {
  const messageText = ctx?.text;
  const tgUserId = String(ctx.from?.id);

  if (!messageText) {
    return ctx.reply("Command not recognized.");
  }

  // Parse command and arguments
  const [command, ...args] = messageText.split(" ");
  const commandName = command.replace("/", ""); // remove '/' from command name

  try {
    switch (commandName) {
      case "remind":
        await handleSetReminder(ctx, args.join(" "), tgUserId);
        break;
      case "listreminders":
        await handleListReminders(ctx, tgUserId);
        break;
      case "nevermind":
        await handleDeleteReminder(ctx, args[0], tgUserId);
        break;
      default:
        ctx.reply(
          "Unknown command. Available commands: /remind, /listreminders, /nevermind"
        );
    }
  } catch (error) {
    console.error("Error in reminder handler:", error);
    ctx.reply("An error occurred while processing your command.");
  }
}

// Handler for setting reminders
async function handleSetReminder(ctx: Context, args: string, tgUserId: string) {
  const [duration, ...titleParts] = args.split(" ");
  const title = titleParts.join(" ");
  const durationMs = parseDuration(duration);

  if (!durationMs || !title) {
    return ctx.reply(
      "Usage: /remind <duration> <title>. Example: /remind 1h30m Meeting."
    );
  }

  const till = new Date(Date.now() + durationMs);
  const reminder = await prisma.reminders.create({
    data: { title, till, tgUserId },
  });

  ctx.reply(
    `Reminder set! Title: "${title}", scheduled for ${till.toLocaleString()}`
  );
}

// Handler for listing reminders
async function handleListReminders(ctx: Context, tgUserId: string) {
  const reminders = await prisma.reminders.findMany({
    where: { tgUserId },
    orderBy: { till: "asc" },
  });

  if (reminders.length === 0) {
    return ctx.reply("No active reminders.");
  }

  const reminderMessages = reminders
    .map(
      (reminder) =>
        `ID: ${reminder.id}, Title: ${
          reminder.title
        }, Time: ${reminder.till.toLocaleString()}`
    )
    .join("\n");
  ctx.reply(`Active Reminders:\n${reminderMessages}`);
}

// Handler for deleting a reminder
async function handleDeleteReminder(
  ctx: Context,
  reminderId: string,
  tgUserId: string
) {
  if (!reminderId) {
    return ctx.reply(
      "Please specify the reminder ID to delete. Usage: /nevermind <ID>"
    );
  }

  const result = await prisma.reminders.deleteMany({
    where: { id: reminderId, tgUserId },
  });
  console.log(result);
  if (!result) {
    ctx.reply(`Reminder ID: ${reminderId} has been deleted.`);
  } else {
    ctx.reply("No reminder found with that ID.");
  }
}
