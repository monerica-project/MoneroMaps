#!/usr/bin/env python3
"""Geocode Monerica IRL businesses via OpenStreetMap Nominatim -> data/businesses.json.
Nominatim policy: <=1 req/sec, descriptive User-Agent. Re-run to refresh.

Each entry: (slug, name, display_address, geocode_query, website, country, desc)
  - display_address is what the popup shows (the Monerica Location text).
  - geocode_query is what we send to Nominatim; "" means reuse display_address.
    (Rural/grid-style addresses often need a simpler city+ZIP query.)
  - website "" -> the popup shows only the Monerica listing link.
"""
import json, time, urllib.parse, urllib.request, os, sys

BIZ = [
    ("booch-brew-co", "Booch Brew Co.", "Jaco & Uvita, Pacific Coast, Costa Rica",
     "Jaco, Puntarenas, Costa Rica", "https://www.instagram.com/boochbrewco/", "CR", "Kombucha brewery"),
    ("callie-s-kitchen", "Callie's Kitchen", "100 Houston Street, Tomball, TX 77375",
     "100 Houston Street, Tomball, TX 77375, USA", "https://callieskitchen.com", "US", "Bakery & cafe"),
    ("flatlands-coffee", "Flatlands Coffee", "138 N Main, Bowling Green, OH",
     "138 N Main St, Bowling Green, OH 43402, USA", "https://www.flatlandscoffee.com", "US", "Coffee shop"),
    ("mile-high-roasting-company", "Mile High Roasting Company", "1809 N 3000 West, Roosevelt, Utah 84066",
     "Roosevelt, Utah 84066, USA", "https://www.milehighroasting.com", "US", "Coffee roaster"),
    ("running-water-farm", "Running Water Farm", "13300 Running Water Road, West Palm Beach, FL 33418",
     "West Palm Beach, FL 33418, USA", "https://runningwaterfarm.com/", "US", "Farm"),
    ("sababa-chiang-mai", "Sababa Chiang Mai", "19 Kotchasarn Rd Lane 5, Chiang Mai 50100",
     "19 Kotchasarn Rd, Chiang Mai 50100, Thailand", "https://www.sababacm.com", "TH", "Restaurant"),
    ("satori-sandwich-bar", "Satori Sandwich Bar", "457A Danforth Ave, Toronto, ON M4K 1P1",
     "457A Danforth Ave, Toronto, ON M4K 1P1, Canada", "https://www.satorisandwichbar.com/", "CA", "Sandwich bar"),
    ("super-66", "Super 66", "Av. 66 3250, La Plata, Buenos Aires, Argentina",
     "Avenida 66 3250, La Plata, Buenos Aires, Argentina", "", "AR", "Supermarket"),
    ("travessa-restaurant", "travessa.restaurant", "Rua Marques de Paranagua, 30, Ilheus, Brazil",
     "Rua Marques de Paranagua, 30, Ilheus, Bahia, Brazil", "https://instagram.com/travessarest", "BR", "Restaurant"),
    ("ward-s-ace-and-country-store", "Ward's ACE & Country Store", "65 North 300 East, Malad City, Idaho 83252",
     "65 North 300 East, Malad City, ID 83252, USA", "https://www.wardsace.com", "US", "Hardware & country store"),
    ("car-battery-lb", "Car Battery LB", "Zahle, Lebanon",
     "Zahle, Lebanon", "", "LB", "Car batteries & accessories (since 1983)"),
]

def geocode(addr):
    q = urllib.parse.urlencode({"q": addr, "format": "json", "limit": 1})
    req = urllib.request.Request("https://nominatim.openstreetmap.org/search?" + q,
        headers={"User-Agent": "MoneroMaps/1.0 (Monerica Network map of Monero-accepting businesses)"})
    with urllib.request.urlopen(req, timeout=20) as r:
        data = json.loads(r.read().decode())
    return (float(data[0]["lat"]), float(data[0]["lon"])) if data else None

out, misses = [], []
for slug, name, disp, gq, site, cc, desc in BIZ:
    query = gq or disp
    try:
        res = geocode(query)
    except Exception as e:
        res = None
        print(f"  ! {name}: {e}", file=sys.stderr)
    if res:
        print(f"  OK {name}: {res[0]:.5f},{res[1]:.5f}")
        out.append({"slug": slug, "name": name, "address": disp, "website": site,
                    "country": cc, "desc": desc, "lat": res[0], "lon": res[1],
                    "monerica": f"https://monerica.com/site/{slug}"})
    else:
        print(f"  MISS {name} ({query})")
        misses.append(name)
    time.sleep(1.2)  # Nominatim rate limit

out.sort(key=lambda b: b["name"].lower())
dest = os.path.join(os.path.dirname(__file__), "..", "data", "businesses.json")
with open(dest, "w") as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
print(f"\nWrote {len(out)}/{len(BIZ)} businesses to data/businesses.json")
if misses:
    print("Missed (add a simpler geocode_query):", ", ".join(misses))
