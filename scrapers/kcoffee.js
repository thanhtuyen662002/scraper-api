const puppeteer = require('puppeteer');

module.exports = async function scrapeKCoffee() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.goto('https://www.kphucsinh.vn/collections/uu-dai', { waitUntil: 'networkidle2', timeout: 120000 });
  await page.waitForSelector('.slide-img-wrapper img');

  const images = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img')).map(img => img.src)
  );

  await browser.close();
  return images;
};
