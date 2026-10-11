/* guide.js — テーマ色の引き継ぎ(アプリと同じlocalStorage 'qn_theme')と画像の拡大表示 */
(function () {
  "use strict";
  var THEMES = {"red-light":"#f87171","red":"#ef4444","red-dark":"#b91c1c","orange-light":"#fb923c","orange":"#f97316","orange-dark":"#c2410c","amber-light":"#fbbf24","amber":"#f59e0b","amber-dark":"#b45309","lime-light":"#a3e635","lime":"#84cc16","lime-dark":"#4d7c0f","emerald-light":"#34d399","emerald":"#10b981","emerald-dark":"#047857","teal-light":"#2dd4bf","teal":"#14b8a6","teal-dark":"#0f766e","cyan-light":"#22d3ee","cyan":"#06b6d4","cyan-dark":"#0e7490","sky-light":"#38bdf8","sky":"#0ea5e9","sky-dark":"#0369a1","blue-light":"#60a5fa","blue":"#3b82f6","blue-dark":"#1d4ed8","indigo-light":"#818cf8","indigo":"#6366f1","indigo-dark":"#4338ca","purple-light":"#a78bfa","purple":"#8b5cf6","purple-dark":"#6d28d9","violet-light":"#c084fc","violet":"#a855f7","violet-dark":"#7e22ce","pink-light":"#f472b6","pink":"#ec4899","pink-dark":"#be185d","rose-light":"#fb7185","rose":"#f43f5e","rose-dark":"#be123c"};
  try {
    var name = localStorage.getItem("qn_theme");
    var c = name && THEMES[name];
    if (c) {
      var r = document.documentElement.style;
      r.setProperty("--accent-primary", c);
      r.setProperty("--accent-secondary", c);
    }
  } catch (e) {}

  var box = document.createElement("div");
  box.className = "g-lightbox";
  var big = document.createElement("img");
  box.appendChild(big);
  document.addEventListener("DOMContentLoaded", function () { document.body.appendChild(box); });
  box.addEventListener("click", function () { box.classList.remove("is-open"); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") box.classList.remove("is-open"); });
  document.addEventListener("click", function (e) {
    var img = e.target && e.target.closest ? e.target.closest(".g-fig img") : null;
    if (!img) return;
    big.src = img.currentSrc || img.src;
    big.alt = img.alt || "";
    box.classList.add("is-open");
  });
})();
