import {Context} from "telegraf";
import puppeteer  from 'puppeteer'
import {takeScreenshot} from "../utils/screnshot";
const fs = require('fs').promises;
const path = require('path');

export async  function bubbleMapHandler(ctx : Context){
    console.log('starting')
    const args = ctx.text?.split(' ').slice(1) || [];
    const token = args[0] || '0xc00e94cb662c3520282e6f5717214004a7f26888'; // Default to 'BTCUSDT' if no token provided
    if(ctx.from?.id == undefined) return;
    await takeScreenshot('https://app.bubblemaps.io/eth/token/'+token,'',ctx.from.id + token)
    console.log(path.join(__dirname,'../utils',ctx.from?.id+token+'.png'))
    const filePath = path.join(__dirname, '../utils', `${ctx.from?.id}${token}.png`);
    await ctx.replyWithPhoto({source : filePath}, { caption: `BubbleMap for ${token} ` });
}
