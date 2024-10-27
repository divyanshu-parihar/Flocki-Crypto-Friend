import { Telegraf } from 'telegraf';
import { startHandler } from '../handlers/startHandler';
import { fullTokenScanHandler } from '../handlers/fullTokenScanHandler';
import { compactTokenScanHandler } from '../handlers/compactTokenScanHandler';
import { chartScanHandler } from '../handlers/chartScanHandler';
import { limitedChartScanHandler } from '../handlers/limitedChartScanHandler';
import { fancyChartScanHandler } from '../handlers/fancyChartScanHandler';
// import { bubbleMapHandler } from '../handlers/bubbleMapHandler';
// import { coingeckoQueryHandler } from '../handlers/coingeckoQueryHandler';
// import { dexPaidCheckHandler } from '../handlers/dexPaidCheckHandler';
// import { dexTrendingHandler } from '../handlers/dexTrendingHandler';
// import { pfTrendingHandler } from '../handlers/pfTrendingHandler';
// import { msTrendingHandler } from '../handlers/msTrendingHandler';
// import { spTrendingHandler } from '../handlers/spTrendingHandler';
// import { pfQueryHandler } from '../handlers/pfQueryHandler';
// import { msQueryHandler } from '../handlers/msQueryHandler';
// import { helpHandler } from '../handlers/helpHandler';
// import { aiHandler } from '../handlers/aiHandler';
// import { cryptoHandler } from '../handlers/cryptoHandler';

export const registerCommands = (bot: Telegraf) => {
    bot.start(startHandler);
    bot.command('x',fullTokenScanHandler)
    bot.command('z',compactTokenScanHandler)
    bot.command('c',chartScanHandler)
    bot.command('cx',limitedChartScanHandler)
    bot.command('cc',fancyChartScanHandler)
    // bot.help(helpHandler);
    // bot.command('ai', aiHandler);
    // bot.command('crypto', cryptoHandler);
};
