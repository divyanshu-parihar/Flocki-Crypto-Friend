import puppeteer from 'puppeteer';
import path from "path";

// Or import puppeteer from 'puppeteer-core';

// Launch the browser and open a new blank page
function delay(time:number) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time)
    });
}
async function run() {
    console.log('trying to run')
    const browser = await puppeteer.launch(

    );
    const page = await browser.newPage();

// Navigate the page to a URL.
    await page.goto('https://app.bubblemaps.io/eth/token/0xc00e94cb662c3520282e6f5717214004a7f26888');

    await page.setViewport({width: 1080, height: 1024});
    await  delay(8000)
    const filename = path.join(__dirname, `hello.png`);
    await page.screenshot(
        {
            fullPage: true,
            omitBackground: true,
            path: filename
        }
    )
    await browser.close()
}


run()
