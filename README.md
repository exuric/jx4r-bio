# jx4r-bio — personal bio page (guns.lol-style)

Single-file-ish static site: `index.html` + `style.css` + `app.js` + `avatar.png` + `bg.png`.

## Run locally

Any static server, e.g. `python3 -m http.server` in this folder, then open
http://localhost:8000. (Open `index.html` directly also works, except the
view counter needs http/https for the API call.)

## Customize

- **Avatar:** live from Discord via Lanyard (auto). `avatar.png`/`deco.png`
  are offline fallbacks.
- **Links / bio lines:** edit `CONFIG` at the top of `app.js`.
- **View base:** `VIEWS.base` in `app.js` (currently 3608). Unique per
  browser; global totals need the worker below.

## Global view counter (optional, free)

Browsers block the old free counter API (CORS), so global counts run on
your own Cloudflare Worker + KV — see `worker.js` header for the 5-step
dashboard deploy, then set `CONFIG.counterApi` in `app.js` to the worker
URL. Without it the page counts per-browser (still unique-guarded).

## Push to GitHub (private, on exuric)

GitHub CLI way (on YOUR machine, logged in as exuric):

```powershell
winget install --id GitHub.cli
gh auth login
cd path\to\jx4r-bio
gh repo create exuric/jx4r-bio --private --source=. --push
```

Or web way: create a **Private** repo `jx4r-bio` on github.com/exuric (no
README), then:

```powershell
git remote add origin https://github.com/exuric/jx4r-bio.git
git branch -M main
git push -u origin main
```

## Deploy (free, works with private repos)

- **Vercel:** vercel.com → Add New → Project → Import `exuric/jx4r-bio`
  (grant access to the private repo) → Deploy. No build settings needed.
- **Netlify:** same flow, publish directory `.`.
- **Cloudflare Pages:** same flow, no build command.

Then point your domain (or use the free `*.vercel.app` URL).
