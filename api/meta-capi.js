// Vercel Serverless Function for Meta Conversions API
// Set env vars in Vercel Project Settings:
// META_PIXEL_ID=600857419781134
// META_ACCESS_TOKEN=YOUR_META_ACCESS_TOKEN

const PIXEL_ID = process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!PIXEL_ID || !ACCESS_TOKEN) {
    return res.status(500).json({ error: 'Server not configured: META_PIXEL_ID or META_ACCESS_TOKEN missing' });
  }

  try {
    const {
      event_name,
      event_id,
      event_time,
      event_source_url,
      action_source = 'website',
      user_data = {}
    } = req.body || {};

    if (!event_name) return res.status(400).json({ error: 'event_name required' });

    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    const ua = req.headers['user-agent'] || '';

    const payload = {
      data: [
        {
          event_name,
          event_time: event_time || Math.floor(Date.now() / 1000),
          event_id: event_id || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          event_source_url: event_source_url || undefined,
          action_source,
          user_data: {
            client_ip_address: ip || undefined,
            client_user_agent: ua || undefined,
            ...user_data,
          },
        },
      ],
      test_event_code: process.env.META_TEST_EVENT_CODE || undefined,
    };

    const url = `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      return res.status(502).json({ error: 'Meta API error', details: result });
    }

    return res.status(200).json({ ok: true, result });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err?.message || String(err) });
  }
};
