import { Context, Telegraf } from "telegraf";
import { config } from "./config";
import { registerCommands } from "./commands/registerCommands";
import { PrismaClient } from "@prisma/client";
import cron from "node-cron";
const bot = new Telegraf(config.botToken);

export const prisma = new PrismaClient();
async function checkReminders(bot: Telegraf) {
  const currentDateTime = new Date();

  try {
    // Query reminders that are due
    const dueReminders = await prisma.reminders.findMany({
      where: {
        till: {
          lte: currentDateTime,
        },
      },
    });

    for (const reminder of dueReminders) {
      // Send the reminder to the user
      await bot.telegram.sendMessage(
        reminder.tgUserId,
        `⏰ Reminder: ${reminder.title}`
      );

      // Delete or update the reminder after sending
      await prisma.reminders.delete({
        where: {
          id: reminder.id,
        },
      });
    }
  } catch (error) {
    console.error("Error checking reminders:", error);
  }
}

// Schedule to run the checkReminders function every minute
export function startReminderScheduler(bot: Telegraf) {
  cron.schedule("* * * * *", () => {
    checkReminders(bot);
  });
}

// Register commands
startReminderScheduler(bot);
registerCommands(bot);

export { bot };
