const puppeteer = require('puppeteer');

module.exports = async function scrapeKCoffee() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
  );

  await page.goto('https://uudai.kphucsinh.vn/', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  // Chờ bất kỳ ảnh nào có chứa domain cdn.kphucsinh.vn (ảnh khuyến mãi)
  await page.waitForSelector('img[src*="cdn.kphucsinh.vn/Media/DMSImage"]', { timeout: 60000 });

  const images = await page.evaluate(() => {
    const raw = Array.from(document.querySelectorAll('img[src*="cdn.kphucsinh.vn/Media/DMSImage"]'))
      .map(img => img.src);
    return [...new Set(raw)];
  });

  await browser.close();
  return images;
};
