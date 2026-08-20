/* MoneroMaps — interactive map of Monero-accepting businesses (Monerica Network).
   Non-Google: Leaflet + OpenStreetMap tiles. Data from data/businesses.json. */
(function () {
  "use strict";

  var map = L.map("mm-map", { scrollWheelZoom: true }).setView([20, 0], 2);

  // Tiles — no Google, no API key. Light = OpenStreetMap; dark = CARTO Dark Matter.
  var LIGHT_TILES = {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    opts: { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }
  };
  var DARK_TILES = {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    opts: {
      maxZoom: 20, subdomains: "abcd",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }
  };

  function isDark() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t === "dark") return true;
    if (t === "light") return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  var tileLayer = null;
  function applyTiles() {
    var t = isDark() ? DARK_TILES : LIGHT_TILES;
    if (tileLayer) map.removeLayer(tileLayer);
    tileLayer = L.tileLayer(t.url, t.opts).addTo(map);
  }
  applyTiles();
  window.addEventListener("mm-themechange", applyTiles);

  // Each point is marked with the actual Monero logo.
  var monericaIcon = L.icon({
    iconUrl: "img/monero-logo.png",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
    className: "mm-marker"
  });

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // 2-letter country code -> flag emoji (regional indicator symbols).
  function flagEmoji(cc) {
    if (!cc || cc.length !== 2) return "";
    return cc.toUpperCase().replace(/./g, function (c) {
      return String.fromCodePoint(127397 + c.charCodeAt(0));
    });
  }

  function popupHtml(b) {
    var site = b.website
      ? '<a href="' + esc(b.website) + '" target="_blank" rel="noopener">Website</a>' : "";
    var mon = b.monerica
      ? '<a href="' + esc(b.monerica) + '" target="_blank" rel="noopener">Monerica listing</a>' : "";
    var flag = flagEmoji(b.country);
    return '<div class="mm-pop">' +
      '<div class="mm-cat">' + esc(b.desc || "") + '</div>' +
      "<h3>" + esc(b.name) + "</h3>" +
      '<div class="mm-flag"><span class="mm-flag-emoji">' + flag + "</span> " + esc(b.address) + "</div>" +
      '<div class="mm-links">' + site + mon + "</div></div>";
  }

  fetch("data/businesses.json")
    .then(function (r) { return r.json(); })
    .then(function (list) {
      var markers = [];
      var bounds = [];
      var listEl = document.getElementById("mm-list");
      document.getElementById("mm-count").textContent = list.length;

      list.forEach(function (b, i) {
        var m = L.marker([b.lat, b.lon], { icon: monericaIcon, title: b.name })
          .bindPopup(popupHtml(b));
        m.addTo(map);
        markers.push(m);
        bounds.push([b.lat, b.lon]);

        var li = document.createElement("li");
        li.className = "mm-item";
        li.innerHTML =
          '<div class="mm-cat">' + esc(b.desc || "") + "</div>" +
          "<h3>" + '<span class="mm-flag-emoji">' + flagEmoji(b.country) + "</span> " + esc(b.name) + "</h3>" +
          '<div class="mm-addr">' + esc(b.address) + "</div>";
        li.addEventListener("click", function () {
          map.flyTo([b.lat, b.lon], 15, { duration: 0.8 });
          m.openPopup();
          document.querySelectorAll(".mm-item.is-active").forEach(function (el) {
            el.classList.remove("is-active");
          });
          li.classList.add("is-active");
          if (window.matchMedia("(max-width: 720px)").matches) {
            document.getElementById("mm-panel").classList.remove("is-open");
          }
        });
        listEl.appendChild(li);
      });

      if (bounds.length) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    })
    .catch(function (e) {
      document.getElementById("mm-count").textContent = "0";
      console.error("Failed to load businesses.json", e);
    });

  // Mobile panel toggle
  document.getElementById("mm-toggle").addEventListener("click", function () {
    document.getElementById("mm-panel").classList.toggle("is-open");
  });
})();
