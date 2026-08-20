/* MoneroMaps sponsors — live from the Monerica Network sponsor feed, like the other
   Monerica sites. The feed sends CORS `*`, so a static site can read it directly.
   Shows one sponsor at a time, rotating; higher tiers (Main > Category > Subcategory)
   come first. */
(function () {
  "use strict";

  var FEED = "https://app.monerica.com/sponsoredlisting/activesponsorjson";
  var ROTATE_MS = 8000;
  var typeOrder = { MainSponsor: 0, CategorySponsor: 1, SubcategorySponsor: 2 };
  var typeLabel = { MainSponsor: "Main sponsor", CategorySponsor: "Category sponsor", SubcategorySponsor: "Subcategory sponsor" };

  var section = document.getElementById("mm-sponsors");
  var track = document.getElementById("mm-sponsor-track");
  if (!section || !track) return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function truncate(t, n) {
    if (!t || t.length <= n) return t || "";
    var cut = t.substring(0, n), sp = cut.lastIndexOf(" ");
    return (sp > 0 ? cut.substring(0, sp) : cut) + "…";
  }

  function stars(rating, count) {
    if (!rating || rating <= 0) return "";
    return '<span class="mm-sp-rating">★ ' + rating.toFixed(1) +
      (count ? ' <span class="mm-sp-count">(' + count + ")</span>" : "") + "</span>";
  }

  function card(s) {
    return '<a class="mm-sponsor-card" href="' + esc(s.link) + '" target="_blank" rel="noopener sponsored">' +
      '<span class="mm-sp-badge">' + esc(typeLabel[s.sponsorshipType] || "Sponsor") + "</span>" +
      '<span class="mm-sp-name">' + esc(s.name) + "</span>" +
      '<span class="mm-sp-desc">' + esc(truncate(s.description, 110)) + "</span>" +
      stars(s.reviewRating, s.reviewCount) + "</a>";
  }

  var sponsors = [], i = 0, timer = null;

  function render() {
    if (!sponsors.length) return;
    track.style.opacity = "0";
    setTimeout(function () {
      track.innerHTML = card(sponsors[i]);
      track.style.opacity = "1";
      i = (i + 1) % sponsors.length;
    }, 180);
  }

  fetch(FEED)
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (data) {
      if (!Array.isArray(data) || !data.length) return; // stays hidden
      sponsors = data.sort(function (a, b) {
        var d = (typeOrder[a.sponsorshipType] != null ? typeOrder[a.sponsorshipType] : 9) -
                (typeOrder[b.sponsorshipType] != null ? typeOrder[b.sponsorshipType] : 9);
        return d !== 0 ? d : new Date(b.expirationDate) - new Date(a.expirationDate);
      });
      section.hidden = false;
      render();
      timer = setInterval(render, ROTATE_MS);
    })
    .catch(function () { /* leave the section hidden on any failure */ });
})();
