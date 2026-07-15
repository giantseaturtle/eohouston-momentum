// Admin API for the webinar banner. POST from /admin updates webinar.json by
// committing to GitHub; the git integration then redeploys the site (~1 min).
// Requires env vars: ADMIN_PASSWORD, GITHUB_TOKEN (fine-grained PAT, this repo
// only, Contents read/write).
const crypto = require('crypto');

const REPO = 'giantseaturtle/eohouston-momentum';
const FILE = 'webinar.json';
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

// Best-effort brute-force damper (per warm instance).
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_TRIES = 8;

function tooManyTries(ip) {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now - rec.ts > WINDOW_MS) {
    attempts.set(ip, { ts: now, n: 1 });
    return false;
  }
  rec.n += 1;
  return rec.n > MAX_TRIES;
}

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

// date "YYYY-MM-DD" + time "HH:MM" (Central wall time) -> "Tuesday, August 12, 2026, 10:30 AM CT"
function displayText(date, time) {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const weekday = DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const h12 = ((hh + 11) % 12) + 1;
  const ampm = hh >= 12 ? 'PM' : 'AM';
  return `${weekday}, ${MONTHS[m - 1]} ${d}, ${y}, ${h12}:${String(mm).padStart(2, '0')} ${ampm} CT`;
}

function isZoomLink(link) {
  try {
    const u = new URL(link);
    return u.protocol === 'https:' && (u.hostname === 'zoom.us' || u.hostname.endsWith('.zoom.us'));
  } catch {
    return false;
  }
}

async function commitToGitHub(data, message) {
  const headers = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'eomomentum-admin',
  };
  const url = `https://api.github.com/repos/${REPO}/contents/${FILE}`;
  const current = await fetch(`${url}?ref=main`, { headers });
  if (!current.ok) throw new Error(`GitHub read failed (${current.status})`);
  const { sha } = await current.json();
  const body = {
    message,
    sha,
    branch: 'main',
    content: Buffer.from(JSON.stringify(data, null, 2) + '\n').toString('base64'),
    committer: { name: 'EO Momentum Admin', email: 'admin@eomomentum.com' },
  };
  const put = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(body) });
  if (!put.ok) throw new Error(`GitHub write failed (${put.status})`);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }
  if (!process.env.ADMIN_PASSWORD || !process.env.GITHUB_TOKEN) {
    return res.status(500).json({ error: 'The server is not fully set up yet (missing configuration). Contact Robert.' });
  }

  const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  if (tooManyTries(ip)) {
    return res.status(429).json({ error: 'Too many attempts. Wait 15 minutes and try again.' });
  }

  const { code, action, date, time, link } = req.body || {};
  if (!code || !safeEqual(code, process.env.ADMIN_PASSWORD)) {
    return res.status(401).json({ error: 'Wrong access code.' });
  }

  try {
    if (action === 'remove') {
      await commitToGitHub(
        { enabled: false, startISO: '', displayText: '', link: '' },
        'Webinar: removed from site (via admin page)'
      );
      return res.status(200).json({ ok: true, message: 'Webinar removed. The site updates in about a minute.' });
    }

    if (action === 'publish') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date)) || !/^\d{2}:\d{2}$/.test(String(time))) {
        return res.status(400).json({ error: 'Pick a date and a time.' });
      }
      if (!isZoomLink(String(link))) {
        return res.status(400).json({ error: 'The registration link must be a Zoom link (an address on zoom.us).' });
      }
      const startISO = `${date}T${time}:00-05:00`; // Central wall time; ±1h DST fuzz only affects auto-hide
      if (new Date(startISO).getTime() < Date.now()) {
        return res.status(400).json({ error: 'That date and time is in the past.' });
      }
      const text = displayText(String(date), String(time));
      await commitToGitHub(
        { enabled: true, startISO, displayText: text, link: String(link) },
        `Webinar: ${text} (via admin page)`
      );
      return res.status(200).json({ ok: true, message: `Published: ${text}. The site updates in about a minute.` });
    }

    return res.status(400).json({ error: 'Unknown action.' });
  } catch (err) {
    return res.status(502).json({ error: 'Saving failed. Try again, or contact Robert. (' + err.message + ')' });
  }
};
