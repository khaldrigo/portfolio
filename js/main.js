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
  });

  applyLang(currentLang);

  /* ---------- Scroll reveal ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
