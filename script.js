/* =========================================================
   well well · estilos (estilo revista)
   Paleta: SOLO estos 4 colores.
   - Amaranth: texto, contornos y fondos oscuros
   - Chalk: papel / fondo principal
   - Brook Green: superficies
   - Pomelo Olive: detalles decorativos (no lleva texto encima)
   ========================================================= */
:root {
  --amaranth: #933B5B;
  --brook: #AABAAE;
  --chalk: #E3D6BF;
  --pomelo: #9F9679;

  /* Transcity se carga desde /fonts. Mientras no esté el archivo,
     se usa Fraunces (Google Fonts), que tiene un estilo parecido. */
  --serif: "Transcity", "Fraunces", Georgia, serif;
  --body: var(--serif);
  --radius: 6px;
  --shadow: 4px 5px 0 var(--amaranth);
  --shadow-sm: 2px 3px 0 var(--amaranth);
}

@font-face {
  font-family: "Transcity";
  src: url("fonts/Transcity-Regular.woff2") format("woff2"),
       url("fonts/Transcity-Regular.otf") format("opentype"),
       url("fonts/Transcity-Regular.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: var(--body);
  font-size: 18px;
  line-height: 1.5;
  font-synthesis: none; /* Transcity solo tiene "Regular": sin negritas ni cursivas falsas */
  color: var(--amaranth);
  background-color: var(--chalk);
  background-image: radial-gradient(var(--pomelo) 1px, transparent 1.3px);
  background-size: 24px 24px;
  min-height: 100vh;
  overflow-x: hidden;
}
h1, h2, h3, p { margin: 0; }
button { font: inherit; color: inherit; cursor: pointer; }
a { color: inherit; }
[hidden] { display: none !important; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
:focus-visible { outline: 3px dashed var(--amaranth); outline-offset: 3px; }

/* ---------- colores utilitarios ---------- */
.bg-chalk { background: var(--chalk); }
.bg-brook { background: var(--brook); }
.bg-pomelo { background: var(--pomelo); }
.bg-amaranth { background: var(--amaranth); color: var(--chalk); }
.bg-amaranth .ico, .bg-amaranth .stk { stroke: var(--chalk); }
.bg-amaranth .btn-ink { background: var(--chalk); color: var(--amaranth); border-color: var(--chalk); }
.bg-amaranth .btn-ghost { color: var(--chalk); border-color: var(--chalk); }
.bg-amaranth .progress { border-color: var(--chalk); background: var(--amaranth); }
.bg-amaranth .progress span { background: var(--chalk); }

/* ---------- toques de revista ---------- */
.kicker { font-family: var(--serif); text-transform: uppercase; letter-spacing: .22em; font-size: .78rem; font-weight: 700; }
.mag-h {
  font-family: var(--serif);
  font-style: italic;
  font-weight: 700;
  font-size: clamp(2rem, 5.5vw, 3.4rem);
  line-height: 1;
  letter-spacing: -.01em;
}
.mag-h::after { content: ""; display: block; width: 72px; height: 4px; margin-top: .5rem; background: var(--pomelo); }
.small { font-size: .85rem; }
.muted { opacity: .75; }
.center { text-align: center; }
.tilt-l { transform: rotate(-.8deg); }
.tilt-r { transform: rotate(.8deg); }

/* =========================================================
   LETRAS RECORTADAS
   ========================================================= */
.f-abril { font-family: "Abril Fatface", serif; }
.f-alfa { font-family: "Alfa Slab One", serif; }
.f-bebas { font-family: "Bebas Neue", sans-serif; }
.f-bowlby { font-family: "Bowlby One", sans-serif; }
.f-bungee { font-family: "Bungee", sans-serif; }
.f-rubik { font-family: "Rubik Mono One", sans-serif; font-size: .8em !important; }
.f-shrik { font-family: "Shrikhand", serif; }
.f-ultra { font-family: "Ultra", serif; }

.cut { display: inline-flex; flex-wrap: wrap; align-items: center; row-gap: .12em; line-height: 1; font-weight: 400; }
.cut-w { display: inline-flex; white-space: nowrap; filter: drop-shadow(2px 2px 0 var(--amaranth)); }
.cut-sp { display: inline-block; width: .35em; }
.cut-l {
  display: inline-block;
  font-size: var(--sz, 1em);
  padding: .08em .14em .04em;
  margin: 0 .015em;
  transform: rotate(var(--rot, 0)) translateY(var(--dy, 0));
  color: var(--amaranth);
  transition: transform .25s ease;
}
.cut-l.bg-amaranth { color: var(--chalk); }
a:hover .cut-l, button:hover .cut-l { transform: rotate(calc(var(--rot) * -1)) translateY(var(--dy, 0)); }

/* =========================================================
   BOTONES Y CONTROLES
   ========================================================= */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: .45rem;
  padding: .8rem 1.3rem;
  border: 3px solid var(--amaranth);
  border-radius: 4px;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: .02em;
  text-decoration: none;
  box-shadow: var(--shadow-sm);
  transition: transform .15s ease, box-shadow .15s ease;
  background: var(--chalk);
}
.btn:hover { transform: translate(-1px, -2px); box-shadow: 4px 5px 0 var(--amaranth); }
.btn:active { transform: translate(2px, 3px); box-shadow: 0 0 0 var(--amaranth); }
.btn:disabled { opacity: .6; cursor: wait; }
.btn-ink { background: var(--amaranth); color: var(--chalk); }
.btn-brook { background: var(--brook); }
.btn-ghost { background: transparent; }
.btn-small { padding: .45rem .9rem; font-size: .88rem; border-width: 2.5px; }
.btn-full { width: 100%; }
.btn .ico { width: 18px; height: 18px; stroke: currentColor; }

.link-btn { background: none; border: 0; padding: 0; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; font-weight: 600; font-size: .88rem; }

.pill {
  display: inline-flex; align-items: center; gap: .4rem;
  padding: .45rem .9rem;
  border: 2.5px solid var(--amaranth);
  border-radius: 999px;
  background: var(--chalk);
  font-weight: 600; font-size: .9rem;
}
.pill.on { background: var(--amaranth); color: var(--chalk); }
.pill .ico { width: 20px; height: 20px; }

.round-btn { width: 46px; height: 46px; border-radius: 50%; border: 3px solid var(--amaranth); background: var(--brook); font-size: 1.2rem; font-weight: 700; box-shadow: var(--shadow-sm); }
.round-btn:hover { background: var(--chalk); }

.ico { width: 40px; height: 40px; fill: none; stroke: var(--amaranth); stroke-width: 3.2; stroke-linecap: round; stroke-linejoin: round; flex: none; }

.tag { display: inline-block; padding: .05rem .5rem; border: 2px solid var(--amaranth); border-radius: 999px; font-size: .75rem; font-weight: 600; background: var(--chalk); text-transform: lowercase; }
.tag.big { font-size: .95rem; padding: .2rem .7rem; }

input, textarea {
  width: 100%;
  font: inherit; color: var(--amaranth);
  padding: .8rem 1rem;
  border: 3px solid var(--amaranth);
  border-radius: var(--radius);
  background: var(--chalk);
}
input::placeholder, textarea::placeholder { color: var(--amaranth); opacity: .5; }
label, .lbl { display: block; font-weight: 600; margin: 1rem 0 .4rem; }
.form-error { min-height: 1.3em; margin-top: .6rem; font-weight: 600; color: var(--amaranth); }
.form-error:not(:empty)::before { content: "✗ "; }

.paper {
  position: relative;
  background: var(--brook);
  border: 3px solid var(--amaranth);
  border-radius: var(--radius);
  padding: 1.6rem;
  box-shadow: var(--shadow);
}
.tape {
  position: absolute; top: -14px; left: 50%;
  width: 110px; height: 28px;
  transform: translateX(-50%) rotate(-3deg);
  background: var(--pomelo);
  border: 0;
  opacity: .85;
}

/* =========================================================
   NAVEGACIÓN
   ========================================================= */
.nav {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  padding: .7rem clamp(16px, 4vw, 48px);
  background: var(--chalk);
  border-bottom: 3px solid var(--amaranth);
}
.logo { text-decoration: none; font-size: clamp(1.15rem, 3.5vw, 2rem); flex: none; }
.logo .cut { flex-wrap: nowrap; }
.nav-link { white-space: nowrap; }
.nav-links { display: flex; align-items: center; gap: .6rem; }
.nav-link {
  display: inline-flex; align-items: center; gap: .4rem;
  padding: .5rem 1rem;
  border: 3px solid var(--amaranth);
  border-radius: 999px;
  text-decoration: none; font-weight: 600;
  background: var(--brook);
  box-shadow: var(--shadow-sm);
  transition: transform .15s ease;
}
.nav-link:hover { transform: rotate(-2deg) translateY(-2px); }
.nav-link.active { background: var(--chalk); }
.nav-cta { background: var(--amaranth); color: var(--chalk); }
.nav-cta.active { background: var(--amaranth); }
.nav-lupi { display: inline-flex; width: 24px; height: 24px; margin: -4px 0; }
.nav-lupi svg { width: 24px; height: 24px; }

/* =========================================================
   INICIO
   ========================================================= */
.view { padding: 0 clamp(16px, 4vw, 48px) 3rem; max-width: 1240px; margin: 0 auto; }
.view[data-view="home"] { max-width: none; padding-left: 0; padding-right: 0; }

.hero { position: relative; text-align: center; padding: clamp(2.5rem, 8vw, 5.5rem) 16px 2.5rem; }
.hero-title { display: flex; justify-content: center; width: 100%; font-size: clamp(2.4rem, 11vw, 8rem); }
.hero-title .cut { justify-content: center; flex-wrap: nowrap; }
.hero { min-height: min(62vh, 560px); display: flex; flex-direction: column; justify-content: center; align-items: center; }
.hero-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: .8rem; margin-top: 2.2rem; }
.hero-actions .btn { font-size: 1.05rem; padding: 1rem 1.6rem; }
.hero-stickers .sticker {
  position: absolute;
  padding: .45rem .9rem;
  border: 3px solid var(--amaranth);
  border-radius: 999px;
  font-weight: 700; font-size: .9rem;
  box-shadow: var(--shadow-sm);
  animation: bob 4s ease-in-out infinite;
}
.hero-stickers .sticker { font-family: var(--serif); font-style: italic; font-size: 1.05rem; }
.s-a { background: var(--brook); top: 18%; left: 7%; transform: rotate(-10deg); }
.s-b { background: var(--amaranth); color: var(--chalk); top: 30%; right: 6%; transform: rotate(8deg); animation-delay: -1.2s !important; }
.s-c { background: var(--chalk); bottom: 8%; left: 14%; transform: rotate(5deg); animation-delay: -2.4s !important; }
@keyframes bob { 50% { translate: 0 -8px; } }
@media (max-width: 1100px) { .hero-stickers { display: none; } }
.s-a { top: 10% !important; left: 4% !important; }
.s-b { top: 14% !important; right: 4% !important; }
.s-c { bottom: 6% !important; left: 8% !important; }

