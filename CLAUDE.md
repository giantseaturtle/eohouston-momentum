# EO Momentum site (eomomentum.com)

Static one-page site for the EO Houston Momentum program. No build step, no framework - plain HTML/CSS/JS served by Vercel.

## Session workflow - handle git for the user

Most people editing this repo are non-technical; they open Claude Code, describe a change, and expect it live. You own the entire git lifecycle:

1. **Start of session, before any edit:** `git pull --rebase origin main` so you're editing the latest version (others edit this repo too). If there are uncommitted local changes from a previous session, tell the user in plain words and ask whether to publish or discard them before continuing.
2. **After completing each requested change:** commit with a short clear message and push to main right away - publishing is part of the task, don't ask first. Then tell the user: the change goes live at https://eomomentum.com in about a minute, refresh to see it.
3. If the push is rejected, `git pull --rebase` and push again. If authentication fails, tell them to open GitHub Desktop and sign in once, then ask you to retry.
4. Speak plainly - say "publish" and "get the latest version," not jargon. Never ask the user to run commands themselves.
5. This repo is PUBLIC. Never commit secrets, member/applicant data, or internal documents, and keep commit messages to what changed. If the user asks to add something like that, warn them and don't commit it.

## Deploy

- Vercel project `eohouston-momentum` deploys this repo via git integration.
- Push to `main` = LIVE on https://eomomentum.com within ~1 minute. Treat main as production.
- Push any other branch = preview deployment (URL posted on the commit/PR by the Vercel bot). Use a branch + preview when a change is risky or visual.
- Do not deploy with the Vercel CLI; git push is the deploy.
- Vercel BLOCKS deploys whose commit author can't be matched to a GitHub account. Before your first push, make sure `git config user.email` is an email verified on your GitHub profile, or the deploy silently stalls as BLOCKED.

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
