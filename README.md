# MoneroMaps

An interactive map of **real-world businesses that accept Monero (XMR)** — part of the
**Monerica Network**. Non-Google mapping: [Leaflet](https://leafletjs.com/) +
[OpenStreetMap](https://www.openstreetmap.org/) tiles (no API key).

This is a **local preview** to decide whether to buy a domain and launch it. It's a
plain static site — no build step, deployable to any static host (Bunny, GitHub Pages,
nginx, etc.).

## Run it locally

```bash
./serve.sh            # http://localhost:8477
./serve.sh 9000       # or pick a port
```

Then open the printed URL. Zoom/pan the map, click a pin or a place in the left list to
fly to it. (The map tiles load from OpenStreetMap, so you need internet; the Leaflet
library itself is vendored under `vendor/leaflet/`.)

## Data

`data/businesses.json` holds the mapped places (name, address, coordinates, website, and
a link back to the Monerica listing). It currently contains the Monero-accepting
**IRL businesses** pulled from Monerica's
[food-and-drink](https://monerica.com/businesses/food-and-drink-irl) listings plus
[Ward's ACE & Country Store](https://monerica.com/site/ward-s-ace-and-country-store).

### Refreshing / adding places

Addresses are geocoded to coordinates with OpenStreetMap **Nominatim**:

```bash
python3 tools/geocode.py      # rewrites data/businesses.json
```

Edit the `BIZ` list in `tools/geocode.py` to add businesses (slug, name, address,
website, country, short description). Nominatim is rate-limited (~1 request/second) and
the script respects that. Rural/grid-style addresses sometimes need a simpler fallback
query (city + ZIP).

## Structure

```
index.html            # page shell
css/style.css         # Monerica-orange styling
js/app.js             # Leaflet map + markers + list
data/businesses.json  # the mapped places
vendor/leaflet/       # Leaflet 1.9.4 (vendored, offline-capable)
tools/geocode.py      # address -> coordinates (Nominatim)
serve.sh              # local static server
```

## Notes for going live

- The whole thing is static, so hosting is cheap/free.
- Coordinates are cached in `businesses.json` — the live site never calls a geocoder,
  it just reads the JSON, so it's fast and has no per-load API dependency.
- Attribution to OpenStreetMap is required and is shown on the map (keep it).

## License

MIT — see the [`LICENSE`](LICENSE) file.
