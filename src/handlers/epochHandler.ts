import { Context } from "telegraf";
import puppeteer from "puppeteer";
import { takeScreenshot } from "../utils/screnshot";
const fs = require("fs").promises;
const path = require("path");

export async function epochHandler(ctx: Context) {
  console.log("starting");
  const args = ctx.text?.split(" ") || [];
  const time: any = args[1];
  const date = new Date(time * 1000);
  console.log(date);
  // Format the date to a readable string in UTC
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  };

  const formattedDate = date.toLocaleString("en-US");
  await ctx.reply(`🕰️ ${formattedDate} UTC`);
}