.marquee { overflow: hidden; border-block: 3px solid var(--amaranth); background: var(--pomelo); padding: .7rem 0; transform: rotate(-1.2deg); margin: 1rem -10px 3rem; }
.marquee-track { display: flex; width: max-content; gap: .8rem; align-items: center; animation: slide 36s linear infinite; }
.mq-item { padding: .2rem .9rem; border: 2.5px solid var(--amaranth); border-radius: 2px; font-weight: 700; font-style: italic; font-size: 1.1rem; white-space: nowrap; }
.mq-star { font-size: 1.3rem; color: var(--chalk); }
@keyframes slide { to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) { .marquee-track, .hero-stickers .sticker { animation: none; } }

.section-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; padding: 0 clamp(16px, 4vw, 48px); max-width: 1240px; margin: 0 auto 1.2rem; }
.section-head .kicker, .fold-wrap .kicker { display: block; margin-bottom: .4rem; }
.carousel-ctrl { display: flex; gap: .5rem; }

.carousel {
  display: flex; gap: 20px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 1.2rem max(16px, calc((100vw - 1240px) / 2 + 48px)) 1.6rem;
  scrollbar-width: none;
  cursor: grab;
}
.carousel::-webkit-scrollbar { display: none; }
.carousel.dragging { cursor: grabbing; scroll-snap-type: none; }
.carousel.dragging .slide { pointer-events: none; }
.slide {
  flex: 0 0 min(300px, 78vw);
  min-height: 340px;
  scroll-snap-align: center;
  display: flex; flex-direction: column; align-items: flex-start; gap: .8rem;
  padding: 1.5rem;
  text-align: left;
  border: 3px solid var(--amaranth);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transform: rotate(var(--tilt));
  transition: transform .2s ease;
}
.slide:hover { transform: rotate(0) translateY(-6px); }
.slide-ico { display: grid; place-items: center; width: 92px; height: 92px; border-radius: 50%; border: 3px solid var(--amaranth); background: var(--chalk); }
.slide-ico .ico { width: 54px; height: 54px; }
.slide-title { font-size: 2rem; font-weight: 700; font-style: italic; line-height: 1.05; margin-top: .4rem; }
.slide-line { font-size: 1.05rem; }
.slide-go { margin-top: auto; font-weight: 700; padding: .35rem .9rem; border: 2.5px solid currentColor; border-radius: 2px; text-transform: uppercase; letter-spacing: .15em; font-size: .8rem; }
.slide-ico .lupi-svg { width: 70px; height: 70px; }
.dots { display: flex; justify-content: center; gap: .5rem; }
.dot { width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid var(--amaranth); background: var(--chalk); padding: 0; }
.dot.on { background: var(--amaranth); width: 30px; border-radius: 999px; }

