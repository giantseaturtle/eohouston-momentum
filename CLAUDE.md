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

## The webinar banner

The webinar is DATA, not HTML: it lives in `webinar.json` at the repo root. `main.js` reads it and fills two hidden skeletons in `index.html` (hero `#hero-webinar` + admissions `#admit-webinar`); nothing shows when `enabled` is false, and it auto-hides 90 minutes after `startISO`. To change the webinar, edit `webinar.json` (set `enabled`, `startISO` like `2026-08-12T10:30:00-05:00`, `displayText` like `Tuesday, August 12, 2026, 10:30 AM CT`, and the Zoom `link`) and push - never hardcode webinar dates back into `index.html`.

Non-technical people can do the same thing through the admin page at https://eomomentum.com/admin (access code required) - it posts to `api/webinar.js`, which commits `webinar.json` via the GitHub API (needs `ADMIN_PASSWORD` + `GITHUB_TOKEN` env vars in the Vercel project). Zoom registration pages are client-rendered - curl won't show the date; open the link in a browser to confirm date/time before publishing it.

## The contact page

`contact.html` is the second page on the site (served at `/contact`, `cleanUrls` is on). It has a contact form (name, email, phone, company, message) that POSTs to `api/contact.js`, which emails the submission to robert@skyhighpartyrentals.com via Resend (needs `RESEND_API_KEY` env var in the Vercel project). Reply-To is set to the submitter's address so Robert can just hit reply. There's a hidden honeypot field (`website`) for spam bots; real visitors never see or fill it.

Sender address defaults to Resend's shared `onboarding@resend.dev`, which Resend allows to send to the email that owns the API key without any domain setup - fine as long as the destination stays robert@skyhighpartyrentals.com. To send "from" an eomomentum.com address instead (better deliverability/branding), verify that domain in Resend and set `CONTACT_FROM_EMAIL` (e.g. `"EO Momentum <contact@eomomentum.com>"`).

`contact.html` carries its own copy of the header and footer. Any nav, brand, or footer change on the homepage has to be mirrored there by hand, with the anchors written as `/#program`-style absolute links.

The same form is also embedded directly on the homepage as section `#contact` (between Admissions and the final CTA) so people don't have to leave the page to ask a question - better for conversions than routing them to a separate page. Both instances share the exact same field IDs (`contactForm`, `cf-name`, `cf-email`, etc.) and are wired up by one handler in `main.js`, so a form-handling change only needs to happen once. The homepage nav, hero, admissions, final CTA, and footer all link to `#contact` rather than `/contact` now; the standalone `/contact` page still works (for direct traffic, external links, search results) but isn't linked from within the homepage anymore.

## 404 page

`404.html` at the repo root is Vercel's automatic fallback for any unmatched path on a static (no-framework) deployment - no routing config needed, and the real 404 status code is preserved. It carries its own copy of the header/footer (same pattern as `contact.html`) and fires a `page_not_found` GA4 event with `path` and `referrer` params, so dead-link traffic shows up in GA4 going forward - the site has no functions, so `vercel logs` has nothing to show for a static deploy, at any time window.

## Analytics

GA4 tag `G-NMEJ7BV822` is loaded in the `<head>` of `index.html` and `contact.html` (not `admin.html`, which is internal-only). Two custom events, both fired from `main.js`:

- `apply_click` - fires on click for any element with a `data-ga-apply` attribute (all the "Apply Now" / "Apply for Momentum" / "Start your application" buttons and links). The attribute value becomes the `link_location` param (`header_nav`, `mobile_nav`, `hero`, `admissions_section`, `contact_section`, `contact_page`, `final_cta`) so Robert can see which CTA is converting. Adding a new Apply-style CTA anywhere on the site should get a `data-ga-apply="<something descriptive>"` attribute to stay tracked.
- `contact_form_submit` - fires once the contact form POST to `api/contact` succeeds, with a `page_location` param (`/` or `/contact`) so submissions from the homepage embed and the standalone page can be told apart.

## Copy conventions

- No em dashes in site copy; use a hyphen, comma, or new sentence.
- Times are Central (CT). Spell dates like "Wednesday, July 15, 10:30 AM CT".
- Voice: direct, plain, confident. No exclamation-mark hype.
