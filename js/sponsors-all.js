/* MoneroMaps — full sponsors listing (/sponsors.html). Loads every active sponsor
   from the Monerica Network feed and renders them as a grid, highest tier first. */
(function () {
  "use strict";

  var FEED = "https://app.monerica.com/sponsoredlisting/activesponsorjson";
  var typeOrder = { MainSponsor: 0, CategorySponsor: 1, SubcategorySponsor: 2 };
  var typeLabel = { MainSponsor: "Main sponsor", CategorySponsor: "Category sponsor", SubcategorySponsor: "Subcategory sponsor" };

  var grid = document.getElementById("mm-all-sponsors");
  var status = document.getElementById("mm-sp-status");
  if (!grid) return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
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
      '<span class="mm-sp-desc">' + esc(s.description || "") + "</span>" +
      stars(s.reviewRating, s.reviewCount) + "</a>";
  }

  fetch(FEED)
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (data) {
      if (!Array.isArray(data) || !data.length) {
        if (status) status.textContent = "No sponsors right now — check back soon.";
        return;
      }
      data.sort(function (a, b) {
        var d = (typeOrder[a.sponsorshipType] != null ? typeOrder[a.sponsorshipType] : 9) -
                (typeOrder[b.sponsorshipType] != null ? typeOrder[b.sponsorshipType] : 9);
        return d !== 0 ? d : new Date(b.expirationDate) - new Date(a.expirationDate);
      });
      grid.innerHTML = data.map(card).join("");
    })
    .catch(function () {
      if (status) status.textContent = "Couldn't load sponsors right now — please try again later.";
    });
})();
