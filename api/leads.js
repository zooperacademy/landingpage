// Save lead to Vercel Postgres
// Requires Vercel Postgres integration with env set (DATABASE_URL / POSTGRES_URL)
// npm dependency: @vercel/postgres (declared in package.json)

const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  // CORS (allow same-site usage; adjust origin if needed)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const limit = Math.max(1, Math.min(200, parseInt(url.searchParams.get('limit') || '50', 10)));
      const rows = await sql`SELECT id, name, email, phone, city, purpose, created_at FROM leads ORDER BY created_at DESC LIMIT ${limit};`;
      return res.status(200).json({ ok: true, leads: rows.rows });
    } catch (err) {
      return res.status(500).json({ error: 'DB error', details: err?.message || String(err) });
    }
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { name, email, phone, city, purpose } = req.body || {};
    if (!name || !phone || !email) return res.status(400).json({ error: 'Missing fields' });

    // create table if not exists (lightweight guard)
    await sql`CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT,
      purpose TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`;

    await sql`INSERT INTO leads (name, email, phone, city, purpose) VALUES (${name}, ${email}, ${phone}, ${city || null}, ${purpose || null});`;

    // Forward to Mailketing (best-effort, non-blocking)
    const mkUrl = process.env.MAILKETING_API_URL || 'https://api.mailketing.co.id/api/v1/addsubtolist';
    const mkToken = process.env.MAILKETING_API_TOKEN || '';
    const mkListId = process.env.MAILKETING_LIST_ID || '';
    if (mkUrl && mkToken && mkListId) {
      try {
        const payload = new URLSearchParams();
        // Map fields to Mailketing API spec
        const [firstName, ...restName] = (name || '').split(' ');
        const lastName = restName.join(' ').trim();
        payload.set('api_token', mkToken);
        payload.set('list_id', mkListId);
        payload.set('email', email);
        if (firstName) payload.set('first_name', firstName);
        if (lastName) payload.set('last_name', lastName);
        if (phone) payload.set('mobile', phone);
        if (city) payload.set('city', city);
        // Optional extras if provided via env
        if (process.env.MAILKETING_STATE) payload.set('state', process.env.MAILKETING_STATE);
        if (process.env.MAILKETING_COUNTRY) payload.set('country', process.env.MAILKETING_COUNTRY);
        if (process.env.MAILKETING_COMPANY) payload.set('company', process.env.MAILKETING_COMPANY);
        const headers = { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' };
        // Fire-and-forget with timeout guard
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4500);
        fetch(mkUrl, { method: 'POST', headers, body: payload, signal: controller.signal })
          .catch(() => {})
          .finally(() => clearTimeout(timer));
      } catch (_) {}
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'DB error', details: err?.message || String(err) });
  }
};
