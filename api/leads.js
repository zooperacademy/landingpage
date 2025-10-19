// Save lead to Vercel Postgres
// Requires Vercel Postgres integration with env set (DATABASE_URL / POSTGRES_URL)
// npm dependency: @vercel/postgres (declared in package.json)

const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  // CORS (allow same-site usage; adjust origin if needed)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
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

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'DB error', details: err?.message || String(err) });
  }
};
