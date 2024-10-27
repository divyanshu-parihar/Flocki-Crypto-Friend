import { Telegraf } from 'telegraf';
import { config } from './config';
import { registerCommands } from './commands/registerCommands';

const bot = new Telegraf(config.botToken);

// Register commands
registerCommands(bot);

export { bot };
