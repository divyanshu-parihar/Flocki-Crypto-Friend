import { Telegraf } from 'telegraf';
import { startHandler } from '../handlers/startHandler';
import { fullTokenScanHandler } from '../handlers/fullTokenScanHandler';
// import { helpHandler } from '../handlers/helpHandler';
// import { aiHandler } from '../handlers/aiHandler';
// import { cryptoHandler } from '../handlers/cryptoHandler';

export const registerCommands = (bot: Telegraf) => {
    bot.start(startHandler);
    bot.command('x',fullTokenScanHandler)
    // bot.help(helpHandler);
    // bot.command('ai', aiHandler);
    // bot.command('crypto', cryptoHandler);
};
