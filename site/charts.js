/* Grafer, fylkesvalg og kart for investor-siden.
   Alle tall leses fra window.DATA (site/data.js, generert fra data/*.csv).
   Egne SVG-grafer: full kontroll over annotasjoner, stiplet framskriving og mål-bånd. */
(function () {
  "use strict";

  var D = window.DATA;
  var NS = "http://www.w3.org/2000/svg";
  var root = getComputedStyle(document.documentElement);
  function tok(n) { return root.getPropertyValue(n).trim(); }
  var C = {
    navy: tok("--req-chart-1"),
    blue: tok("--req-chart-2"),
    teal: tok("--req-chart-3"),
    grey: tok("--req-chart-4"),
    mist: tok("--req-mist"),
    hair: tok("--req-hairline"),
    ink: tok("--req-ink"),
    white: tok("--req-white")
  };

  /* ---------- formatering ---------- */

  var nf0 = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 0 });
  var nf1 = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  var nf2 = new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function n0(v) { return nf0.format(v); }
  function n1(v) { return nf1.format(v); }
  function n2(v) { return nf2.format(v); }
  function pct0(v) { return (v >= 0 ? "+" : "") + nf0.format(v) + " %"; }

  /* ---------- SVG-hjelpere ---------- */

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function text(parent, x, y, str, cls, anchor, extra) {
    var t = el("text", Object.assign({ x: x, y: y, class: cls || "anno", "text-anchor": anchor || "start" }, extra || {}), parent);
    t.textContent = str;
    return t;
  }
  function lin(d0, d1, r0, r1) {
    var f = function (v) { return r0 + (v - d0) / (d1 - d0) * (r1 - r0); };
    f.inv = function (p) { return d0 + (p - r0) / (r1 - r0) * (d1 - d0); };
    return f;
  }
  function pathD(pts) {
    return pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1); }).join("");
  }
  function yAxis(svg, y, ticks, x0, x1, fmt) {
    var g = el("g", { class: "axis" }, svg);
    ticks.forEach(function (t, i) {
      el("line", { x1: x0, x2: x1, y1: y(t), y2: y(t), class: i === 0 ? "base" : "grid" }, g);
      text(g, x0 - 8, y(t) + 4, fmt(t), "", "end");
    });
    return g;
  }
  function xAxis(svg, x, ticks, yb, fmt) {
    var g = el("g", { class: "axis" }, svg);
    ticks.forEach(function (t) { text(g, x(t), yb + 18, fmt ? fmt(t) : String(t), "", "middle"); });
    return g;
  }

  /* Tegn på nytt når bredden endres. */
  function responsive(plot, draw) {
    var last = 0;
    function run() {
      var w = Math.round(plot.clientWidth);
      if (!w || w === last) return;
      last = w;
      draw(w);
    }
    var redraw = function () { last = 0; run(); };
    if (window.ResizeObserver) new ResizeObserver(run).observe(plot);
    else window.addEventListener("resize", run);
    run();
    return redraw;
  }

  function newSvg(plot, w, h, label) {
    plot.querySelectorAll("svg").forEach(function (s) { s.remove(); });
    var svg = el("svg", { viewBox: "0 0 " + w + " " + h, width: w, height: h, role: "img", "aria-label": label });
    plot.insertBefore(svg, plot.firstChild);
    return svg;
  }

  /* ---------- tooltip ---------- */

  function tip(plot) {
    var t = plot.querySelector(".tip");
    if (!t) { t = document.createElement("div"); t.className = "tip"; plot.appendChild(t); }
    return {
      show: function (html, x, y) {
        t.innerHTML = html;
        t.classList.add("on");
        var pw = plot.clientWidth, tw = t.offsetWidth, th = t.offsetHeight;
        var left = x + 16;
        if (left + tw > pw) left = x - tw - 16;
        if (left < 0) left = Math.max(0, Math.min(pw - tw, x - tw / 2));
        var top = Math.max(0, y - th / 2);
        t.style.left = left + "px";
        t.style.top = top + "px";
      },
      hide: function () { t.classList.remove("on"); }
    };
  }
  function row(label, value) { return '<div class="t-row"><span>' + label + "</span><b>" + value + "</b></div>"; }
  function srcLine(s) { return '<div class="t-src">' + s + "</div>"; }

  /* Hover og tastatur for linjegrafer: nærmeste år, loddrett hårlinje. */
  function hoverX(svg, plot, xs, x, top, bottom, left, right, render) {
    var layer = el("g", { class: "hover", "pointer-events": "none" }, svg);
    var hit = el("rect", { x: left, y: top, width: right - left, height: bottom - top, fill: "transparent" }, svg);
    var t = tip(plot);
    var idx = -1;
    function at(i) {
      idx = i;
      while (layer.firstChild) layer.removeChild(layer.firstChild);
      if (i < 0) { t.hide(); return; }
      var px = x(xs[i]);
      el("line", { x1: px, x2: px, y1: top, y2: bottom, stroke: C.grey, "stroke-width": 1, opacity: 0.5 }, layer);
      var r = render(xs[i], layer);
      t.show(r.html, px, r.y);
    }
    function nearest(evt) {
      var rect = svg.getBoundingClientRect();
      var scale = svg.viewBox.baseVal.width / rect.width;
      var px = (evt.clientX - rect.left) * scale;
      var best = 0, bd = Infinity;
      xs.forEach(function (v, i) { var d = Math.abs(x(v) - px); if (d < bd) { bd = d; best = i; } });
      return best;
    }
    hit.addEventListener("pointermove", function (e) { at(nearest(e)); });
    hit.addEventListener("pointerdown", function (e) { at(nearest(e)); });
    hit.addEventListener("pointerleave", function () { at(-1); });
    svg.setAttribute("tabindex", "0");
    svg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { at(Math.min(xs.length - 1, idx + 1)); e.preventDefault(); }
      if (e.key === "ArrowLeft") { at(Math.max(0, idx < 0 ? xs.length - 1 : idx - 1)); e.preventDefault(); }
      if (e.key === "Escape") at(-1);
    });
    svg.addEventListener("blur", function () { at(-1); });
  }

  function dot(g, cx, cy, color, hollow, r) {
    return el("circle", { cx: cx, cy: cy, r: r || 4.5, fill: hollow ? C.white : color, stroke: hollow ? color : C.white, "stroke-width": 2 }, g);
  }

  /* Tabellvisning under hver graf. */
  function addTable(fig, head, rows) {
    var d = document.createElement("details");
    d.className = "table";
    var html = "<summary>Vis tallene</summary><table><thead><tr>" +
      head.map(function (h) { return "<th>" + h + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>"; }).join("") +
      "</tbody></table>";
    d.innerHTML = html;
    fig.appendChild(d);
  }

  function segmented(fig, onChange) {
    var btns = fig.querySelectorAll(".chart-head .seg button");
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
        onChange(b.dataset.mode);
      });
    });
  }

  function kindLabel(kind) {
    if (kind === "observed") return "Observert";
    if (kind === "projection_MMMM_baseyear") return "Startår i framskrivingen";
    if (kind.indexOf("projection") === 0) return "Framskrevet";
    if (kind === "derived_illustration") return "Regneeksempel";
    return kind;
  }

  /* =========================================================
     01 — 80+ 2010–2050
     ========================================================= */
  (function () {
    var fig = document.getElementById("chart-80");
    var plot = fig.querySelector(".plot");
    var rows = D.pop80;
    var base = rows[0].persons_80plus;
    var obs = rows.filter(function (r) { return r.kind === "observed"; });
    var proj = rows.filter(function (r) { return r.kind !== "observed"; });
    var lastObs = obs[obs.length - 1];
    var pred = {};
    // SSB 14288s framskrevne tall for de observerte årene står i notes-kolonnen
    obs.forEach(function (r) { var mm = /framskrev (\d+)/.exec(r.notes || ""); if (mm) pred[r.year] = +mm[1]; });
    var mode = "abs";

    function val(r) { return mode === "abs" ? r.persons_80plus : r.persons_80plus / base * 100; }

    var redraw = responsive(plot, function (w) {
      var narrow = w < 560;
      var h = Math.max(280, Math.min(420, w * 0.5));
      var m = { t: 28, r: narrow ? 16 : 96, b: 30, l: mode === "abs" ? (narrow ? 54 : 60) : 40 };
      var svg = newSvg(plot, w, h, "Linjegraf: personer 80 år og eldre, 2010 til 2050");
      var x = lin(2010, 2050, m.l, w - m.r);
      var ymax = mode === "abs" ? 650000 : 300;
      var y = lin(0, ymax, h - m.b, m.t);
      var ticks = mode === "abs" ? [0, 200000, 400000, 600000] : [0, 100, 200, 300];
      el("rect", { x: x(lastObs.year), y: m.t - 8, width: x(2050) - x(lastObs.year), height: h - m.b - m.t + 8, fill: C.mist, opacity: 0.28 }, svg);
      yAxis(svg, y, ticks, m.l, w - m.r, function (t) { return mode === "abs" ? n0(t) : String(t); });
      xAxis(svg, x, narrow ? [2010, 2026, 2050] : [2010, 2020, 2026, 2030, 2040, 2050], h - m.b);
      text(svg, x(lastObs.year) - 8, m.t + 4, "Observert", "anno small", "end");
      text(svg, x(lastObs.year) + 8, m.t + 4, "Framskrevet", "anno small", "start");

      var po = obs.map(function (r) { return [x(r.year), y(val(r))]; });
      var pp = [lastObs].concat(proj).map(function (r) { return [x(r.year), y(val(r))]; });
      el("path", { d: pathD(pp), fill: "none", stroke: C.navy, "stroke-width": 2, "stroke-dasharray": "6 5" }, svg);
      el("path", { d: pathD(po), fill: "none", stroke: C.navy, "stroke-width": 2.25 }, svg);

      var first = obs[0], end = proj[proj.length - 1];
      var fmtv = function (r) { return mode === "abs" ? n0(r.persons_80plus) : n0(val(r)); };
      dot(svg, x(first.year), y(val(first)), C.navy);
      text(svg, x(first.year), y(val(first)) - 12, fmtv(first), "anno", "start");
      dot(svg, x(lastObs.year), y(val(lastObs)), C.navy);
      text(svg, x(lastObs.year) - 6, y(val(lastObs)) - 12, fmtv(lastObs) + (narrow ? "" : " i 2026"), "anno", "end");
      dot(svg, x(end.year), y(val(end)), C.navy, true);
      if (narrow) {
        text(svg, x(end.year) - 8, y(val(end)) - 12, fmtv(end), "anno strong", "end");
      } else {
        text(svg, x(end.year) + 10, y(val(end)) + 4, fmtv(end), "anno strong", "start");
        text(svg, x(end.year) + 10, y(val(end)) + 20, "i 2050", "anno small", "start");
      }

      var xs = rows.map(function (r) { return r.year; });
      hoverX(svg, plot, xs, x, m.t, h - m.b, m.l, w - m.r, function (yr, g) {
        var r = rows.filter(function (q) { return q.year === yr; })[0];
        var cy = y(val(r));
        dot(g, x(yr), cy, C.navy, r.kind !== "observed", 5);
        var html = '<div class="t-year">' + yr + "</div>" + row("Personer 80+", n0(r.persons_80plus));
        if (mode === "idx") html += row("Indeks (2010 = 100)", n1(val(r)));
        html += row("Status", kindLabel(r.kind));
        if (r.kind === "observed" && pred[yr] && yr >= 2025) html += row("SSB 14288 framskrev", n0(pred[yr]));
        html += srcLine(r.kind === "observed" ? "SSB tabell 07459" : "SSB tabell 14288, MMMM");
        return { html: html, y: cy };
      });
    });

    segmented(fig, function (m) { mode = m; redraw(); });
    addTable(fig, ["År", "Personer 80+", "Status", "Kilde"], rows.map(function (r) {
      return [r.year, n0(r.persons_80plus), kindLabel(r.kind), r.kind === "observed" ? "SSB 07459" : "SSB 14288 MMMM"];
    }));
  })();

  /* =========================================================
     02 — Krysset i 2031
     ========================================================= */
  (function () {
    var fig = document.getElementById("chart-cross");
    var plot = fig.querySelector(".plot");
    var years = [];
    var by = {};
    D.ageStructure.forEach(function (r) {
      if (years.indexOf(r.year) < 0) years.push(r.year);
      by[r.year] = by[r.year] || {};
      by[r.year][r.group] = r.persons;
    });
    var cross = 2031;

    responsive(plot, function (w) {
      var narrow = w < 560;
      var h = Math.max(280, Math.min(400, w * 0.46));
      var m = { t: 24, r: narrow ? 16 : 120, b: 30, l: narrow ? 44 : 72 };
      var svg = newSvg(plot, w, h, "Linjegraf: personer 65 år og eldre mot 0 til 19 år, 2024 til 2050");
      var x = lin(2024, 2050, m.l, w - m.r);
      var y = lin(0, 1800000, h - m.b, m.t);
      yAxis(svg, y, [0, 600000, 1200000, 1800000], m.l, w - m.r, function (t) { return !t ? "0" : narrow ? (t / 1e6).toLocaleString("nb-NO") + " mill." : n0(t); });
      xAxis(svg, x, years, h - m.b);

      el("line", { x1: x(cross), x2: x(cross), y1: m.t, y2: h - m.b, stroke: C.navy, "stroke-width": 1, opacity: 0.35 }, svg);

      [["0-19", C.grey], ["65+", C.navy]].forEach(function (s) {
        var pts = years.map(function (yr) { return [x(yr), y(by[yr][s[0]])]; });
        el("path", { d: pathD(pts), fill: "none", stroke: s[1], "stroke-width": 2.25, "stroke-dasharray": "6 5" }, svg);
        years.forEach(function (yr, i) { dot(svg, x(yr), y(by[yr][s[0]]), s[1], i > 0, 4); });
      });

      var ly = y(by[cross]["65+"]);
      text(svg, x(cross) + 8, y(1800000) + 12, "2031", "anno big", "start");
      text(svg, x(cross) + 8, y(1800000) + 30, "65+ passerer 0–19", "anno", "start");

      var e65 = by[2050]["65+"], e19 = by[2050]["0-19"];
      if (narrow) {
        text(svg, x(2050) - 6, y(e65) - 12, "65+", "anno strong", "end");
        text(svg, x(2050) - 6, y(e19) + 22, "0–19", "anno small", "end");
      } else {
        text(svg, x(2050) + 10, y(e65) + 4, "65+  " + n0(e65), "anno strong", "start");
        text(svg, x(2050) + 10, y(e19) + 4, "0–19  " + n0(e19), "anno", "start");
      }
      text(svg, x(2024) + 6, y(by[2024]["0-19"]) - 12, "0–19", "anno small", "start");
      text(svg, x(2024) + 6, y(by[2024]["65+"]) + 22, "65+", "anno small", "start");

      hoverX(svg, plot, years, x, m.t, h - m.b, m.l, w - m.r, function (yr, g) {
        var a = by[yr]["65+"], b = by[yr]["0-19"];
        dot(g, x(yr), y(a), C.navy, false, 5);
        dot(g, x(yr), y(b), C.grey, false, 5);
        var html = '<div class="t-year">' + yr + "</div>" + row("65 år og eldre", n0(a)) + row("0–19 år", n0(b)) +
          row("Differanse", (a - b > 0 ? "+" : "") + n0(a - b)) +
          row("Status", yr === 2024 ? "Startår" : "Framskrevet") + srcLine("SSB tabell 14288, MMMM");
        return { html: html, y: Math.min(y(a), y(b)) };
      });
    });

    addTable(fig, ["År", "65+", "0–19", "Status"], years.map(function (yr) {
      return [yr, n0(by[yr]["65+"]), n0(by[yr]["0-19"]), yr === 2024 ? "Startår" : "Framskrevet"];
    }));
  })();

  /* =========================================================
     03 — Sykehjemsplasser mot 80+
     ========================================================= */
  (function () {
    var fig = document.getElementById("chart-care");
    var plot = fig.querySelector(".plot");
    var places = D.care.filter(function (r) { return r.metric === "sykehjem_disponible_plasser"; });
    var needed = D.care.filter(function (r) { return r.metric === "sykehjemsplasser_ved_2025_dekning"; });
    var p80 = D.pop80.filter(function (r) { return r.year >= 2021 && r.year <= 2030; });
    var b80 = p80[0].persons_80plus, bPl = places[0].value;
    var p2025 = places[places.length - 1];
    var mode = "idx";
    var title = fig.querySelector(".chart-title");

    function drawIdx(w) {
      var narrow = w < 560;
      var h = Math.max(280, Math.min(400, w * 0.46));
      var m = { t: 20, r: narrow ? 16 : 150, b: 30, l: 40 };
      var svg = newSvg(plot, w, h, "Linjegraf: indeks for personer 80+ og sykehjemsplasser, 2021 = 100");
      var x = lin(2021, 2030, m.l, w - m.r);
      var y = lin(0, 160, h - m.b, m.t);
      el("rect", { x: x(2026), y: m.t, width: x(2030) - x(2026), height: h - m.b - m.t, fill: C.mist, opacity: 0.28 }, svg);
      yAxis(svg, y, [0, 50, 100, 150], m.l, w - m.r, String);
      xAxis(svg, x, narrow ? [2021, 2025, 2030] : [2021, 2022, 2023, 2024, 2025, 2026, 2028, 2030], h - m.b);

      var obs = p80.filter(function (r) { return r.kind === "observed"; });
      var proj = p80.filter(function (r) { return r.kind !== "observed"; });
      var idx = function (r) { return r.persons_80plus / b80 * 100; };
      el("path", { d: pathD([obs[obs.length - 1]].concat(proj).map(function (r) { return [x(r.year), y(idx(r))]; })), fill: "none", stroke: C.navy, "stroke-width": 2, "stroke-dasharray": "6 5" }, svg);
      el("path", { d: pathD(obs.map(function (r) { return [x(r.year), y(idx(r))]; })), fill: "none", stroke: C.navy, "stroke-width": 2.25 }, svg);
      el("path", { d: pathD(places.map(function (r) { return [x(r.year), y(r.value / bPl * 100)]; })), fill: "none", stroke: C.grey, "stroke-width": 2.25 }, svg);

      var o25 = obs.filter(function (r) { return r.year === 2025; })[0];
      var e30 = proj[proj.length - 1];
      dot(svg, x(2025), y(idx(o25)), C.navy);
      dot(svg, x(2025), y(p2025.value / bPl * 100), C.grey);
      dot(svg, x(2030), y(idx(e30)), C.navy, true);
      text(svg, x(2025) - 8, y(idx(o25)) - 12, "80+ " + pct0(idx(o25) - 100), "anno strong", "end");
      text(svg, x(2025) + 8, y(p2025.value / bPl * 100) + 20, "Plasser " + "+" + n1(p2025.value / bPl * 100 - 100) + " %", "anno", "start");
      if (narrow) text(svg, x(2030) - 8, y(idx(e30)) - 12, pct0(idx(e30) - 100) + " i 2030", "anno", "end");
      else {
        text(svg, x(2030) + 10, y(idx(e30)) + 4, pct0(idx(e30) - 100) + " i 2030", "anno strong", "start");
        text(svg, x(2030) + 10, y(idx(e30)) + 20, "framskrevet", "anno small", "start");
      }

      var xs = p80.map(function (r) { return r.year; });
      hoverX(svg, plot, xs, x, m.t, h - m.b, m.l, w - m.r, function (yr, g) {
        var r = p80.filter(function (q) { return q.year === yr; })[0];
        var pl = places.filter(function (q) { return q.year === yr; })[0];
        dot(g, x(yr), y(idx(r)), C.navy, r.kind !== "observed", 5);
        var html = '<div class="t-year">' + yr + "</div>" + row("Personer 80+", n0(r.persons_80plus)) + row("Indeks 80+", n1(idx(r)));
        if (pl) { dot(g, x(yr), y(pl.value / bPl * 100), C.grey, false, 5); html += row("Sykehjemsplasser", n0(pl.value)) + row("Indeks plasser", n1(pl.value / bPl * 100)); }
        html += row("80+", kindLabel(r.kind));
        html += srcLine(pl ? "SSB KOSTRA; SSB 07459" : "SSB tabell 14288, MMMM");
        return { html: html, y: y(idx(r)) };
      });
    }

    function drawAbs(w) {
      var narrow = w < 560;
      var h = Math.max(300, Math.min(420, w * 0.5));
      var m = { t: 28, r: narrow ? 58 : 100, b: 30, l: narrow ? 54 : 60 };
      var svg = newSvg(plot, w, h, "Søylediagram: sykehjemsplasser 2021 til 2025 og regneeksempel for 2040 og 2050");
      var cats = places.map(function (r) { return { year: r.year, value: r.value, kind: "observed", note: r.notes }; })
        .concat([{ gap: true }])
        .concat(needed.map(function (r) { return { year: r.year, value: r.value, kind: "derived_illustration", note: r.notes }; }));
      var slot = (w - m.l - m.r) / cats.length;
      var bw = Math.min(56, slot * 0.62);
      var y = lin(0, 100000, h - m.b, m.t);
      yAxis(svg, y, [0, 25000, 50000, 75000, 100000], m.l, w - m.r, function (t) { return n0(t); });
      var g = el("g", {}, svg);
      var t = tip(plot);
      var cx = function (i) { return m.l + slot * i + slot / 2; };

      // 2025-nivå videreført, så gapet er lesbart
      el("line", { x1: cx(4), x2: cx(cats.length - 1) + bw / 2, y1: y(p2025.value), y2: y(p2025.value), stroke: C.grey, "stroke-width": 1, "stroke-dasharray": "2 3" }, svg);

      cats.forEach(function (c, i) {
        if (c.gap) {
          text(svg, cx(i), h - m.b + 18, "…", "anno small", "middle");
          return;
        }
        var obs = c.kind === "observed";
        var top = y(c.value), bx = cx(i) - bw / 2;
        var rect = el("rect", {
          x: bx, y: top, width: bw, height: y(0) - top,
          fill: obs ? C.grey : C.mist, stroke: obs ? "none" : C.navy, "stroke-width": obs ? 0 : 1.5, "stroke-dasharray": obs ? null : "4 3"
        }, g);
        if (!narrow || c.year === 2021 || c.year === 2025 || !obs) text(svg, cx(i), h - m.b + 18, String(c.year), "", "middle", { fill: C.grey, "font-size": 12 });
        if (c.year === 2025 || !obs) text(svg, cx(i), top - 8, n0(c.value), obs ? "anno" : "anno strong", "middle");
        var hit = el("rect", { x: cx(i) - slot / 2, y: m.t, width: slot, height: y(0) - m.t, fill: "transparent" }, svg);
        var show = function () {
          rect.setAttribute("opacity", 0.8);
          var html = '<div class="t-year">' + c.year + "</div>" + row(obs ? "Disponible plasser" : "Plasser ved 2025-dekning", n0(c.value)) + row("Status", kindLabel(c.kind));
          if (!obs) html += row("Flere enn 2025", "+" + n0(c.value - p2025.value)) + srcLine("Regneeksempel, ikke SSB-prognose. 14,7 plasser per 100 personer 80+ × SSB 14288 MMMM.");
          else html += srcLine("SSB KOSTRA, per 31.12");
          t.show(html, cx(i), top);
        };
        hit.addEventListener("pointerenter", show);
        hit.addEventListener("pointerdown", show);
        hit.addEventListener("pointerleave", function () { rect.removeAttribute("opacity"); t.hide(); });
      });

      // gapet i 2050
      var last = needed[needed.length - 1];
      var gx = cx(cats.length - 1) + bw / 2 + 8;
      el("path", { d: "M" + (gx - 4) + "," + y(p2025.value) + "H" + gx + "V" + y(last.value) + "H" + (gx - 4), fill: "none", stroke: C.navy, "stroke-width": 1.25 }, svg);
      text(svg, gx + 6, (y(p2025.value) + y(last.value)) / 2 - 2, "+" + n0(Math.round((last.value - p2025.value) / 1000) * 1000), "anno strong", "start");
      text(svg, gx + 6, (y(p2025.value) + y(last.value)) / 2 + 14, "plasser", "anno small", "start");
    }

    var redraw = responsive(plot, function (w) { mode === "idx" ? drawIdx(w) : drawAbs(w); });
    segmented(fig, function (m) {
      mode = m;
      title.textContent = title.dataset["title" + (m === "idx" ? "Idx" : "Abs")];
      fig.querySelectorAll(".legend[data-view]").forEach(function (l) { l.hidden = l.dataset.view !== m; });
      redraw();
    });
    var trows = places.map(function (r) {
      var p = D.pop80.filter(function (q) { return q.year === r.year; })[0];
      return [r.year, n0(r.value), n0(p.persons_80plus), "Observert"];
    }).concat(needed.map(function (r) {
      var p = D.pop80.filter(function (q) { return q.year === r.year; })[0];
      return [r.year, n0(r.value), n0(p.persons_80plus), "Regneeksempel / framskrevet 80+"];
    }));
    addTable(fig, ["År", "Sykehjemsplasser", "Personer 80+", "Status"], trows);
  })();

  /* =========================================================
     04 — Små søylegrafer: yrkesaktive per 80+ og demens
     ========================================================= */
  function miniBars(plot, bars, label) {
    responsive(plot, function (w) {
      var h = 150, m = { t: 24, r: 4, b: 24, l: 4 };
      var svg = newSvg(plot, w, h, label);
      var slot = (w - m.l - m.r) / bars.length;
      var bw = Math.min(40, slot * 0.6);
      var max = Math.max.apply(null, bars.map(function (b) { return b.value; }));
      var y = lin(0, max * 1.08, h - m.b, m.t);
      var t = tip(plot);
      el("line", { x1: m.l, x2: w - m.r, y1: y(0), y2: y(0), stroke: "#b8b8b8" }, svg);
      bars.forEach(function (b, i) {
        var cx = m.l + slot * i + slot / 2, top = y(b.value);
        var rect = el("rect", { x: cx - bw / 2, y: top, width: bw, height: y(0) - top, fill: b.solid ? C.navy : C.mist, stroke: b.solid ? "none" : C.navy, "stroke-width": b.solid ? 0 : 1.25, "stroke-dasharray": b.solid ? null : "4 3" }, svg);
        text(svg, cx, h - 6, String(b.year), "", "middle", { fill: C.grey, "font-size": 11.5 });
        if (i === 0 || i === bars.length - 1) text(svg, cx, top - 7, b.short, "anno strong", "middle");
        var hit = el("rect", { x: cx - slot / 2, y: m.t - 10, width: slot, height: h - m.t, fill: "transparent" }, svg);
        var show = function () { rect.setAttribute("opacity", 0.8); t.show(b.html, cx, top); };
        hit.addEventListener("pointerenter", show);
        hit.addEventListener("pointerdown", show);
        hit.addEventListener("pointerleave", function () { rect.removeAttribute("opacity"); t.hide(); });
      });
    });
  }

  miniBars(document.getElementById("chart-support"), D.support.map(function (r) {
    var base = r.kind === "projection_MMMM_baseyear";
    return {
      year: r.year, value: r.workers_per_80plus, solid: base, short: n1(r.workers_per_80plus),
      html: '<div class="t-year">' + r.year + "</div>" + row("Per person 80+", n2(r.workers_per_80plus)) +
        row("Personer 20–64", n0(r.persons_20_64)) + row("Personer 80+", n0(r.persons_80plus)) +
        row("Status", base ? "Startår" : "Framskrevet") + srcLine("SSB tabell 14288, MMMM")
    };
  }), "Søylediagram: personer 20–64 år per person 80+, 2024 til 2050");

  miniBars(document.getElementById("chart-dementia"), D.dementia.filter(function (r) { return r.metric === "personer_med_demens"; }).map(function (r) {
    var est = r.kind === "estimate";
    return {
      year: r.year, value: r.value, solid: est, short: n0(r.value),
      html: '<div class="t-year">' + r.year + "</div>" + row("Personer med demens", "ca. " + n0(r.value)) +
        row("Status", est ? "Estimat" : "Framskrevet") + srcLine("FHI, Folkehelserapporten: Demens. " + (est ? "HUNT4 og Tromsøundersøkelsen." : "Forutsetter stabil aldersspesifikk forekomst."))
    };
  }), "Søylediagram: personer med demens, 2025 til 2050");

  /* =========================================================
     05 — Fylker
     ========================================================= */
  (function () {
    var fig = document.getElementById("chart-county");
    var plot = fig.querySelector(".county-layout > .plot");
    var select = document.getElementById("county-select");
    var panel = fig.querySelector(".county-panel");
    var mini = document.getElementById("county-mini");
    var title = fig.querySelector(".chart-title");
    var counties = {};
    D.counties.forEach(function (r) {
      var c = counties[r.county_code] = counties[r.county_code] || { code: r.county_code, name: r.county, years: {} };
      c.years[r.year] = r.persons_80plus;
    });
    var list = Object.keys(counties).map(function (k) {
      var c = counties[k];
      c.growth = (c.years[2050] / c.years[2024] - 1) * 100;
      return c;
    });
    var selected = "03";
    var mode = "pct";

    list.slice().sort(function (a, b) { return a.name.localeCompare(b.name, "nb"); }).forEach(function (c) {
      var o = document.createElement("option");
      o.value = c.code; o.textContent = c.name;
      select.appendChild(o);
    });

    function drawBars(w) {
      var narrow = w < 480;
      var sorted = list.slice().sort(mode === "pct" ? function (a, b) { return b.growth - a.growth; } : function (a, b) { return b.years[2050] - a.years[2050]; });
      var rh = 30, m = { t: mode === "pct" ? 26 : 30, r: 64, b: 8, l: narrow ? 112 : 132 };
      var h = m.t + sorted.length * rh + m.b;
      var svg = newSvg(plot, w, h, mode === "pct" ? "Søylediagram: vekst i antall 80+ per fylke 2024–2050" : "Søylediagram: antall 80+ per fylke i 2024 og 2050");
      var x = mode === "pct" ? lin(0, 180, m.l, w - m.r) : lin(0, 80000, m.l, w - m.r);
      var t = tip(plot);
      var g = el("g", { class: "axis" }, svg);
      var ticks = mode === "pct" ? [0, 50, 100, 150] : (narrow ? [0, 40000, 80000] : [0, 20000, 40000, 60000, 80000]);
      ticks.forEach(function (v) {
        el("line", { x1: x(v), x2: x(v), y1: m.t - 4, y2: h - m.b, class: v === 0 ? "base" : "grid" }, g);
        text(g, x(v), m.t - 10, mode === "pct" ? v + " %" : n0(v), "", "middle");
      });
      if (mode === "pct") {
        el("line", { x1: x(100), x2: x(100), y1: m.t - 4, y2: h - m.b, stroke: C.navy, "stroke-width": 1.25 }, svg);
      } else {
        var lg = el("g", {}, svg);
        el("rect", { x: w - m.r - 150, y: 2, width: 10, height: 8, fill: C.grey }, lg);
        text(lg, w - m.r - 136, 10, "2024", "anno small");
        el("rect", { x: w - m.r - 92, y: 2, width: 10, height: 8, fill: C.teal }, lg);
        text(lg, w - m.r - 78, 10, "2050, framskrevet", "anno small");
      }

      sorted.forEach(function (c, i) {
        var y0 = m.t + i * rh;
        var sel = c.code === selected;
        var grp = el("g", { class: "bar-row", tabindex: 0, role: "button", "aria-label": c.name + ", " + pct0(c.growth) }, svg);
        grp.style.cursor = "pointer";
        text(grp, m.l - 10, y0 + rh / 2 + 4, c.name, sel ? "anno strong" : "anno", "end");
        if (mode === "pct") {
          el("rect", { x: x(0), y: y0 + 7, width: x(c.growth) - x(0), height: rh - 14, fill: sel ? C.navy : C.teal }, grp);
          text(grp, x(c.growth) + 6, y0 + rh / 2 + 4, pct0(c.growth), sel ? "anno strong" : "anno", "start");
        } else {
          el("rect", { x: x(0), y: y0 + 5, width: x(c.years[2050]) - x(0), height: 9, fill: sel ? C.navy : C.teal }, grp);
          el("rect", { x: x(0), y: y0 + 16, width: x(c.years[2024]) - x(0), height: 9, fill: C.grey }, grp);
          text(grp, x(c.years[2050]) + 6, y0 + 13, n0(c.years[2050]), sel ? "anno strong" : "anno small", "start");
        }
        el("rect", { x: 0, y: y0, width: w, height: rh, fill: "transparent" }, grp);
        var show = function () {
          t.show('<div class="t-year">' + c.name + "</div>" + [2024, 2030, 2040, 2050].map(function (yr) { return row(yr + (yr === 2024 ? " (startår)" : ""), n0(c.years[yr])); }).join("") +
            row("Vekst 2024–2050", pct0(c.growth)) + srcLine("SSB tabell 14288, MMMM"), mode === "pct" ? x(c.growth) : x(c.years[2050]), y0 + rh / 2);
        };
        grp.addEventListener("pointerenter", show);
        grp.addEventListener("pointerleave", function () { t.hide(); });
        grp.addEventListener("click", function () { choose(c.code); });
        grp.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(c.code); } });
      });
      if (mode === "pct") text(svg, x(100) + 4, h - m.b - 2, "", "anno small");
    }

    var redrawBars = responsive(plot, drawBars);

    var redrawMini = responsive(mini, function (w) {
      var c = counties[selected];
      var yrs = [2024, 2030, 2040, 2050];
      var h = 170, m = { t: 22, b: 22 };
      var svg = newSvg(mini, w, h, "Søylediagram: personer 80+ i " + c.name);
      var slot = w / yrs.length, bw = Math.min(44, slot * 0.6);
      var y = lin(0, c.years[2050] * 1.05, h - m.b, m.t);
      el("line", { x1: 0, x2: w, y1: y(0), y2: y(0), stroke: "#b8b8b8" }, svg);
      yrs.forEach(function (yr, i) {
        var cx = slot * i + slot / 2, top = y(c.years[yr]), base = yr === 2024;
        el("rect", { x: cx - bw / 2, y: top, width: bw, height: y(0) - top, fill: base ? C.navy : C.mist, stroke: base ? "none" : C.navy, "stroke-width": base ? 0 : 1.25, "stroke-dasharray": base ? null : "4 3" }, svg);
        text(svg, cx, top - 6, n0(c.years[yr]), "anno small", "middle");
        text(svg, cx, h - 5, String(yr), "", "middle", { fill: C.grey, "font-size": 11.5 });
      });
    });

    function choose(code) {
      selected = code;
      select.value = code;
      var c = counties[code];
      panel.querySelector(".growth").textContent = pct0(c.growth);
      panel.querySelector(".growth-sub").textContent = "Fra " + n0(c.years[2024]) + " personer over 80 i 2024 til " + n0(c.years[2050]) + " i 2050.";
      redrawBars();
      redrawMini();
    }
    select.addEventListener("change", function () { choose(select.value); });
    segmented(fig, function (m) {
      mode = m;
      title.textContent = title.dataset["title" + (m === "pct" ? "Pct" : "Abs")];
      redrawBars();
    });
    choose(selected);

    addTable(fig, ["Fylke", "2024", "2030", "2040", "2050", "Vekst"], list.slice().sort(function (a, b) { return b.growth - a.growth; }).map(function (c) {
      return [c.name, n0(c.years[2024]), n0(c.years[2030]), n0(c.years[2040]), n0(c.years[2050]), pct0(c.growth)];
    }));
  })();

  /* =========================================================
     06 — Rente, prime yield og mål
     ========================================================= */
  (function () {
    var fig = document.getElementById("chart-rate");
    var plot = fig.querySelector(".plot");
    var rate = D.yields.filter(function (r) { return r.series === "norway_govt_10y_annual"; });
    var latest = D.yields.filter(function (r) { return r.series === "norway_govt_10y_generic_latest"; })[0];
    var brokers = D.yields.filter(function (r) { return r.kind === "broker_estimate"; });
    var lo = D.yields.filter(function (r) { return r.series === "evergreen_return_target_low"; })[0].value_pct;
    var hi = D.yields.filter(function (r) { return r.series === "evergreen_return_target_high"; })[0].value_pct;
    var cpi = D.cpi.filter(function (r) { return r.kind === "observed"; });
    var latestX = 2026 + (8 + 16 / 30) / 12;   // 16. september 2026
    var launchX = 2026 + 4.8 / 12;              // 26. mai 2026
    var showCpi = false;

    var redraw = responsive(plot, function (w) {
      var narrow = w < 560;
      var h = Math.max(300, Math.min(440, w * 0.52));
      var m = { t: 16, r: 12, b: 30, l: 36 };
      var svg = newSvg(plot, w, h, "Linjegraf: tiårig statsrente 2015 til 2026, prime yield 2025 og avkastningsmål 6 til 8 prosent");
      var x = lin(2014.6, 2027.4, m.l, w - m.r);
      var y = lin(0, 9, h - m.b, m.t);
      yAxis(svg, y, [0, 2, 4, 6, 8], m.l, w - m.r, function (t) { return t + " %"; });
      xAxis(svg, x, narrow ? [2015, 2020, 2025] : [2015, 2017, 2019, 2021, 2023, 2025, 2026], h - m.b);

      // Mål-bånd fra lansering
      el("rect", { x: x(launchX), y: y(hi), width: x(2027.4) - x(launchX), height: y(lo) - y(hi), fill: C.mist }, svg);
      text(svg, x(2027.4) - 8, y(hi) + 18, "Mål", "anno big", "end");
      text(svg, x(2027.4) - 8, y(hi) + 34, lo + "–" + hi + " %", "anno strong", "end");
      if (!narrow) text(svg, x(launchX) - 6, y(hi) + 4, "Avkastningsmål fra lansering mai 2026", "anno small", "end");

      if (showCpi) {
        el("path", { d: pathD(cpi.map(function (r) { return [x(+r.period), y(r.change_pct)]; })), fill: "none", stroke: C.grey, "stroke-width": 1.5 }, svg);
        var lastK = cpi[cpi.length - 1];
        text(svg, x(+lastK.period) + 8, y(lastK.change_pct) + 4, "KPI " + n1(lastK.change_pct) + " %", "anno small", "start");
      }

      el("path", { d: pathD(rate.map(function (r) { return [x(r.year), y(r.value_pct)]; })), fill: "none", stroke: C.navy, "stroke-width": 2.25 }, svg);
      dot(svg, x(rate[0].year), y(rate[0].value_pct), C.navy);
      text(svg, x(rate[0].year), y(rate[0].value_pct) - 12, n2(rate[0].value_pct) + " %", "anno", "start");
      dot(svg, x(latestX), y(latest.value_pct), C.navy, true, 5);
      text(svg, x(latestX), y(latest.value_pct) + 22, n2(latest.value_pct) + " %", "anno strong", "middle");
      if (!narrow) text(svg, x(latestX), y(latest.value_pct) + 37, "16. sep 2026", "anno small", "middle");

      var seen = {};
      brokers.forEach(function (b) {
        var cy = y(b.value_pct), cx = x(b.year);
        el("rect", { x: cx - 5, y: cy - 5, width: 10, height: 10, transform: "rotate(45 " + cx + " " + cy + ")", fill: C.white, stroke: C.grey, "stroke-width": 1.5 }, svg);
        if (seen[b.value_pct]) return;
        seen[b.value_pct] = 1;
        var lbl = b.value_pct === 4.5 ? (narrow ? "Kontor sentrum" : "Prime kontor, Oslo sentrum") : (narrow ? "Utenfor sentrum, logistikk" : "Kontor utenfor sentrum og logistikk");
        text(svg, cx - 12, cy + (b.value_pct === 4.5 ? -4 : -6), lbl + " " + n2(b.value_pct) + " %", "anno small", "end");
      });

      var xs = rate.map(function (r) { return r.year; }).concat([latestX]);
      hoverX(svg, plot, xs, x, m.t, h - m.b, m.l, w - m.r, function (xv, g) {
        var html, cy;
        if (xv === latestX) {
          cy = y(latest.value_pct);
          html = '<div class="t-year">16. september 2026</div>' + row("Tiårig statsrente", n2(latest.value_pct) + " %") + row("Avkastningsmål", lo + "–" + hi + " %") +
            srcLine("Norges Bank, generisk tiårig statsrente. Dagsobservasjon, ikke årsgjennomsnitt. Målet er et mål, ikke et resultat.");
        } else {
          var r = rate.filter(function (q) { return q.year === xv; })[0];
          cy = y(r.value_pct);
          html = '<div class="t-year">' + xv + "</div>" + row("Tiårig statsrente, snitt", n2(r.value_pct) + " %");
          var k = cpi.filter(function (q) { return +q.period === xv; })[0];
          if (k && showCpi) html += row("KPI, årlig endring", n1(k.change_pct) + " %");
          if (xv === 2025) brokers.forEach(function (b) {
            html += row(b.series === "oslo_prime_office_cbd_yield" ? "Prime kontor sentrum" : b.series === "oslo_prime_office_fringe_yield" ? "Kontor utenfor sentrum" : "Prime logistikk", n2(b.value_pct) + " %");
          });
          html += srcLine("OECD via FRED" + (xv === 2025 ? "; JLL og CBRE (meglerestimat)" : "") + (showCpi ? "; SSB 14711" : ""));
        }
        dot(g, x(xv), cy, C.navy, xv === latestX, 5);
        return { html: html, y: cy };
      });
    });

    document.getElementById("cpi-toggle").addEventListener("change", function (e) {
      showCpi = e.target.checked;
      fig.querySelector(".cpi-leg").hidden = !showCpi;
      redraw();
    });

    var trows = rate.map(function (r) {
      var k = cpi.filter(function (q) { return +q.period === r.year; })[0];
      return [r.year, n2(r.value_pct) + " %", k ? n1(k.change_pct) + " %" : "–", "OECD via FRED; SSB 14711"];
    });
    trows.push(["16.09.2026", n2(latest.value_pct) + " %", "–", "Norges Bank, dagsobservasjon"]);
    brokers.forEach(function (b) { trows.push([b.year + ", " + (b.series === "oslo_prime_office_cbd_yield" ? "prime kontor sentrum" : b.series === "oslo_prime_office_fringe_yield" ? "kontor utenfor sentrum" : "prime logistikk"), n2(b.value_pct) + " %", "–", b.source + " (meglerestimat)"]); });
    trows.push(["Mål for fondet", lo + "–" + hi + " %", "–", "Avkastningsmål, ikke resultat"]);
    addTable(fig, ["År / serie", "Rente / yield", "KPI-endring", "Kilde"], trows);
  })();

  /* =========================================================
     07 — Kart over referansepunkter
     ========================================================= */
  (function () {
    var refs = D.references;
    var listEl = document.getElementById("ref-list");
    var mapEl = document.getElementById("map");
    var sector = {
      eldre_omsorg: "Eldre og omsorg", helse: "Helse", forskning_utdanning: "Forskning og utdanning",
      beredskap: "Beredskap", dagligvare: "Dagligvare", forsyningslinjer: "Forsyningslinjer"
    };
    var pillar = { demografi: "Søyle 1", strategisk_beliggenhet: "Søyle 2" };
    var markers = [];
    var map = null;

    if (window.L) {
      map = L.map(mapEl, { scrollWheelZoom: false, attributionControl: true });
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 16, attribution: "© Esri"
      }).addTo(map);
    } else {
      mapEl.hidden = true;
    }

    function popup(r) {
      return "<b>" + r.example_name + "</b><br>" + r.address + ", " + r.postal_code + " " + r.city +
        "<br><span style='color:" + C.grey + "'>" + sector[r.sector] + " · " + pillar[r.thesis_pillar] + "</span>" +
        "<p style='margin:.5rem 0 0'>" + r.investor_hook + "</p>" +
        "<p style='margin:.4rem 0 0;color:" + C.grey + "'>Offentlig referansepunkt. Ikke fondets eiendom.</p>";
    }

    var buttons = [];
    function activate(i) {
      buttons.forEach(function (b, j) { b.setAttribute("aria-current", i === j ? "true" : "false"); });
      markers.forEach(function (mk, j) { var e = mk.getElement(); if (e) e.firstChild.classList.toggle("active", i === j); });
      if (map) {
        map.flyTo([refs[i].lat, refs[i].lon], 14, { duration: 0.6 });
        markers[i].openPopup();
      }
    }

    refs.forEach(function (r, i) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      b.innerHTML = '<span class="n">' + (i + 1) + '</span><span class="nm">' + r.example_name + '</span><span class="meta">' +
        sector[r.sector] + " · " + r.city + "<br>" + r.investor_hook + "</span>";
      b.addEventListener("click", function () { activate(i); });
      li.appendChild(b);
      listEl.appendChild(li);
      buttons.push(b);
      if (map) {
        var icon = L.divIcon({ className: "", html: '<div class="ref-pin">' + (i + 1) + "</div>", iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -14] });
        var mk = L.marker([r.lat, r.lon], { icon: icon, keyboard: true, title: r.example_name }).addTo(map).bindPopup(popup(r), { maxWidth: 260 });
        mk.on("click", function () { buttons.forEach(function (bb, j) { bb.setAttribute("aria-current", i === j ? "true" : "false"); }); });
        markers.push(mk);
      }
    });

    var views = document.querySelectorAll(".map-views button");
    function fit(view) {
      if (!map) return;
      var pts = refs.filter(function (r) { return view === "all" || r.city === "Oslo"; });
      map.fitBounds(L.latLngBounds(pts.map(function (r) { return [r.lat, r.lon]; })), { padding: [40, 40] });
      views.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.view === view ? "true" : "false"); });
    }
    views.forEach(function (b) { b.addEventListener("click", function () { map && map.closePopup(); fit(b.dataset.view); }); });
    if (!map) views[0].parentNode.hidden = true;
    fit("oslo");
  })();
})();
