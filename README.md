# Stampr — Free PDF & Image Toolkit

A free, static, browser-based PDF and image toolkit. Every conversion runs
locally in the visitor's browser (PDF.js, pdf-lib, SheetJS, JSZip, docx.js,
heic2any) — there is no backend, no file upload, and no database.

## Pages

- `index.html` — homepage
- `merge-pdf.html` — Merge PDF
- `compress-pdf.html` — Compress PDF
- `jpg-to-pdf.html` — JPG to PDF
- `pdf-to-jpg.html` — PDF to JPG
- `pdf-to-word.html` — PDF to Word
- `pdf-to-excel.html` — PDF to Excel
- `heic-to-jpg.html` — HEIC to JPG
- `about.html`, `privacy.html`, `terms.html`, `contact.html`
- `404.html` — custom not-found page
- `sitemap.xml`, `robots.txt`

## Project structure

```
/
├── index.html
├── merge-pdf.html
├── compress-pdf.html
├── jpg-to-pdf.html
├── pdf-to-jpg.html
├── pdf-to-word.html
├── pdf-to-excel.html
├── heic-to-jpg.html
├── about.html
├── privacy.html
├── terms.html
├── contact.html
├── 404.html
├── sitemap.xml
├── robots.txt
└── assets/
    ├── css/style.css
    └── js/
        ├── common.js         (shared helpers used on every page)
        └── tools/             (one script per tool, loaded only on its own page)
            ├── merge.js
            ├── compress.js
            ├── img2pdf.js
            ├── pdf2img.js
            ├── pdf2word.js
            ├── pdf2excel.js
            └── heic.js
```

Each tool page only loads the third-party libraries it actually needs, so
pages stay as light as possible.

## GitHub username already set

Every canonical URL, Open Graph tag, and the sitemap/robots.txt already
point to:

```
https://naveen10000000.github.io/stampr/
```

If you ever deploy this under a **different** GitHub account, replace
`naveen10000000` with that account's username in every file — the fastest
way is a project-wide find-and-replace:

```bash
# from the project root, macOS/Linux
grep -rl "naveen10000000" . | xargs sed -i '' -e 's/naveen10000000/your-actual-username/g'   # macOS
grep -rl "naveen10000000" . | xargs sed -i 's/naveen10000000/your-actual-username/g'          # Linux
```

On Windows (PowerShell):

```powershell
Get-ChildItem -Recurse -Include *.html,*.xml,*.txt,*.md | ForEach-Object {
  (Get-Content $_.FullName) -replace 'naveen10000000','your-actual-username' | Set-Content $_.FullName
}
```

Also update `contact.html`, where `YOUR-EMAIL@example.com` is still a
placeholder contact address — replace it with a real email or remove it.

If you're **not** deploying to `github.io/stampr/` (e.g. a custom domain, or
deploying at the root of `username.github.io`), update `BASE_URL` accordingly
in every canonical/OG tag, `sitemap.xml`, and `robots.txt` too.

## Deploying to GitHub Pages

1. **Create a repository** on GitHub (e.g. named `stampr`) and push this
   project's files to it (the contents of this folder go at the repo root):
   ```bash
   git init
   git add .
   git commit -m "Deploy Stampr"
   git branch -M main
   git remote add origin https://github.com/naveen10000000/stampr.git
   git push -u origin main
   ```
2. **Enable GitHub Pages**: on GitHub, go to your repo → **Settings** →
   **Pages** → under "Build and deployment", set **Source** to
   `Deploy from a branch`, choose the `main` branch and `/ (root)` folder,
   then **Save**.
3. **Wait a minute or two**, then visit
   `https://naveen10000000.github.io/stampr/` to confirm it's live.
4. **Add the site to Google Search Console**:
   - Go to https://search.google.com/search-console
   - Add a property using the URL prefix
     `https://naveen10000000.github.io/stampr/`
   - Verify ownership using the HTML tag or file method Search Console
     offers (add the meta tag to every page's `<head>`, or upload the
     verification file to the repo root and push).
5. **Submit `sitemap.xml`**:
   - In Search Console, open **Sitemaps** in the left sidebar
   - Enter `sitemap.xml` and click **Submit**

## Local preview

Since everything is static, you can just open `index.html` in a browser, or
serve the folder locally for cleaner relative-path behavior:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000/
```

## Notes on the tools

- **Compress PDF** rebuilds each page as a JPEG image, so it works best on
  scanned/photo-heavy PDFs — it won't shrink (and may occasionally grow)
  already-small, text-only PDFs, and the output loses selectable text.
- **PDF → Word / PDF → Excel** use text-position extraction, not true layout
  or table recognition — best for simple, text-based or clean-table PDFs.
- **HEIC conversion** depends on the visitor's browser having HEIC decode
  support available to JavaScript.

No tool sends files anywhere — everything listed above happens in-browser.
