/* =========================================================
   Letras recortadas de revista
   Cualquier elemento con data-cut="texto" se convierte en
   letras de papel recortado. data-seed lo hace estable.
   ========================================================= */
(function () {
  const FONTS = ["f-abril", "f-alfa", "f-bebas", "f-bowlby", "f-bungee", "f-rubik", "f-shrik", "f-ultra"];
  const BGS = ["chalk", "brook", "pomelo", "amaranth", "chalk", "amaranth"];

  // Generador pseudoaleatorio con semilla (siempre igual para el mismo texto)
  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => {
      s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
      return ((s >>> 0) % 10000) / 10000;
    };
  }
  function hash(str) {
    let h = 2166136261;
    for (const c of str) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function jag(r) {
    // Bordes irregulares, como cortados con tijera
    const p = () => (r() * 7).toFixed(1);
    return `polygon(${p()}% ${p()}%, ${100 - p()}% ${p()}%, ${100 - p()}% ${100 - p()}%, ${p()}% ${100 - p()}%)`;
  }

  function cut(el) {
    const text = el.dataset.cut;
    if (text == null) return;
    const r = rng(hash(text) + Number(el.dataset.seed || 0) * 977);
    el.textContent = "";
    el.classList.add("cut");
    el.setAttribute("aria-label", text);
    if (!el.getAttribute("role") && !/^H\d$/.test(el.tagName)) el.setAttribute("role", "text");

    let prevBg = "";
    text.split(" ").forEach((word, wi) => {
      if (wi > 0) {
        const sp = document.createElement("span");
        sp.className = "cut-sp";
        sp.setAttribute("aria-hidden", "true");
        el.appendChild(sp);
      }
      const w = document.createElement("span");
      w.className = "cut-w";
      w.setAttribute("aria-hidden", "true");
      for (const ch of word) {
        const l = document.createElement("span");
        let bg;
        do { bg = BGS[Math.floor(r() * BGS.length)]; } while (bg === prevBg);
        prevBg = bg;
        const font = FONTS[Math.floor(r() * FONTS.length)];
        const upper = r() > 0.45;
        l.className = `cut-l bg-${bg} ${font}`;
        l.textContent = upper ? ch.toUpperCase() : ch;
        l.style.setProperty("--rot", `${(r() * 14 - 7).toFixed(1)}deg`);
        l.style.setProperty("--dy", `${(r() * 8 - 4).toFixed(1)}%`);
        l.style.setProperty("--sz", `${(0.86 + r() * 0.3).toFixed(2)}em`);
        l.style.clipPath = jag(r);
        w.appendChild(l);
      }
      el.appendChild(w);
    });
  }

  function cutAll(root) {
    (root || document).querySelectorAll("[data-cut]").forEach(cut);
  }

  window.Cutout = { cut, cutAll };
  document.addEventListener("DOMContentLoaded", () => cutAll());
})();
