const express = require('express');
const cors = require('cors');

const scrapeHighlands = require('./scrapers/highlands');
const scrapeTCH = require('./scrapers/thecoffeehouse');
const scrapeKCoffee = require('./scrapers/kcoffee');

const app = express();
app.use(cors());

app.get('/api/:brand', async (req, res) => {
  const { brand } = req.params;

  try {
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

    res.json({ images: data });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi crawl: ' + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy ở cổng ${PORT}`));
