/* MoneroMaps dark mode. The <head> inline snippet sets data-theme before paint
   (no flash); this wires the toggle button and remembers the choice. Fires a
   `mm-themechange` event so the map can swap to dark/light tiles. */
(function () {
  "use strict";

  var root = document.documentElement;

  // Effective theme = explicit choice if set, else the OS preference.
  function effective() {
    var t = root.getAttribute("data-theme");
    if (t === "dark" || t === "light") return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("mm-theme", theme); } catch (e) { /* private mode */ }
    updateButton(theme);
    window.dispatchEvent(new CustomEvent("mm-themechange", { detail: theme }));
  }

  var btn = document.getElementById("mm-theme-toggle");
  function updateButton(theme) {
    if (!btn) return;
    btn.textContent = theme === "dark" ? "☀️" : "🌙";
    btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    btn.setAttribute("title", theme === "dark" ? "Light mode" : "Dark mode");
  }

  if (btn) {
    updateButton(effective());
    btn.addEventListener("click", function () {
      apply(effective() === "dark" ? "light" : "dark");
    });
  }

  // Follow the OS if the user hasn't made an explicit choice.
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
      var stored;
      try { stored = localStorage.getItem("mm-theme"); } catch (e) { stored = null; }
      if (stored !== "dark" && stored !== "light") {
        updateButton(effective());
        window.dispatchEvent(new CustomEvent("mm-themechange", { detail: effective() }));
      }
    });
  }
})();
