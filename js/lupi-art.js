/* =========================================================
   Lupi: una carita feliz. Solo usa los colores de la paleta.
   (las clases lupi-* permiten parpadear, pensar y "hablar")
   ========================================================= */
window.lupiSVG = function (size) {
  const s = size || 200;
  return `
<svg class="lupi-svg" viewBox="0 0 200 200" width="${s}" height="${s}" aria-hidden="true">
  <g class="lupi-body">
    <circle cx="100" cy="100" r="88" fill="var(--brook)" stroke="var(--amaranth)" stroke-width="7"/>
    <g class="lupi-eyes">
      <ellipse class="lupi-eye" cx="72" cy="84" rx="9" ry="13" fill="var(--amaranth)"/>
      <ellipse class="lupi-eye" cx="128" cy="84" rx="9" ry="13" fill="var(--amaranth)"/>
    </g>
    <path class="lupi-mouth" d="M62 118 q38 40 76 0" fill="none" stroke="var(--amaranth)" stroke-width="8" stroke-linecap="round"/>
    <ellipse class="lupi-mouth-open" cx="100" cy="128" rx="18" ry="14" fill="var(--amaranth)"/>
  </g>
</svg>`;
};
