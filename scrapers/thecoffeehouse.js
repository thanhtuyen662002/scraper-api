const puppeteer = require('puppeteer');

module.exports = async function scrapeTCH() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
  );

  await page.goto('https://www.thecoffeehouse.com/pages/khuyen-mai', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  await page.waitForSelector('img[src*="/static/images/banner2"]', { timeout: 60000 });

  const images = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img[src*="/static/images/banner2"]'))
      .map(img => img.src.startsWith('/')
        ? 'https://promothecoffeeehouse.com.vn/' + img.src
        : img.src);
  });

  await browser.close();
  return images;
};