.fold-wrap { max-width: 1240px; margin: 4rem auto 0; padding: 0 clamp(16px, 4vw, 48px); }
.folds { display: grid; gap: 1rem; margin-top: 1.4rem; }
@media (min-width: 820px) { .folds { grid-template-columns: 1fr 1fr; align-items: start; } }
.fold { border: 3px solid var(--amaranth); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
.fold:nth-child(odd) { transform: rotate(-.6deg); }
.fold:nth-child(even) { transform: rotate(.6deg); }
.fold-btn { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 1.2rem 1.4rem; background: none; border: 0; font-size: clamp(1.4rem, 4vw, 1.9rem); font-weight: 700; font-style: italic; text-align: left; }
.fold.bg-amaranth .fold-plus { color: var(--amaranth); }
.fold-plus { display: grid; place-items: center; flex: none; width: 40px; height: 40px; border: 3px solid var(--amaranth); border-radius: 50%; background: var(--chalk); font-size: 1.5rem; font-weight: 700; transition: transform .25s ease; }
.fold.open .fold-plus { transform: rotate(45deg); }
.fold-body { display: flex; flex-wrap: wrap; gap: .6rem; padding: 0 1.4rem 1.4rem; animation: drop .25s ease; }
@keyframes drop { from { opacity: 0; transform: translateY(-6px); } }

.foot { text-align: center; padding: 4rem 16px 1rem; display: grid; gap: .8rem; justify-items: center; }
.foot-logo { font-size: 1.6rem; }

/* =========================================================
   ASISTENTE · LUPI
   ========================================================= */
.lupi-page { display: grid; gap: 2rem; padding-top: 2rem; }
@media (min-width: 960px) { .lupi-page { grid-template-columns: 1fr 1.05fr; align-items: start; } .lupi-stage { position: sticky; top: 100px; } }
.lupi-stage { display: flex; flex-direction: column; align-items: center; }
.lupi-big { width: 240px; max-width: 60vw; }
.lupi-big svg { width: 100%; height: auto; overflow: visible; }
.lupi-body { transform-origin: 100px 100px; animation: float 3.2s ease-in-out infinite; }
@keyframes float { 50% { transform: translateY(-8px) rotate(-3deg); } }
.lupi-eye { animation: blink 4.5s infinite; transform-box: fill-box; transform-origin: center; }
@keyframes blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(.1); } }
.lupi-eyes { transition: transform .2s ease; }
.lupi-mouth-open { opacity: 0; }
[data-state="thinking"] .lupi-body { animation: think .6s ease-in-out infinite alternate; }
@keyframes think { from { transform: rotate(-8deg); } to { transform: rotate(8deg) translateY(-6px); } }
[data-state="talking"] .lupi-mouth { opacity: 0; }
[data-state="talking"] .lupi-mouth-open { animation: talk .25s infinite alternate; }
@keyframes talk { from { opacity: 1; transform: scaleY(.4); } to { opacity: 1; transform: scaleY(1); } }
.lupi-mouth-open { transform-box: fill-box; transform-origin: center; }

