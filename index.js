require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const shortId = require('shortid');
const validUrl = require('valid-url');
const app = express();
// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String,
});
const Url = mongoose.model('Url', urlSchema);
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body;
  const urlCode = shortId.generate();
  if (!validUrl.isWebUri(url)) { // Check if the URL follows the HTTP(S) format
    return res.json({ error: 'invalid url' });
  }
  try {
    let findOne = await Url.findOne({ original_url: url });
    if (findOne) {
      res.json({ original_url: findOne.original_url, short_url: findOne.short_url });
    } else {
      findOne = new Url({ original_url: url, short_url: urlCode });
      await findOne.save();
      res.json({ original_url: url, short_url: urlCode });
    }
  } catch (err) {
    console.error(err);
    res.json({ error: 'Server error' });
  }
});
app.get('/api/shorturl/:short_url', async (req, res) => {
  try {
    const { short_url } = req.params;
    const url = await Url.findOne({ short_url: short_url });
    if (url) {
      return res.redirect(url.original_url);
    } else {
      return res.status(404).json({ error: 'No short URL found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
