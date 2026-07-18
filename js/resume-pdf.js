/* Builds the serious, single continuous-page CV as a real vector PDF (jsPDF) —
   no print dialog, no page breaks. Content mirrors the site's i18n strings,
   so it always matches whatever language is active. */
(function () {
  "use strict";

  var PAGE_WIDTH = 595.28; // A4 width, pt
  var MARGIN_X = 44;
  var MARGIN_TOP = 44;
  var MARGIN_BOTTOM = 36;
  var CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

  var TEXT = [18, 21, 28];
  var MUTED = [75, 81, 99];
  var ACCENT = [12, 139, 135];
  var BORDER = [195, 201, 212];

  function layout(doc, dict) {
    var t = function (key) { return dict[key] || ""; };
    var y = MARGIN_TOP;

    function setFont(style, size, color) {
      doc.setFont("helvetica", style || "normal");
      doc.setFontSize(size);
      doc.setTextColor.apply(doc, color || TEXT);
    }

    function paragraph(text, size, style, color, lineHeight) {
      setFont(style, size, color);
      lineHeight = lineHeight || size * 1.38;
      var wrapped = doc.splitTextToSize(text, CONTENT_WIDTH);
      wrapped.forEach(function (line) {
        doc.text(line, MARGIN_X, y);
        y += lineHeight;
      });
    }

    function inline(segments, size, lineHeight) {
      setFont("normal", size, MUTED);
      lineHeight = lineHeight || size * 1.4;
      var x = MARGIN_X;
      segments.forEach(function (seg) {
        setFont("normal", size, seg.link ? ACCENT : MUTED);
        if (seg.link) {
          doc.textWithLink(seg.text, x, y, { url: seg.link });
        } else {
          doc.text(seg.text, x, y);
        }
        x += doc.getTextWidth(seg.text);
      });
      y += lineHeight;
    }

    function sectionHeader(text) {
      y += 8;
      setFont("bold", 11.5, TEXT);
      doc.text(text.toUpperCase(), MARGIN_X, y);
      y += 5;
      doc.setDrawColor.apply(doc, BORDER);
      doc.setLineWidth(0.75);
      doc.line(MARGIN_X, y, MARGIN_X + CONTENT_WIDTH, y);
      y += 14;
    }

    function entry(title, meta, desc, highlightLabel, highlightText, stack) {
      setFont("bold", 10, TEXT);
      doc.text(title, MARGIN_X, y);
      y += 12;
      setFont("normal", 8.5, MUTED);
      doc.text(meta, MARGIN_X, y);
      y += 12;
      paragraph(desc, 9, "normal", MUTED, 12.5);
      y += 1;
      if (highlightLabel) {
        setFont("bold", 8.75, ACCENT);
        var labelText = highlightLabel + ":  ";
        doc.text(labelText, MARGIN_X, y);
        var labelW = doc.getTextWidth(labelText);
        setFont("normal", 8.75, MUTED);
        var wrapped = doc.splitTextToSize(highlightText, CONTENT_WIDTH - labelW);
        wrapped.forEach(function (line, i) {
          doc.text(line, MARGIN_X + (i === 0 ? labelW : 0), y);
          y += 12;
        });
      }
      if (stack) {
        y += 1;
        setFont("normal", 8.25, MUTED);
        doc.text(stack, MARGIN_X, y);
        y += 12;
      }
      y += 10;
    }

    /* ---- Header ---- */
    setFont("bold", 21, TEXT);
    doc.text(t("hero.name"), MARGIN_X, y);
    y += 22;
    setFont("bold", 11.5, ACCENT);
    doc.text(t("hero.role"), MARGIN_X, y);
    y += 15;
    paragraph(t("hero.subtitle"), 9, "normal", MUTED, 12);
    y += 3;
    inline(
      [
        { text: "rodrigolimadh@gmail.com", link: "mailto:rodrigolimadh@gmail.com" },
        { text: "   ·   " },
        { text: "linkedin.com/in/rodrigo-lima-flutter", link: "https://linkedin.com/in/rodrigo-lima-flutter" },
        { text: "   ·   Santarém, PA — remote-friendly" }
      ],
      8.5
    );

    /* ---- Experience ---- */
    sectionHeader(t("nav.experience"));
    paragraph(t("hero.desc"), 9.25, "normal", MUTED, 12.5);
    y += 8;

    entry(
      t("exp.citydata.role") + " — CityData.ai",
      "2021 — " + t("common.present"),
      t("exp.citydata.desc"),
      null,
      null,
      "Flutter, Firebase, " + t("chip.android_native") + ", OTA, YOLO, Codemagic"
    );
    entry(
      t("exp.darvin.role") + " — Darvin Labs",
      "2025 — " + t("common.present"),
      t("exp.darvin.desc"),
      null,
      null,
      "Flutter, Supabase, Riverpod, Drift/SQLite"
    );
    entry(
      t("exp.sim.role") + " — 7 Promotora",
      "2026 — " + t("common.present"),
      t("exp.sim.desc"),
      null,
      null,
      "Flutter, BLoC, WebSocket, Node.js, Fastify"
    );

    /* ---- Projects ---- */
    sectionHeader(t("nav.projects"));
    ["citysurvey", "citychat", "cityops", "sondar", "sim", "redacao"].forEach(function (p) {
      entry(
        t("proj." + p + ".name"),
        t("proj." + p + ".sub"),
        t("proj." + p + ".desc"),
        t("proj.highlight_label"),
        t("proj." + p + ".highlight"),
        null
      );
    });

    /* ---- Skills ---- */
    sectionHeader(t("resume.md.skills_label") || "Skills");
    var skillGroups = [
      ["skills.mobile.title", "Flutter, Dart, Clean Architecture, BLoC / Cubit, Riverpod, GetX, MobX, React Native"],
      ["skills.native.title", "Device Owner / Kiosk, Method Channels, Foreground Services, Isolates, OTA, Offline-first"],
      ["skills.backend.title", "Supabase, Firebase, PostgreSQL, MySQL, Node.js, TypeScript, Python / FastAPI, WebSockets"],
      ["skills.quality.title", t("chip.unit_tests") + ", " + t("chip.widget_tests") + ", CI/CD (Codemagic), Docker, OrbStack, Play Store, App Store"],
      ["skills.ai.title", "Claude Code, Context engineering, Spec-driven dev"],
      ["skills.vision.title", "YOLO, Dialogflow, " + t("chip.llm_chatbots")],
      ["skills.frontend.title", "React, Vue.js, Next.js"],
      ["skills.maps.title", "Google Maps, Mapbox, OpenStreetMap, Geofencing"]
    ];
    skillGroups.forEach(function (g) {
      setFont("bold", 9, TEXT);
      doc.text(t(g[0]), MARGIN_X, y);
      y += 11.5;
      paragraph(g[1], 8.5, "normal", MUTED, 11.5);
      y += 6;
    });

    /* ---- Education & Languages ---- */
    sectionHeader(t("edu.title"));
    setFont("bold", 9.25, TEXT);
    doc.text(t("edu.cs_label"), MARGIN_X, y);
    var csLabelW = doc.getTextWidth(t("edu.cs_label"));
    setFont("normal", 9.25, MUTED);
    doc.text(" — UFOPA · 2015–2020", MARGIN_X + csLabelW, y);
    y += 14;
    setFont("bold", 9.25, TEXT);
    doc.text(t("edu.si_label"), MARGIN_X, y);
    var siLabelW = doc.getTextWidth(t("edu.si_label"));
    setFont("normal", 9.25, MUTED);
    doc.text(" — PUC Minas · " + t("edu.si_period"), MARGIN_X + siLabelW, y);
    y += 20;

    sectionHeader(t("edu.lang_label"));
    paragraph(
      t("edu.lang.pt") + " (" + t("edu.lang.native") + ")   ·   " +
      t("edu.lang.en") + " (" + t("edu.lang.fluent") + ")   ·   " +
      t("edu.lang.es") + " (" + t("edu.lang.basic") + ")",
      9.25, "normal", MUTED, 13
    );

    /* ---- Footer ---- */
    y += 10;
    doc.setDrawColor.apply(doc, BORDER);
    doc.setLineWidth(0.75);
    doc.line(MARGIN_X, y, MARGIN_X + CONTENT_WIDTH, y);
    y += 14;
    paragraph(t("contact.desc"), 8.75, "italic", MUTED, 12);

    return y + MARGIN_BOTTOM;
  }

  function buildDoc(lang) {
    var jsPDF = window.jspdf.jsPDF;
    var dict = I18N[lang] || I18N["pt-BR"];

    var scratch = new jsPDF({ unit: "pt", format: [PAGE_WIDTH, 4000] });
    var totalHeight = layout(scratch, dict);

    var doc = new jsPDF({ unit: "pt", format: [PAGE_WIDTH, totalHeight] });
    doc.setProperties({ title: dict["resume.pdf.doctitle"] || "Rodrigo Lima — Resume" });
    layout(doc, dict);
    return doc;
  }

  window.ResumePDF = {
    download: function (lang) {
      var doc = buildDoc(lang);
      var langSuffix = (lang || "pt-BR").split("-")[0].toLowerCase();
      doc.save("rodrigo-lima-resume-" + langSuffix + ".pdf");
    }
  };
})();
