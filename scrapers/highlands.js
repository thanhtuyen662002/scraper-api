const puppeteer = require('puppeteer');

module.exports = async function scrapeHighlands() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.goto('https://promo.highlandscoffee.com.vn/uudai4', { waitUntil: 'networkidle2' });
  await page.waitForSelector('img.emblaCarousel_embla__slide__img__body__HYshL');

  const images = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img.emblaCarousel_embla__slide__img__body__HYshL')).map(img => img.src)
  );

  await browser.close();
  return images;
};
