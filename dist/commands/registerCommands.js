"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const startHandler_1 = require("../handlers/startHandler");
const fullTokenScanHandler_1 = require("../handlers/fullTokenScanHandler");
// import { helpHandler } from '../handlers/helpHandler';
// import { aiHandler } from '../handlers/aiHandler';
// import { cryptoHandler } from '../handlers/cryptoHandler';
const registerCommands = (bot) => {
    bot.start(startHandler_1.startHandler);
    bot.command('x', fullTokenScanHandler_1.fullTokenScanHandler);
    // bot.help(helpHandler);
    // bot.command('ai', aiHandler);
    // bot.command('crypto', cryptoHandler);
};
exports.registerCommands = registerCommands;
