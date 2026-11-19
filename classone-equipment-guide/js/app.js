(function () {
  "use strict";

  // Search-only synonyms. They widen matching but are never displayed.
  var SYNONYMS = {
    "rf": ["radiofrequency", "rf"],
    "radiofrequency": ["radiofrequency", "rf"],
    "radio frequency": ["radiofrequency", "rf"],
    "ultrasound": ["ultrasound"],
    "hifu": ["ultrasound"],
    "tightening": ["tightness", "tightening", "firm", "elasticity", "lifting"],
    "skin tightening": ["tightness", "tightening", "firm", "elasticity", "lifting"],
    "firming": ["firm", "elasticity", "tightness"],
    "elasticity": ["elasticity", "firm"],
    "pigmentation": ["pigment", "melasma", "blemish", "lentigin", "spots"],
    "pigment": ["pigment", "melasma", "blemish", "lentigin", "spots"],
    "melasma": ["melasma", "pigment"],
    "dark spots": ["lentigin", "spots", "pigment"],
    "age spots": ["keratos", "age spots"],
    "tattoo": ["tattoo"],
    "collagen": ["collagen"],
    "skin booster": ["skin booster"],
    "hair removal": ["hair removal"],
    "laser": ["laser"],
    "ai": ["ai skin", "analysis"],
    "analysis": ["analysis"]
  };

  var state = { data: null, category: "all", query: "" };
  var els = {
    grid: document.getElementById("grid"),
    filters: document.getElementById("filters"),
    search: document.getElementById("search"),
    count: document.getElementById("result-count"),
    empty: document.getElementById("empty"),
    updated: document.getElementById("last-updated")
  };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function categoryLabel(id) {
    var c = state.data.categories.filter(function (x) { return x.id === id; })[0];
    return c ? c.label : "";
  }

  function haystack(d) {
    return [d.name, d.nameKo, d.description, categoryLabel(d.category)].join(" ").toLowerCase();
  }

  function matches(d, q) {
    if (!q) return true;
    var hay = haystack(d);
    if (hay.indexOf(q) !== -1) return true;
    var terms = SYNONYMS[q];
    if (terms) {
      for (var i = 0; i < terms.length; i++) if (hay.indexOf(terms[i]) !== -1) return true;
    }
    // every word must match (directly or via synonym)
    var words = q.split(/\s+/).filter(Boolean);
    if (words.length < 2) return false;
    return words.every(function (w) {
      if (hay.indexOf(w) !== -1) return true;
      var t = SYNONYMS[w];
      return !!t && t.some(function (s) { return hay.indexOf(s) !== -1; });
    });
  }

  function fallback(d) {
    var f = el("div", "card-fallback");
    f.appendChild(el("strong", null, d.name));
    f.appendChild(el("span", null, categoryLabel(d.category)));
    return f;
  }

  function card(d) {
    var article = el("article", "card");
    var media = el("div", "card-media");

    // Try local WebP, then local PNG, then the clinic-hosted original, then a text fallback.
    var candidates = [];
    if (d.image) {
      candidates.push(d.image);
      if (/\.webp$/i.test(d.image)) candidates.push(d.image.replace(/\.webp$/i, ".png"));
    }
    if (d.imageSource) candidates.push(d.imageSource);

    if (candidates.length) {
      var img = document.createElement("img");
      img.alt = d.name;
      img.loading = "lazy";
      img.decoding = "async";
      var i = 0;
      img.onerror = function () {
        i += 1;
        if (i < candidates.length) img.src = candidates[i];
        else media.replaceChildren(fallback(d));
      };
      img.src = candidates[0];
      media.appendChild(img);
    } else {
      media.appendChild(fallback(d));
    }

    var body = el("div", "card-body");
    body.appendChild(el("p", "card-category", categoryLabel(d.category)));
    body.appendChild(el("h2", "card-title", d.name));
    if (d.nameKo) body.appendChild(el("p", "card-title-ko", d.nameKo));
    if (d.description) body.appendChild(el("p", "card-desc", d.description));

    article.appendChild(media);
    article.appendChild(body);
    return article;
  }

  function renderFilters() {
    var cats = [{ id: "all", label: "All Devices" }].concat(state.data.categories);
    els.filters.replaceChildren();
    cats.forEach(function (c) {
      var n = c.id === "all"
        ? state.data.devices.length
        : state.data.devices.filter(function (d) { return d.category === c.id; }).length;
      if (n === 0) return;
      var b = el("button", "chip", c.label);
      b.type = "button";
      b.setAttribute("aria-pressed", String(state.category === c.id));
      b.appendChild(el("span", "count", String(n)));
      b.addEventListener("click", function () {
        state.category = c.id;
        renderFilters();
        render();
      });
      els.filters.appendChild(b);
    });
  }

  function render() {
    var q = state.query.trim().toLowerCase();
    var list = state.data.devices.filter(function (d) {
      return (state.category === "all" || d.category === state.category) && matches(d, q);
    });
    els.grid.replaceChildren.apply(els.grid, list.map(card));
    els.empty.hidden = list.length !== 0;
    els.count.textContent = list.length + (list.length === 1 ? " device" : " devices");
  }

  function formatDate(iso) {
    var p = iso.split("-");
    var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return months[parseInt(p[1], 10) - 1] + " " + parseInt(p[2], 10) + ", " + p[0];
  }

  var timer;
  els.search.addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(function () { state.query = els.search.value; render(); }, 120);
  });

  fetch("data/devices.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      state.data = data;
      els.updated.textContent = formatDate(data.meta.lastUpdated);
      els.updated.setAttribute("datetime", data.meta.lastUpdated);
      renderFilters();
      render();
    })
    .catch(function () {
      els.count.textContent = "Device information could not be loaded. Please refresh the page.";
    });
})();
