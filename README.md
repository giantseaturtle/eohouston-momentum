# EO Houston Momentum - Landing Site

Static single-page marketing site for the EO Houston **Momentum** program, presented in
collaboration with the Liu Idea Lab for Innovation & Entrepreneurship (Lilie) at Rice University.

## Stack
Plain static site - `index.html`, `styles.css`, `main.js`. No build step. Deployable anywhere
(Vercel, Netlify, S3, or any static host).

## Local preview
```bash
cd ~/eohouston-momentum
python3 -m http.server 5173
# open http://localhost:5173
```

## Deploy to Vercel
Git integration: push to `main` deploys production (eomomentum.com); any other branch gets a preview URL. No CLI deploys needed. (No framework preset - Vercel serves the static files as-is.)

## Things to swap before going live
- **About section** (`index.html`, `#about`) - photos live in `assets/team/`:
  - `brian.jpg`, `robert.jpg`, `steffie.jpg`, `kyle.jpg` are real headshots.
  - `avneesh.jpg` is a real photo (interim shot Robert supplied; replace if a cleaner headshot turns up).
  - The earlier *fabricated* testimonial quotes were removed (they invented words for real people).
- **Apply link**: wired to the Google Form
  `https://docs.google.com/forms/d/e/1FAIpQLScc60ljBa1LPO7eaSDCN3AgaU5EIokMF0Y_E-ma583C2_H-xA/viewform`.
- **Strategic Alliance Partners** (`#partners`): all 11 use official logos in `assets/partners/`,
  pulled from the EO Houston homepage. Each links to the partner's site.

### EO brand assets (in `assets/`)
- `eo-logo-color.svg` - full logo, dark wordmark (for light backgrounds)
- `eo-logo-color-white.svg` - full logo, white wordmark (used in the footer); sourced from eonetwork.org
- `eo-mark.svg` - standalone round multicolor mark, transparent (extracted from the logo); used as the
  EO-section badge + watermark
- `eo-apple-touch.png` / `eo-favicon-32.png` - round EO mark, used as the site favicon/touch icon
The full wordmark appears once (footer); the round mark carries EO color everywhere else.
- **Official EO / Momentum logo**: the header uses an SVG mark approximating the postcard. Swap for
  the official asset when available.

## Rice / Lilie wording (important)
Copy uses EO Houston's own phrasing: "presented by EO Houston in collaboration with Rice University's
Lilie Lab for Innovation and Entrepreneurship." This frames Rice/Lilie as a **collaborating partner**
and avoids implying a Rice degree or graduation. Note: there is **no source disclaimer text** in the
postcard or program page about degrees or credentials. An earlier draft invented that language and it
was removed. If Rice requires specific disclaimer wording, get it from them before adding it.
