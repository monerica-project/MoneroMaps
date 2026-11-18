#!/usr/bin/env python3
"""Builds the crawlable pages from data/businesses.json: places.html (every place, grouped by
country, as plain HTML), sitemap.xml and robots.txt. Run from the repo root after editing the
data file:  python3 tools/build_pages.py   (no dependencies; then deploy the three files)."""
import datetime, html, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGIN = "https://moneromaps.com"
COUNTRIES = {"US": "United States", "CA": "Canada", "CR": "Costa Rica", "LB": "Lebanon", "TH": "Thailand", "AR": "Argentina",
             "BR": "Brazil", "MX": "Mexico", "GB": "United Kingdom", "DE": "Germany", "FR": "France", "ES": "Spain", "IT": "Italy",
             "NL": "Netherlands", "CH": "Switzerland", "AT": "Austria", "PT": "Portugal", "CZ": "Czechia", "PL": "Poland",
             "AU": "Australia", "NZ": "New Zealand", "JP": "Japan", "IN": "India", "ZA": "South Africa", "SV": "El Salvador"}

places = json.load(open(os.path.join(ROOT, "data", "businesses.json"), encoding="utf-8"))
by_country = {}
for p in places:
    by_country.setdefault(p.get("country") or "", []).append(p)
order = sorted(by_country, key=lambda c: (-len(by_country[c]), COUNTRIES.get(c, c)))
e = html.escape

sections = []
for code in order:
    name = COUNTRIES.get(code, code or "Other")
    rows = []
    for p in sorted(by_country[code], key=lambda p: p["name"].lower()):
        links = []
        if p.get("monerica"):
            links.append(f'<a href="{e(p["monerica"])}">Monerica listing</a>')
        if p.get("website"):
            links.append(f'<a href="{e(p["website"])}" rel="nofollow noopener">Website</a>')
        rows.append(f'      <li><strong>{e(p["name"])}</strong> &ndash; {e(p.get("desc") or "")}<br />'
                    f'<span class="mm-place-addr">{e(p.get("address") or "")}</span><br />{" &middot; ".join(links)}</li>')
    n = len(by_country[code])
    sections.append(f'    <h3 id="{e(code.lower())}">{e(name)} <span class="mm-place-count">({n} {"place" if n == 1 else "places"})</span></h3>\n'
                    f'    <ul class="mm-place-list">\n' + "\n".join(rows) + "\n    </ul>")

jump = " &middot; ".join(f'<a href="#{e(c.lower())}">{e(COUNTRIES.get(c, c))}</a>' for c in order)
page = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script>(function(){{try{{var t=localStorage.getItem("mm-theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t);}}catch(e){{}}}})();</script>
  <title>Places That Accept Monero, by Country — MoneroMaps</title>
  <meta name="description" content="A list of {len(places)} real-world businesses that accept Monero (XMR) in {len(order)} countries, with addresses and links. The same places shown on the MoneroMaps map." />
  <link rel="canonical" href="{ORIGIN}/places.html" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" sizes="32x32" href="/img/favicon-32.png" />
  <link rel="apple-touch-icon" href="/img/apple-touch-icon.png" />
  <link rel="stylesheet" href="css/style.css" />
  <style>
    .mm-place-list {{ list-style: none; padding: 0; margin: 0 0 1.5rem; }}
    .mm-place-list li {{ padding: .8rem 0; border-bottom: 1px solid var(--line); line-height: 1.6; }}
    .mm-place-addr, .mm-place-count {{ color: var(--muted); font-weight: normal; }}
    .mm-place-jump {{ line-height: 1.9; }}
  </style>
</head>
<body>
  <header class="mm-header">
    <a class="mm-brand mm-brand-link" href="/">
      <img class="mm-logo" src="img/monero-logo.png" alt="Monero" width="40" height="40" />
      <div>
        <h1>MoneroMaps</h1>
        <p class="mm-tag">Part of the <a href="/network.html">Monerica Network</a></p>
      </div>
    </a>
    <div class="mm-header-actions">
      <button id="mm-theme-toggle" class="mm-theme-btn" type="button" aria-label="Toggle dark mode">🌙</button>
      <a class="mm-back" href="/">← Map</a>
    </div>
  </header>

  <main class="mm-page">
    <h2 class="mm-page-title">Places that accept Monero, by country</h2>
    <p>These are the {len(places)} real-world businesses on the <a href="/">MoneroMaps map</a>, where you can pay with Monero (XMR) in person. Each one has a listing on <a href="https://monerica.com/">Monerica</a>. Know a place that should be here? Submit it to Monerica.</p>
    <p class="mm-place-jump">{jump}</p>
{chr(10).join(sections)}
  </main>
  <script src="js/theme.js"></script>
</body>
</html>
"""
open(os.path.join(ROOT, "places.html"), "w", encoding="utf-8").write(page)

today = datetime.date.today().isoformat()
urls = [("/", "1.0"), ("/places.html", "0.9"), ("/network.html", "0.4"), ("/sponsors.html", "0.4")]
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(
    f"  <url><loc>{ORIGIN}{u}</loc><lastmod>{today}</lastmod><priority>{pr}</priority></url>\n" for u, pr in urls) + "</urlset>\n"
open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write(sm)
open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf-8").write(f"User-agent: *\nAllow: /\n\nSitemap: {ORIGIN}/sitemap.xml\n")
print(f"places.html: {len(places)} places in {len(order)} countries; sitemap.xml: {len(urls)} urls; robots.txt")
