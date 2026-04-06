/**
 * VeritasZK Embeddable Solvency Badge
 *
 * Usage: Drop this script tag into any webpage.
 *
 *   <script data-commitment="aleo1..." src="https://veritaszk.vercel.app/badge.js" async defer></script>
 *
 * The script finds every <script data-commitment="..."> on the page,
 * fetches the solvency status from /api/verify/[commitment], and
 * injects an inline badge element immediately before the script tag.
 *
 * Badges link to /org/[commitment] on veritaszk.vercel.app.
 */
(function () {
  "use strict";

  var BASE = "https://veritaszk.vercel.app";

  /* ---------- colour tokens (match VeritasZK design system) ---------- */
  var COLORS = {
    green: "#10b981",
    greenBg: "rgba(16,185,129,0.10)",
    red: "#ef4444",
    redBg: "rgba(239,68,68,0.10)",
    amber: "#f59e0b",
    amberBg: "rgba(245,158,11,0.10)",
    gray: "#6b7280",
    grayBg: "rgba(107,114,128,0.10)",
    textPrimary: "#f9fafb",
    textSecondary: "#9ca3af",
  };

  /* ---------- pulse keyframes (injected once) ---------- */
  var injectedStyles = false;
  function injectStyles() {
    if (injectedStyles) return;
    injectedStyles = true;
    var style = document.createElement("style");
    style.textContent =
      "@keyframes vzk-pulse{0%,100%{opacity:1}50%{opacity:.4}}" +
      ".vzk-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:9999px;font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:600;text-decoration:none;cursor:pointer;transition:opacity .2s}" +
      ".vzk-badge:hover{opacity:.85}" +
      ".vzk-dot{display:inline-block;width:8px;height:8px;border-radius:50%;animation:vzk-pulse 2s ease-in-out infinite;flex-shrink:0}";
    document.head.appendChild(style);
  }

  /* ---------- build a badge DOM node ---------- */
  function createBadge(commitment, status) {
    var a = document.createElement("a");
    a.href = BASE + "/org/" + encodeURIComponent(commitment);
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = "vzk-badge";
    a.setAttribute("data-vzk-commitment", commitment);

    var dot = document.createElement("span");
    dot.className = "vzk-dot";

    var label = document.createElement("span");

    var solvent = status && status.is_solvent === true;
    var expired = status && status.expiry_block != null;

    /* determine color from API response */
    if (!status) {
      /* no data — loading state */
      dot.style.backgroundColor = COLORS.gray;
      dot.style.animation = "none";
      label.textContent = "VeritasZK — Loading\u2026";
      label.style.color = COLORS.gray;
      a.style.background = COLORS.grayBg;
      a.appendChild(dot);
      a.appendChild(label);
      return a;
    }

    /* check expiry */
    if (expired && status.expiry_block != null) {
      var now = Math.floor(Date.now() / 1000);
      var testnetStart = 1742774400;
      var currentBlock = Math.floor((now - testnetStart) / 25);
      var remaining = status.expiry_block - currentBlock;
      if (remaining <= 0) solvent = false;
    }

    if (solvent) {
      dot.style.backgroundColor = COLORS.green;
      label.textContent = "VeritasZK — Solvent";
      label.style.color = COLORS.green;
      a.style.background = COLORS.greenBg;
    } else {
      dot.style.backgroundColor = COLORS.red;
      label.textContent = "VeritasZK — Not Solvent";
      label.style.color = COLORS.red;
      a.style.background = COLORS.redBg;
    }

    a.appendChild(dot);
    a.appendChild(label);
    return a;
  }

  /* ---------- fetch solvency for one commitment ---------- */
  function fetchSolvency(commitment, callback) {
    var url = BASE + "/api/verify/" + encodeURIComponent(commitment);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          callback(null, JSON.parse(xhr.responseText));
        } catch (e) {
          callback(e, null);
        }
      } else {
        callback(new Error("HTTP " + xhr.status), null);
      }
    };
    xhr.onerror = function () {
      callback(new Error("Network error"), null);
    };
    xhr.send();
  }

  /* ---------- main bootstrap ---------- */
  function init() {
    injectStyles();

    var scripts = document.querySelectorAll("script[data-commitment]");
    for (var i = 0; i < scripts.length; i++) {
      (function (scriptEl) {
        var commitment = scriptEl.getAttribute("data-commitment");
        if (!commitment) return;

        /* Insert loading badge immediately */
        var badge = createBadge(commitment, null);
        scriptEl.parentNode.insertBefore(badge, scriptEl);

        /* Fetch real data and update */
        fetchSolvency(commitment, function (err, data) {
          if (err) {
            /* Replace with error badge */
            badge.parentNode.removeChild(badge);
            var errorBadge = createBadge(commitment, null);
            errorBadge.querySelector("span:last-child").textContent = "VeritasZK — Error";
            errorBadge.querySelector("span:last-child").style.color = COLORS.amber;
            errorBadge.style.background = COLORS.amberBg;
            var dot = errorBadge.querySelector(".vzk-dot");
            dot.style.backgroundColor = COLORS.amber;
            scriptEl.parentNode.insertBefore(errorBadge, scriptEl);
          } else {
            /* Update existing badge in place */
            var parent = badge.parentNode;
            parent.removeChild(badge);
            var updated = createBadge(commitment, data);
            parent.insertBefore(updated, scriptEl);
          }
        });
      })(scripts[i]);
    }
  }

  /* Run when DOM is ready */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