.bubble {
  position: relative;
  width: 100%;
  max-width: 520px;
  margin-top: 1.4rem;
  padding: 1.4rem 1.6rem;
  border: 3px solid var(--amaranth);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
.bubble::before {
  content: ""; position: absolute; top: -22px; left: 50%;
  width: 34px; height: 34px;
  background: inherit;
  border-left: 3px solid var(--amaranth); border-top: 3px solid var(--amaranth);
  transform: translateX(-50%) rotate(45deg) skew(8deg, 8deg);
}
.bubble.pop { animation: pop .35s cubic-bezier(.3, 1.6, .5, 1); }
@keyframes pop { from { transform: scale(.85) rotate(-2deg); opacity: .4; } }
.bubble-term { font-family: var(--serif); font-weight: 700; font-style: italic; font-size: 1.8rem; line-height: 1.1; margin-bottom: .6rem; overflow-wrap: anywhere; }
.bubble-text p + p { margin-top: .6rem; }
.bubble-text { font-size: 1.05rem; }
.dots-loading { display: flex; gap: .4rem; padding: .6rem 0; }
.dots-loading span { width: 12px; height: 12px; border-radius: 50%; background: var(--amaranth); animation: bounce .9s infinite; }
.dots-loading span:nth-child(2) { animation-delay: .15s; }
.dots-loading span:nth-child(3) { animation-delay: .3s; }
@keyframes bounce { 50% { transform: translateY(-8px); } }

.lupi-panel h1 { font-size: clamp(2rem, 6vw, 3.4rem); }
.mode-switch { display: inline-flex; margin-top: 1.4rem; border: 3px solid var(--amaranth); border-radius: 999px; overflow: hidden; background: var(--chalk); }
.mode-btn { border: 0; padding: .55rem 1.1rem; font-weight: 600; background: none; }
.mode-btn.active { background: var(--brook); }
.lupi-form { display: flex; gap: .6rem; margin-top: 1rem; }
.lupi-form input { font-size: 1.1rem; background: var(--chalk); }
.lupi-form .btn { flex: none; }
@media (max-width: 520px) { .lupi-form { flex-direction: column; } }
.chips { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1rem; }
.chip { padding: .4rem .85rem; border: 2.5px solid var(--amaranth); border-radius: var(--radius); font-weight: 600; font-size: .9rem; box-shadow: var(--shadow-sm); transition: transform .15s; }
.chip:nth-child(odd) { transform: rotate(-2deg); }
.chip:nth-child(even) { transform: rotate(2deg); }
.chip:hover { transform: rotate(0) scale(1.06); }
.collection-head { display: flex; justify-content: space-between; align-items: center; margin-top: 2.4rem; }
.collection-head .mag-h { font-size: 1.8rem; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: .9rem; margin-top: 1rem; }
.term-card { aspect-ratio: 3 / 4; display: flex; align-items: flex-end; padding: .8rem; border: 3px solid var(--amaranth); border-radius: var(--radius); box-shadow: var(--shadow-sm); text-align: left; transform: rotate(var(--rot)); transition: transform .2s; font-family: var(--serif); font-size: 1.05rem; line-height: 1.15; overflow-wrap: anywhere; }
.term-card:hover { transform: rotate(0) translateY(-4px); }

/* =========================================================
   INGRESAR
   ========================================================= */
.login-page { max-width: 560px; margin: 0 auto; padding-top: 2.4rem; display: grid; gap: 1.6rem; justify-items: center; }
.login-page h1 { font-size: clamp(2.6rem, 9vw, 4.5rem); }
.role-pick { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; width: 100%; }
.role-card { display: grid; justify-items: center; gap: .4rem; padding: 1.2rem .6rem; border: 3px solid var(--amaranth); border-radius: var(--radius); background: var(--brook); box-shadow: var(--shadow-sm); font-size: clamp(1.1rem, 4vw, 1.5rem); transition: transform .15s; }
.role-card:first-child { transform: rotate(-1.5deg); }
.role-card:last-child { transform: rotate(1.5deg); background: var(--brook); }
.role-card.active { box-shadow: var(--shadow); outline: 4px solid var(--amaranth); outline-offset: 3px; }
.role-card:not(.active) { opacity: .7; }
.role-card small { font-size: .85rem; font-weight: 600; }
.login-form { width: 100%; }
.login-form input { font-size: 1.15rem; letter-spacing: .04em; }
.login-form .btn { margin-top: .6rem; font-size: 1.05rem; }
.hint { margin-top: 1rem; font-size: .85rem; line-height: 1.8; }

/* =========================================================
   APP (paciente y personal)
   ========================================================= */
.app-head { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem; padding: 1.8rem 0 1.2rem; }
.app-hello { font-size: clamp(2rem, 6vw, 3.4rem); }
.app-sub { font-weight: 500; margin-top: .4rem; }
.app-head-right { display: flex; gap: .6rem; align-items: center; }
.badge { padding: .25rem .7rem; border: 2.5px dashed var(--amaranth); border-radius: 999px; font-size: .8rem; font-weight: 700; background: var(--chalk); }

.tabs { display: flex; gap: .6rem; overflow-x: auto; padding: .4rem 4px 1rem; scrollbar-width: thin; }
.tab { flex: none; display: inline-flex; align-items: center; gap: .45rem; padding: .5rem .95rem .5rem .6rem; border: 3px solid var(--amaranth); border-radius: var(--radius); text-decoration: none; font-weight: 600; font-size: .92rem; box-shadow: var(--shadow-sm); transition: transform .15s; }
.tab .ico { width: 26px; height: 26px; }
.tab:hover { transform: translateY(-2px) rotate(-1deg); }
.tab.on { background: var(--amaranth); color: var(--chalk); }
.tab.on .ico { stroke: var(--chalk); }

.app-body { padding-top: 1rem; }
.sec-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.6rem; }
.sub { border-bottom: 2px solid var(--amaranth); padding-bottom: .3rem; font-size: 1.6rem; }
.sub { font-family: var(--serif); font-weight: 700; font-style: italic; font-size: 1.4rem; margin: 2.2rem 0 1rem; }
.filter { display: flex; flex-wrap: wrap; gap: .5rem; }

