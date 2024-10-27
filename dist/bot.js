"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bot = void 0;
const telegraf_1 = require("telegraf");
const config_1 = require("./config");
const registerCommands_1 = require("./commands/registerCommands");
const bot = new telegraf_1.Telegraf(config_1.config.botToken);
exports.bot = bot;
// Register commands
(0, registerCommands_1.registerCommands)(bot);
