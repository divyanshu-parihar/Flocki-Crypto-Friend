"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fullTokenScanHandler = void 0;
const axios_1 = __importDefault(require("axios"));
const fullTokenScanHandler = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Set the default token symbol to MXUSDT if no token is provided
        const token = ((_a = ctx.text) === null || _a === void 0 ? void 0 : _a.split(' ')[1]) || "ETHUSDT";
        // API endpoint for 24-hour ticker
        const apiUrl = `https://api.mexc.in/api/v3/ticker/24hr?symbol=${token}`;
        // Fetch ticker data from MEXC API
        const response = yield axios_1.default.get(apiUrl);
        const data = response.data;
        // Check if the response data is valid
        if (!data.symbol) {
            yield ctx.reply('Token not found. Please check the symbol and try again.');
            return;
        }
        // Parse and format the response data
        const message = `
🟡 [View on MEXC](https://www.mexc.com/token/${data.symbol})  
🌐 ${data.symbol} @ MEXC  
💰 Last Price: \$${parseFloat(data.lastPrice).toFixed(2)}  
💎 Price Change: \$${parseFloat(data.priceChange).toFixed(2)} \(${data.priceChangePercent}\%\)  
💦 High: \$${parseFloat(data.highPrice).toFixed(2)}  
📉 Low: \$${parseFloat(data.lowPrice).toFixed(2)}  
📊 Volume: ${parseFloat(data.volume).toFixed(2)} ${data.symbol.replace(/USDT/, '')}  
🔹 Bid Price: \$${parseFloat(data.bidPrice).toFixed(2)}  
🔸 Ask Price: \$${parseFloat(data.askPrice).toFixed(2)}  
🧰 More: [📊 MEXC](https://www.mexc.com/token/${data.symbol})  
`;
        yield ctx.reply(message, { parse_mode: "Markdown" });
    }
    catch (error) {
        console.error('Error fetching token data:', error);
        ctx.reply('Failed to retrieve token information.');
    }
});
exports.fullTokenScanHandler = fullTokenScanHandler;
