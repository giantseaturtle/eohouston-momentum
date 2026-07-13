# EO Momentum site (eomomentum.com)

Static one-page site for the EO Houston Momentum program. No build step, no framework - plain HTML/CSS/JS served by Vercel.

## Deploy

- Vercel project `eohouston-momentum` deploys this repo via git integration.
- Push to `main` = LIVE on https://eomomentum.com within ~1 minute. Treat main as production.
- Push any other branch = preview deployment (URL posted on the commit/PR by the Vercel bot). Use a branch + preview when a change is risky or visual.
- Do not deploy with the Vercel CLI; git push is the deploy.

## Layout

- `index.html` - the entire site (single page, anchor-nav sections).
- `styles.css`, `main.js` - shared styles and small interactions.
- `assets/` - logos, favicons, og-image, partner + team photos. All referenced from index.html; don't rename without updating references.
- `vercel.json` - www -> apex redirects only.
- `momentum-email.html`, `momentum-email-eo.html` - EMAIL DRAFTS, not site pages. They are not linked from the site and carry their own copies of dates/links. Only touch when asked to prep an email.

## Recurring gotcha: the webinar link

The Zoom webinar registration link and its date/time appear in TWO places in `index.html`:
1. Hero banner (`.hero-webinar`, near the top)
2. Admissions section (`.admit-webinar`, near the bottom)

When the webinar changes, update the `href` AND the visible date/time text in BOTH spots. Zoom registration pages are client-rendered - curl won't show the date; open the link in a browser to confirm date/time before writing it into copy.

## Copy conventions

- No em dashes in site copy; use a hyphen, comma, or new sentence.
- Times are Central (CT). Spell dates like "Wednesday, July 15, 10:30 AM CT".
- Voice: direct, plain, confident. No exclamation-mark hype.
