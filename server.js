const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

const SEND_OTP_WEBHOOK_URL = 'https://n8n.alecasgari.com/webhook/c7ca834e-c3e5-416b-b288-52d62b5e3663';
const VERIFY_OTP_WEBHOOK_URL = 'https://n8n.alecasgari.com/webhook/4e27c150-2304-4358-bae4-657d48289e0e';
const FORM_ID = 'digitalNomadSpain';

app.use(compression());
app.use(express.json());

app.use((req, res, next) => {
  if (req.url.match(/\.(?:woff2|woff|ttf|eot|png|jpg|jpeg|gif|svg|webp|ico|css|js)$/i)) {
    res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
  }
  next();
});

app.use(express.static('.', {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

app.post('/send-otp', async (req, res) => {
  try {
    const payload = { ...req.body, form_id: FORM_ID };
    const response = await fetch(SEND_OTP_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Send OTP webhook failed with status ${response.status}`);
    }

    res.status(200).json({ status: 'success', message: 'OTP sent.' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ status: 'error', message: 'Failed to send OTP.' });
  }
});

app.post('/verify-otp', async (req, res) => {
  try {
    const payload = { ...req.body, form_id: FORM_ID };
    const response = await fetch(VERIFY_OTP_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Verify OTP webhook failed with status ${response.status}`);
    }

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ status: 'error', message: 'Failed to verify OTP.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Landing02.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

