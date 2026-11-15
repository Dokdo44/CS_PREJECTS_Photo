# Archive — Photography Portfolio

A responsive photography portfolio presenting 100+ images in categorized galleries, built
with no framework and no build step: three files, vanilla JavaScript, deployed as static assets.

**Stack** — HTML5 · CSS3 · Vanilla JavaScript · EXIF.js · Netlify

---

## What it does

- **Categorized galleries** with dynamic client-side filtering and search
- **Image modal** that reads EXIF metadata off the file itself — camera make and model,
  ISO, aperture, shutter speed, focal length — and displays it alongside the photo
- **Lazy loading** so a 100-image grid does not block first paint
- **Minimal, museum-like layout** — the interface stays out of the way of the images

## Accessibility

Built to be usable without a mouse:

- Skip link to main content
- Every gallery card is focusable and opens on `Enter` or `Space`
- `aria-label` on each card, `aria-live` on the grid so filter results are announced
- Modal navigable by keyboard, with focus handling on open and close
- Semantic HTML throughout; alt text on every image

Tested across Chrome, Safari, and Firefox.

## Structure

```
index.html     markup and semantic landmarks
style.css      layout, responsive grid, modal (614 lines)
script.js      filtering, modal, EXIF extraction, keyboard handling (527 lines)
netlify.toml   deploy config + security and cache headers
```

## Running locally

No build step and no dependencies. Serve the directory:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Notes

`netlify.toml` sets security headers (`X-Frame-Options`, `X-Content-Type-Options`,
`Referrer-Policy`) and immutable long-lived cache headers for images, CSS, and JS.

EXIF parsing happens in the browser — no server, no upload, nothing leaves the page.
