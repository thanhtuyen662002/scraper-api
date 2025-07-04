const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { createClient } = require('redis');

const scrapeHighlands = require('./scrapers/highlands');
const scrapeTCH = require('./scrapers/thecoffeehouse');
const scrapeKCoffee = require('./scrapers/kcoffee');

const app = express();
app.use(cors());

// ===== Redis Setup =====
const redis = createClient({
  url: process.env.REDIS_PUBLIC_URL,
});

redis.on('error', err => console.error('Redis error:', err));
redis.connect().then(() => console.log('✅ Kết nối Redis thành công'));

// ===== API =====
app.get('/api/:brand', async (req, res) => {
  const { brand } = req.params;

  try {
    const cached = await redis.get(`images:${brand}`);
    if (cached) {
      return res.json({ images: JSON.parse(cached), cached: true });
    }

    // Nếu chưa có cache, crawl trực tiếp
    let data;
    switch (brand) {
      case 'highlands':
        data = await scrapeHighlands();
        break;
      case 'thecoffeehouse':
        data = await scrapeTCH();
        break;
      case 'kcoffee':
        data = await scrapeKCoffee();
        break;
      default:
        return res.status(400).json({ error: 'Không hỗ trợ thương hiệu này' });
    }

    // Lưu vào Redis trong 24h (86400 giây)
    await redis.setEx(`images:${brand}`, 86400, JSON.stringify(data));

    res.json({ images: data, cached: false });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi crawl: ' + err.message });
  }
});

// ===== Cron Job mỗi 3h đêm =====
cron.schedule('0 3 * * *', {timezone: 'Asia/Ho_Chi_Minh'}, async () => {
  console.log('🕛 Đang cập nhật ảnh mới vào Redis...');

  try {
    const [highlands, tch, kcoffee] = await Promise.all([
      scrapeHighlands(),
      scrapeTCH(),
      scrapeKCoffee(),
    ]);

    await redis.setEx('images:highlands', 86400, JSON.stringify(highlands));
    await redis.setEx('images:thecoffeehouse', 86400, JSON.stringify(tch));
    await redis.setEx('images:kcoffee', 86400, JSON.stringify(kcoffee));

    console.log('✅ Đã cập nhật ảnh mới vào Redis lúc 3h');
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật ảnh trong cronjob:', err);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server đang chạy ở cổng ${PORT}`));
