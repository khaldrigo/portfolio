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
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (dict[key]) el.setAttribute("aria-label", dict[key]);
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
  var resumeModal = document.getElementById("resume-modal");
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
    var focusTarget = m.querySelector(".modal-yes, .resume-choice");
    if (focusTarget) focusTarget.focus();
  }

  function closeModals() {
    modal1.setAttribute("hidden", "");
    modal2.setAttribute("hidden", "");
    resumeModal.setAttribute("hidden", "");
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
  });

  [modal1, modal2, resumeModal].forEach(function (m) {
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

  /* ---------- Resume download ---------- */
  var resumeBtn = document.getElementById("resume-download");
  var resumePdfBtn = document.getElementById("resume-download-pdf");
  var resumeMdBtn = document.getElementById("resume-download-md");

  function downloadResumePdf() {
    ResumePDF.download(currentLang);
  }

  function buildResumeMarkdown() {
    var dict = I18N[currentLang] || I18N["pt-BR"];
    var t = function (key) { return dict[key] || ""; };
    var lines = [];

    lines.push("<!-- " + t("resume.md.note") + " -->");
    lines.push("");
    lines.push("# " + t("hero.name"));
    lines.push("**" + t("hero.role") + "**");
    lines.push("");
    lines.push(t("hero.subtitle"));
    lines.push("");
    lines.push("rodrigolimadh@gmail.com · https://linkedin.com/in/rodrigo-lima-flutter · Santarém, PA (remote-friendly)");
    lines.push("");

    lines.push("## " + t("resume.md.summary_label"));
    lines.push(t("hero.desc"));
    lines.push("");

    lines.push("## " + t("resume.md.experience_label"));
    var experiences = [
      { role: "exp.citydata.role", org: "CityData.ai", period: "2021 — " + t("common.present"), desc: "exp.citydata.desc", stack: "Flutter, Firebase, " + t("chip.android_native") + ", OTA, YOLO, Codemagic" },
      { role: "exp.darvin.role", org: "Darvin Labs", period: "2025 — " + t("common.present"), desc: "exp.darvin.desc", stack: "Flutter, Supabase, Riverpod, Drift/SQLite" },
      { role: "exp.sim.role", org: "7 Promotora", period: "2026 — " + t("common.present"), desc: "exp.sim.desc", stack: "Flutter, BLoC, WebSocket, Node.js, Fastify" }
    ];
    experiences.forEach(function (e) {
      lines.push("### " + t(e.role) + " — " + e.org + " (" + e.period + ")");
      lines.push(t(e.desc));
      lines.push("*" + t("resume.md.stack_label") + ":* " + e.stack);
      lines.push("");
    });

    lines.push("## " + t("resume.md.projects_label"));
    var projects = ["citysurvey", "citychat", "cityops", "sondar", "sim", "redacao"];
    projects.forEach(function (p) {
      lines.push("### " + t("proj." + p + ".name") + " — " + t("proj." + p + ".sub"));
      lines.push(t("proj." + p + ".desc"));
      lines.push("*" + t("resume.md.highlight_label") + ":* " + t("proj." + p + ".highlight"));
      lines.push("");
    });

    lines.push("## " + t("resume.md.skills_label"));
    var skillGroups = [
      { title: "skills.mobile.title", items: "Flutter, Dart, Clean Architecture, BLoC / Cubit, Riverpod, GetX, MobX, React Native" },
      { title: "skills.native.title", items: "Device Owner / Kiosk, Method Channels, Foreground Services, Isolates, OTA, Offline-first" },
      { title: "skills.backend.title", items: "Supabase, Firebase, PostgreSQL, MySQL, Node.js, TypeScript, Python / FastAPI, WebSockets" },
      { title: "skills.quality.title", items: t("chip.unit_tests") + ", " + t("chip.widget_tests") + ", CI/CD (Codemagic), Docker, OrbStack, Play Store, App Store" },
      { title: "skills.ai.title", items: "Claude Code, Context engineering, Spec-driven dev" },
      { title: "skills.vision.title", items: "YOLO, Dialogflow, " + t("chip.llm_chatbots") },
      { title: "skills.frontend.title", items: "React, Vue.js, Next.js" },
      { title: "skills.maps.title", items: "Google Maps, Mapbox, OpenStreetMap, Geofencing" }
    ];
    skillGroups.forEach(function (g) {
      lines.push("- **" + t(g.title) + ":** " + g.items);
    });
    lines.push("");

    lines.push("## " + t("resume.md.education_label"));
    lines.push("- **" + t("edu.cs_label") + "** — UFOPA · 2015–2020");
    lines.push("- **" + t("edu.si_label") + "** — PUC Minas · " + t("edu.si_period"));
    lines.push("");

    lines.push("## " + t("resume.md.languages_label"));
    lines.push(t("edu.lang.pt") + " (" + t("edu.lang.native") + ") · " + t("edu.lang.en") + " (" + t("edu.lang.fluent") + ") · " + t("edu.lang.es") + " (" + t("edu.lang.basic") + ")");
    lines.push("");

    lines.push("## " + t("resume.md.contact_label"));
    lines.push(t("contact.desc"));

    return lines.join("\n");
  }

  function downloadResumeMd() {
    var md = buildResumeMarkdown();
    var blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "rodrigo-lima-resume-" + currentLang.split("-")[0].toLowerCase() + ".md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  resumeBtn.addEventListener("click", function () {
    if (root.classList.contains("dev-mode")) {
      openModal(resumeModal);
    } else {
      downloadResumePdf();
    }
  });

  resumePdfBtn.addEventListener("click", function () {
    closeModals();
    downloadResumePdf();
  });

  resumeMdBtn.addEventListener("click", function () {
    closeModals();
    downloadResumeMd();
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
