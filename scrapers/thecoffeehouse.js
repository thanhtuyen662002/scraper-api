const puppeteer = require('puppeteer');

module.exports = async function scrapeTCH() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.goto('https://www.thecoffeehouse.com/pages/khuyen-mai', { waitUntil: 'networkidle2' });
  await page.waitForSelector('.item img');

  const images = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img')).map(img => img.src)
  );

  await browser.close();
  return images;
};
