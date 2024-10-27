import puppeteer from "puppeteer";
import path from "path";
import {delay} from "./delay";

export async function takeScreenshot(url:string,selector:string,username:string){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

// Navigate the page to a URL.
    await page.goto(url);

    await page.setViewport({width: 1080, height: 1024});
    await delay(8000)
    const filename = path.join(__dirname, `${username}.png`);
    await page.screenshot(
        {
            fullPage: true,
            omitBackground: true,
            path: filename
        }
    )
    await browser.close()
}