.card { display: block; padding: 1.3rem; border: 3px solid var(--amaranth); border-radius: var(--radius); box-shadow: var(--shadow); text-decoration: none; }
a.card:hover { transform: translateY(-3px) rotate(0); }
.card p + p { margin-top: .3rem; }
.card-k { font-family: var(--serif); font-size: .78rem; font-weight: 700; text-transform: uppercase; letter-spacing: .22em; margin-bottom: .5rem; padding-bottom: .35rem; border-bottom: 1.5px solid currentColor; }
.card-big { font-family: var(--serif); font-weight: 700; font-style: italic; font-size: 2.5rem; line-height: 1.05; }
.grid-hoy { display: grid; gap: 1.2rem; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
.grid-hoy .span-2 { grid-column: span 2; }
@media (max-width: 560px) { .grid-hoy .span-2 { grid-column: auto; } }
.grid-2 { display: grid; gap: 1.2rem; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
.progress { height: 16px; border: 2.5px solid var(--amaranth); border-radius: 999px; background: var(--chalk); overflow: hidden; margin: .5rem 0; }
.progress span { display: block; height: 100%; background: var(--amaranth); }

.faces { display: flex; gap: .3rem; flex-wrap: wrap; }
.face { width: 46px; height: 46px; padding: 0; border: 0; background: none; border-radius: 50%; transition: transform .15s; }
.face svg { width: 100%; height: 100%; }
.face:hover, .face.on { transform: scale(1.18) rotate(-6deg); }
.face.on { filter: drop-shadow(2px 3px 0 var(--amaranth)); }
.faces.big .face { width: 62px; height: 62px; }
.face.sm { width: 40px; height: 40px; display: inline-block; flex: none; }

/* línea del tiempo */
.timeline { list-style: none; margin: 0; padding: 0 0 0 8px; position: relative; }
.timeline::before { content: ""; position: absolute; left: 30px; top: 10px; bottom: 10px; border-left: 4px dashed var(--amaranth); }
.tl-item { position: relative; display: grid; grid-template-columns: 48px 1fr; gap: 1rem; margin-bottom: 1.4rem; }
.tl-dot { position: relative; z-index: 1; display: grid; place-items: center; width: 46px; height: 46px; border: 3px solid var(--amaranth); border-radius: 50%; font-family: var(--serif); box-shadow: var(--shadow-sm); }
.tl-item.hoy .tl-dot { animation: pulse 1.6s ease-in-out infinite; }
@keyframes pulse { 50% { transform: scale(1.15); } }
.tl-card { padding: 1.1rem 1.3rem; border: 3px solid var(--amaranth); border-radius: var(--radius); box-shadow: var(--shadow); display: grid; gap: .35rem; }
.tl-card h3 { font-family: var(--serif); font-weight: 700; font-style: italic; font-size: 1.3rem; }
.tl-when { font-size: .85rem; font-weight: 600; }
.tl-item.hecho .tl-card { opacity: .92; }

/* medicinas */
.dose-strip { display: flex; gap: .8rem; overflow-x: auto; padding: .3rem 4px 1.2rem; }
.dose { flex: none; display: grid; gap: .1rem; min-width: 140px; padding: .8rem 1rem; border: 3px solid var(--amaranth); border-radius: var(--radius); box-shadow: var(--shadow-sm); }
.dose-h { font-family: var(--serif); font-size: 1.6rem; line-height: 1; }
.med-grid { display: grid; gap: 1.6rem; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); margin-top: 1rem; }
.med { background: var(--chalk); display: grid; gap: .7rem; align-content: start; }
.med-top { display: flex; gap: .8rem; align-items: center; }
.med-top h3 { font-family: var(--serif); font-weight: 700; font-style: italic; font-size: 1.35rem; }
.pill-ico { display: grid; place-items: center; width: 56px; height: 56px; border: 3px solid var(--amaranth); border-radius: 50%; flex: none; }
.pill-ico .ico { width: 34px; height: 34px; }
.hours { display: flex; flex-wrap: wrap; gap: .4rem; }
.hour { padding: .2rem .7rem; border: 2.5px solid var(--amaranth); border-radius: 8px; background: var(--brook); font-weight: 700; }

/* citas */
.citas { display: grid; gap: 1.2rem; }
.cita { display: grid; grid-template-columns: 84px 1fr; gap: 1.1rem; padding: 1.1rem; border: 3px solid var(--amaranth); border-radius: var(--radius); box-shadow: var(--shadow); }
.cita:nth-child(odd) { transform: rotate(-.5deg); }
.cita.past { opacity: .75; box-shadow: var(--shadow-sm); }
.cita-date { display: grid; place-items: center; align-content: center; border: 3px solid var(--amaranth); border-radius: var(--radius); background: var(--chalk); height: 84px; }
.cd-day { font-family: var(--serif); font-size: 2rem; line-height: 1; }
.cd-mon { font-weight: 700; text-transform: uppercase; font-size: .85rem; }
.cita-info { display: grid; gap: .25rem; }
.cita-info h3 { font-family: var(--serif); font-weight: 700; font-style: italic; font-size: 1.25rem; }
.cita-actions { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .5rem; }
.past-box { margin-top: 2rem; }
.past-box summary { cursor: pointer; font-weight: 700; margin-bottom: 1rem; }

/* expediente */
.exp-grid { display: grid; gap: 1.4rem; }
@media (min-width: 820px) { .exp-grid { grid-template-columns: 1.3fr 1fr; } }
.id-card { background: var(--brook); }
.id-code { font-family: var(--serif); font-size: clamp(1.4rem, 5vw, 2.2rem); letter-spacing: .04em; margin-bottom: 1rem; }
.id-card dl { display: grid; grid-template-columns: auto 1fr; gap: .45rem 1rem; margin: 0; }
.id-card dt { font-weight: 700; }
.id-card dd { margin: 0; }
@media (max-width: 480px) { .id-card dl { grid-template-columns: 1fr; gap: 0; } .id-card dd { margin-bottom: .5rem; } }
.exp-side { display: grid; gap: 1.2rem; align-content: start; }
.docs { display: grid; gap: .8rem; }
.doc { border: 3px solid var(--amaranth); border-radius: var(--radius); padding: .9rem 1.1rem; box-shadow: var(--shadow-sm); }
.doc summary { cursor: pointer; display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
.doc p { margin: .8rem 0; }
.doc .btn { margin-right: .6rem; }

/* equipo */
.team { display: grid; gap: 1.4rem; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }
.person { display: grid; gap: .45rem; align-content: start; padding: 1.4rem; border: 3px solid var(--amaranth); border-radius: var(--radius); box-shadow: var(--shadow); }
.person h3 { font-family: var(--serif); font-weight: 700; font-style: italic; font-size: 1.3rem; }
.person .btn { justify-self: start; margin-top: .4rem; }
.avatar { display: grid; place-items: center; width: 64px; height: 64px; border: 3px solid var(--amaranth); border-radius: 50%; background: var(--chalk); font-family: var(--serif); font-size: 1.4rem; }
.why { padding: .5rem .7rem; border: 2px dashed var(--amaranth); border-radius: var(--radius); background: var(--chalk); }

/* mensajes */
.thread-box { background: var(--pomelo); padding: 1rem; display: grid; gap: 1rem; }
.thread { display: grid; gap: .9rem; align-content: start; max-height: 56vh; min-height: 280px; overflow-y: auto; padding: .6rem; }
.note { max-width: 78%; padding: .8rem 1rem; border: 3px solid var(--amaranth); border-radius: 4px 18px 18px 18px; background: var(--chalk); box-shadow: var(--shadow-sm); transform: rotate(-.6deg); }
.note.staff { background: var(--brook); }
.note.mine { justify-self: end; background: var(--amaranth); color: var(--chalk); border-radius: var(--radius) 4px 18px 18px; transform: rotate(.6deg); }
.note-who { font-weight: 700; font-size: .82rem; margin-bottom: .2rem; }
.note-who span { font-weight: 500; opacity: .75; margin-left: .3rem; }
.composer { display: flex; gap: .6rem; }
.composer input { background: var(--chalk); }
.composer .btn { flex: none; }

/* sala */
.sala-box { display: grid; gap: 1rem; padding: 1rem; border: 3px solid var(--amaranth); border-radius: var(--radius); background: var(--pomelo); box-shadow: var(--shadow); }
.sala-box > .small { color: var(--chalk); opacity: 1; }
.sala-wall { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 1rem; max-height: 58vh; min-height: 260px; overflow-y: auto; padding: .6rem; align-content: start; }
.postit { position: relative; display: grid; gap: .4rem; align-content: space-between; min-height: 130px; padding: .9rem; border: 3px solid var(--amaranth); border-radius: 4px; box-shadow: var(--shadow-sm); transform: rotate(var(--rot)); font-weight: 500; }
.postit.mine { outline: 3px dashed var(--amaranth); outline-offset: 3px; }
.postit-who { font-size: .75rem; font-weight: 700; }
.postit .stk { width: 72px; height: 72px; justify-self: center; }
.postit .del { justify-self: start; font-size: .75rem; }
.stk { stroke: var(--amaranth); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.stk-row { display: flex; gap: .5rem; flex-wrap: wrap; justify-content: center; }
.stk-btn { width: 54px; height: 54px; padding: 4px; border: 2.5px solid var(--amaranth); border-radius: 12px; background: var(--chalk); transition: transform .15s; }
.stk-btn:hover { transform: scale(1.12) rotate(-6deg); }
.stk-btn .stk { width: 100%; height: 100%; }

/* ánimo */
.animo-form { background: var(--chalk); max-width: 640px; }
.animo-form .btn { margin-top: 1.2rem; }
.animo-form textarea { resize: vertical; }
.range { -webkit-appearance: none; appearance: none; height: 18px; padding: 0; border-radius: 999px; background: linear-gradient(90deg, var(--brook), var(--pomelo), var(--amaranth)); }
.range::-webkit-slider-thumb { -webkit-appearance: none; width: 30px; height: 30px; border-radius: 50%; background: var(--amaranth); border: 3px solid var(--chalk); cursor: pointer; }
.range::-moz-range-thumb { width: 26px; height: 26px; border-radius: 50%; background: var(--amaranth); border: 3px solid var(--chalk); cursor: pointer; }
.animo-list { display: grid; gap: .7rem; }
.animo-row { display: grid; grid-template-columns: auto 1fr auto; gap: .9rem; align-items: center; padding: .7rem 1rem; border: 2.5px solid var(--amaranth); border-radius: var(--radius); background: var(--chalk); }

/* panel del personal */
.staff-grid { display: grid; gap: 1.6rem; }
@media (min-width: 900px) { .staff-grid { grid-template-columns: 280px 1fr; align-items: start; } .staff-list { position: sticky; top: 100px; } }
.staff-list { display: grid; gap: .7rem; }
.pt-btn { display: grid; gap: .1rem; text-align: left; padding: .8rem 1rem; border: 3px solid var(--amaranth); border-radius: var(--radius); box-shadow: var(--shadow-sm); }
.pt-btn.on { box-shadow: var(--shadow); outline: 3px solid var(--amaranth); outline-offset: 2px; }
.pt-head { padding: 1.2rem 1.4rem; border: 3px solid var(--amaranth); border-radius: var(--radius); box-shadow: var(--shadow); margin-bottom: 1.2rem; }
.pt-head h2 { font-family: var(--serif); font-weight: 700; font-style: italic; font-size: 1.6rem; }
.staff-tabs { margin-bottom: 1.2rem; }

/* toast */
.toast { position: fixed; left: 50%; bottom: 24px; z-index: 100; transform: translate(-50%, 140%); padding: .8rem 1.3rem; border: 3px solid var(--amaranth); border-radius: 999px; background: var(--amaranth); color: var(--chalk); font-weight: 600; box-shadow: var(--shadow-sm); transition: transform .3s cubic-bezier(.3, 1.4, .5, 1); max-width: calc(100vw - 32px); text-align: center; }
.toast.show { transform: translate(-50%, 0); }

@media (max-width: 560px) {
  .nav-link { padding: .4rem .7rem; font-size: .9rem; }
  .nav-lupi { display: none; }
  .note { max-width: 92%; }
  .cita { grid-template-columns: 64px 1fr; }
  .cita-date { height: 64px; }
  .cd-day { font-size: 1.5rem; }
  .composer { flex-direction: column; }
}

@media print {
  .nav, .tabs, .app-head-right, .btn, .link-btn, .toast { display: none !important; }
  body { background: none; }
}

/* nombres de rol en la pantalla de ingreso */
.role-name { font-family: var(--serif); font-weight: 700; font-style: italic; font-size: clamp(1.5rem, 5vw, 2.2rem); line-height: 1; }
.role-card small { text-transform: uppercase; letter-spacing: .2em; font-size: .72rem; }
.slide .kicker { opacity: .85; }
.mag-h + .filter, .sec-head .small { align-self: flex-end; }
.bg-amaranth .tag { color: var(--amaranth); }
.bg-amaranth .why { color: var(--amaranth); }
.bg-amaranth .avatar, .bg-amaranth .cita-date, .bg-amaranth .slide-ico { color: var(--amaranth); }
.bg-amaranth .slide-ico .ico, .bg-chalk .ico, .bg-brook .ico { stroke: var(--amaranth); }
/* =========================================================
   CARRUSEL ANIMADO · rumbo al alta
   ========================================================= */
.slide { cursor: inherit; min-height: 0; gap: .5rem; }
.scene { width: 100%; aspect-ratio: 3 / 2; background: var(--chalk); border: 3px solid var(--amaranth); border-radius: var(--radius); overflow: hidden; margin-bottom: .6rem; }
.scene svg { width: 100%; height: 100%; display: block; }
.scene * { transform-box: fill-box; }
.sc-z { font: 700 22px var(--serif); opacity: 0; animation: zz 3s ease-in infinite; }
.sc-z2 { animation-delay: 1.4s; }
@keyframes zz { 0% { opacity: 0; transform: translate(0, 10px); } 30% { opacity: 1; } 100% { opacity: 0; transform: translate(14px, -18px); } }
.sc-drip { animation: drip 1.6s ease-in infinite; }
@keyframes drip { 0% { transform: translateY(0); opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(26px); opacity: 0; } }
.sc-breathe { animation: breathe 3s ease-in-out infinite; transform-origin: center; }
@keyframes breathe { 50% { transform: translate(88px, 86px) scale(1.04); } 0%, 100% { transform: translate(88px, 88px); } }
.sc-bob { animation: bob2 2.4s ease-in-out infinite; }
@keyframes bob2 { 0%, 100% { transform: translate(110px, 86px); } 50% { transform: translate(110px, 78px); } }
.sc-beat { transform-origin: center; animation: beat 1s ease-in-out infinite; }
@keyframes beat { 0%, 100% { transform: scale(1); } 15% { transform: scale(1.18); } 30% { transform: scale(.96); } 45% { transform: scale(1.1); } }
.sc-ecg { stroke-dasharray: 420; stroke-dashoffset: 420; animation: ecg 2.6s linear infinite; }
@keyframes ecg { 70% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 0; opacity: 0; } }
.sc-grow { transform-origin: bottom; animation: grow 5s ease-out infinite; }
.sc-g2 { animation-delay: .25s; } .sc-g3 { animation-delay: .5s; } .sc-g4 { animation-delay: .75s; }
@keyframes grow { 0% { transform: scaleY(0); } 20%, 90% { transform: scaleY(1); } 100% { transform: scaleY(0); } }
.sc-climb { animation: climb 5s ease-in-out infinite; }
@keyframes climb {
  0%, 18% { transform: translate(62px, 122px); }
  34% { transform: translate(114px, 96px); }
  50% { transform: translate(166px, 70px); }
  66%, 90% { transform: translate(218px, 40px); }
  100% { transform: translate(62px, 122px); }
}
.sc-arrow { animation: arrow 1.2s ease-in-out infinite; }
@keyframes arrow { 50% { transform: translateY(-6px); } }
.sc-walk { animation: walk 5s ease-in-out infinite; }
@keyframes walk {
  0% { transform: translate(40px, 148px); opacity: 1; }
  10% { transform: translate(64px, 132px); } 20% { transform: translate(88px, 148px); }
  30% { transform: translate(112px, 132px); } 40% { transform: translate(136px, 148px); }
  50% { transform: translate(160px, 132px); } 60% { transform: translate(184px, 148px); }
  70% { transform: translate(230px, 148px); opacity: 1; }
  78%, 100% { transform: translate(230px, 148px); opacity: 0; }
}
.sc-door { transform-origin: left; animation: door 5s ease-in-out infinite; }
@keyframes door { 0%, 50% { transform: scaleX(1); } 62%, 88% { transform: scaleX(.12); } 100% { transform: scaleX(1); } }
.sc-confetti { animation: confetti 2.8s linear infinite; transform-origin: center; }
@keyframes confetti { 0% { transform: translateY(0) rotate(0); } 100% { transform: translateY(215px) rotate(540deg); } }
@media (prefers-reduced-motion: reduce) { .scene * { animation: none !important; } }
