(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- Theme ---------- */
  var themeBtn = document.getElementById("theme-toggle");
  var storedTheme = localStorage.getItem("theme");
  if (storedTheme) root.setAttribute("data-theme", storedTheme);

  themeBtn.addEventListener("click", function () {
    var current = root.getAttribute("data-theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark = current ? current === "dark" : prefersDark;
    var next = isDark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* ---------- Language ---------- */
  var langBtn = document.getElementById("lang-toggle");
  var storedLang = localStorage.getItem("lang");
  var browserLang = navigator.language && navigator.language.toLowerCase().indexOf("pt") === 0 ? "pt-BR" : "en";
  var currentLang = storedLang || browserLang;

  function applyLang(lang) {
    var dict = I18N[lang] || I18N["pt-BR"];
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });
    root.setAttribute("lang", lang);
    currentLang = lang;
    localStorage.setItem("lang", lang);
  }

  langBtn.addEventListener("click", function () {
    applyLang(currentLang === "pt-BR" ? "en" : "pt-BR");
    langBtn.blur();
  });

  applyLang(currentLang);

  /* ---------- Phone frame (dev mode) ---------- */
  var phoneFrame = document.getElementById("phone-frame");
  var frameButtons = document.querySelectorAll(".frame-btn");
  var storedFrame = localStorage.getItem("devFrame") || "iphone";

  if (phoneFrame) phoneFrame.setAttribute("data-frame", storedFrame);
  frameButtons.forEach(function (btn) {
    btn.classList.toggle("active", btn.dataset.frameBtn === storedFrame);
    btn.addEventListener("click", function () {
      var frame = btn.dataset.frameBtn;
      phoneFrame.setAttribute("data-frame", frame);
      localStorage.setItem("devFrame", frame);
      frameButtons.forEach(function (b) { b.classList.toggle("active", b === btn); });
    });
  });

  /* ---------- Developer mode ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var devBtn = document.getElementById("devmode-toggle");
  var modal1 = document.getElementById("dev-modal-1");
  var modal2 = document.getElementById("dev-modal-2");
  var overlay = document.getElementById("dev-overlay");
  var terminal = overlay.querySelector(".dev-terminal");

  var BOOT_LINES = [
    ["term-cmd", "flutter run -d portfolio"],
    ["", "Launching lib/main.dart on Portfolio in release mode..."],
    ["", "Compiling resume to native experience..."],
    ["term-ok", "✓ Built rodrigo_lima 5.0.0+2026"],
    ["", "Syncing files to device Portfolio... done."]
  ];

  var CLEAN_LINES = [
    ["term-cmd", "flutter clean"],
    ["", "Deleting build/ and .dart_tool/... done."],
    ["term-ok", "✓ Human-readable resume restored."]
  ];

  var themeBeforeDev = null;

  function setDevMode(on) {
    root.classList.toggle("dev-mode", on);
    devBtn.setAttribute("aria-pressed", on ? "true" : "false");
    localStorage.setItem("devMode", on ? "1" : "0");

    if (on) {
      themeBeforeDev = root.getAttribute("data-theme") || localStorage.getItem("theme");
      root.setAttribute("data-theme", "dark");
    } else {
      if (themeBeforeDev) {
        root.setAttribute("data-theme", themeBeforeDev);
      } else {
        var stored = localStorage.getItem("theme");
        if (stored) root.setAttribute("data-theme", stored);
        else root.removeAttribute("data-theme");
      }
      themeBeforeDev = null;
    }
  }

  if (localStorage.getItem("devMode") === "1") setDevMode(true);

  function openModal(m) {
    m.removeAttribute("hidden");
    var yes = m.querySelector(".modal-yes");
    if (yes) yes.focus();
  }

  function closeModals() {
    modal1.setAttribute("hidden", "");
    modal2.setAttribute("hidden", "");
  }

  function runTerminal(lines, done) {
    if (reduceMotion) { done(); return; }
    terminal.innerHTML = "";
    overlay.removeAttribute("hidden");
    lines.forEach(function (line) {
      var el = document.createElement("div");
      el.className = "term-line mono" + (line[0] ? " " + line[0] : "");
      el.textContent = line[1];
      terminal.appendChild(el);
    });
    var els = terminal.children;
    var i = 0;
    (function next() {
      if (i < els.length) {
        els[i++].classList.add("shown");
        setTimeout(next, 190);
      } else {
        setTimeout(function () {
          done();
          window.scrollTo(0, 0);
          overlay.classList.add("closing");
          setTimeout(function () {
            overlay.setAttribute("hidden", "");
            overlay.classList.remove("closing");
          }, 320);
        }, 480);
      }
    })();
  }

  devBtn.addEventListener("click", function () {
    if (root.classList.contains("dev-mode")) {
      runTerminal(CLEAN_LINES, function () { setDevMode(false); });
    } else {
      openModal(modal1);
    }
  });

  [modal1, modal2].forEach(function (m) {
    m.querySelector(".modal-no").addEventListener("click", closeModals);
    m.addEventListener("click", function (e) {
      if (e.target === m) closeModals();
    });
  });

  modal1.querySelector(".modal-yes").addEventListener("click", function () {
    modal1.setAttribute("hidden", "");
    openModal(modal2);
  });

  modal2.querySelector(".modal-yes").addEventListener("click", function () {
    closeModals();
    runTerminal(BOOT_LINES, function () { setDevMode(true); });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModals();
  });

  /* ---------- Scroll reveal ---------- */

  if (reduceMotion || !("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    document.querySelectorAll(".reveal").forEach(function (el) {
      observer.observe(el);
    });
  }
})();
