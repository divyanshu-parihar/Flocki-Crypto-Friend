import {Context} from "telegraf";
import puppeteer  from 'puppeteer'
import {takeScreenshot} from "../utils/screnshot";
const fs = require('fs').promises;
const path = require('path');

export async  function dexPaidCheckHandler(ctx : Context){
    console.log('starting')
    const args = ctx.text?.split(' ').slice(1) || [];
    const token = args[0] || '0xc00e94cb662c3520282e6f5717214004a7f26888'; // Default to 'BTCUSDT' if no token provided

}
