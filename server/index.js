require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/gemini', async (req, res) => {
  try {
    const apiKeyRaw = process.env.GEMINI_API_KEY;
    const apiKey = (apiKeyRaw || '')
      .trim()
      .replace(/^"(.*)"$/, '$1')
      .replace(/^'(.*)'$/, '$1')
      .trim();
    
    if (!apiKey) {
      return res.status(500).json({ error: { message: 'GEMINI_API_KEY server tarafinda tanimli degil.' } });
    }
    if (!apiKey.startsWith('AIza') || apiKey.length < 30) {
      return res.status(500).json({
        error: {
          message: 'GEMINI_API_KEY formati gecersiz gorunuyor. .env dosyasinda placeholder kaldiysa gercek Gemini API key ile degistir ve proxy yeniden baslat.',
        },
      });
    }

    const promptText = req.body?.promptText;
    if (typeof promptText !== 'string' || !promptText.trim()) {
      return res.status(400).json({ error: { message: 'promptText zorunlu (string).' } });
    }

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { 
          temperature: 0.2, 
          maxOutputTokens: 150,
          topP: 0.9,
          topK: 10
        },
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.error?.message || `HTTP ${response.status}`;
      console.error('Gemini API Hatasi:', message);
      return res.status(response.status).json({ error: { message } });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    
    if (!text) {
      console.error('Gemini bos yanit dondu:', data);
      return res.status(500).json({ error: { message: 'Gemini bos yanit dondurdu' } });
    }
    
    return res.json({ text });
  } catch (err) {
    console.error('Server hatasi:', err);
    return res.status(500).json({ error: { message: err?.message || 'Bilinmeyen hata' } });
  }
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[gemini-proxy] listening on http://localhost:${port}`);
});
