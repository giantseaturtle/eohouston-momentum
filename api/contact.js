// Contact form handler for /contact. Sends the submission to Robert by email via
// Resend (https://resend.com). Requires env var RESEND_API_KEY.
//
// Sender defaults to Resend's shared onboarding@resend.dev address, which Resend
// allows to send to the email that owns the API key without any domain setup.
// To send "from" an eomomentum.com address instead, verify that domain in Resend
// and set CONTACT_FROM_EMAIL (e.g. "EO Momentum <contact@eomomentum.com>").

const TO_EMAIL = 'robert@skyhighpartyrentals.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Best-effort brute-force / spam damper (per warm instance).
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

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: "The contact form isn't fully set up yet. Email robert@skyhighpartyrentals.com directly for now." });
  }

  const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  if (tooManyTries(ip)) {
    return res.status(429).json({ error: 'Too many messages sent from this connection. Wait 15 minutes and try again.' });
  }

  const { name, email, phone, company, message, website } = req.body || {};

  // Honeypot: bots fill hidden fields. Pretend success so they don't learn to skip it.
  if (website) {
    return res.status(200).json({ ok: true });
  }

  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'Please enter your name.' });
  }
  if (!email || !EMAIL_RE.test(String(email).trim())) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!company || !String(company).trim()) {
    return res.status(400).json({ error: 'Please enter your company name.' });
  }
  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: 'Please enter a message.' });
  }
  if (String(message).length > 5000) {
    return res.status(400).json({ error: 'Message is too long. Please keep it under 5000 characters.' });
  }

  const safeName = String(name).trim().slice(0, 200);
  const safeEmail = String(email).trim().slice(0, 200);
  const safePhone = phone ? String(phone).trim().slice(0, 60) : '';
  const safeCompany = company ? String(company).trim().slice(0, 200) : '';
  const safeMessage = String(message).trim().slice(0, 5000);

  const lines = [
    `Name: ${safeName}`,
    `Email: ${safeEmail}`,
    safePhone ? `Phone: ${safePhone}` : null,
    safeCompany ? `Company: ${safeCompany}` : null,
    '',
    safeMessage,
  ].filter((l) => l !== null);

  const html = `
    <p><strong>Name:</strong> ${escapeHtml(safeName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(safeEmail)}</p>
    ${safePhone ? `<p><strong>Phone:</strong> ${escapeHtml(safePhone)}</p>` : ''}
    ${safeCompany ? `<p><strong>Company:</strong> ${escapeHtml(safeCompany)}</p>` : ''}
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(safeMessage).replace(/\n/g, '<br>')}</p>
  `;

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || 'EO Momentum Contact <onboarding@resend.dev>',
        to: [TO_EMAIL],
        reply_to: safeEmail,
        subject: `New contact form message from ${safeName}`,
        text: lines.join('\n'),
        html,
      }),
    });

    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      throw new Error(`Resend ${resp.status}: ${body}`);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(502).json({ error: 'Sending failed. Please try again, or email robert@skyhighpartyrentals.com directly. (' + err.message + ')' });
  }
};
