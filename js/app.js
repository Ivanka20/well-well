/* =========================================================
   well well · interfaz
   Rutas:  #/            inicio
           #/asistente   Lupi
           #/ingresar    acceso con ID
           #/app/<sec>   paciente o familiar
           #/personal    personal médico
   ========================================================= */
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const COLORS = ["brook", "amaranth", "chalk"];

  /* ---------- formato de fechas ---------- */
  const fFecha = (d) => new Date(d).toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });
  const fHora = (d) => new Date(d).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  const fDia = (d) => new Date(d + (String(d).length === 10 ? "T12:00:00" : "")).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
  function cuando(d) {
    const now = new Date(); const t = new Date(d);
    const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const b = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    const days = Math.round((b - a) / 86400000);
    if (days === 0) return "hoy";
    if (days === 1) return "mañana";
    if (days === -1) return "ayer";
    if (days > 1) return `en ${days} días`;
    return `hace ${-days} días`;
  }
  function edad(fn) {
    if (!fn) return "";
    const b = new Date(fn + "T12:00:00"), n = new Date();
    let e = n.getFullYear() - b.getFullYear();
    if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) e--;
    return e + " años";
  }

  /* ---------- íconos (trazos en tinta) ---------- */
  const I = {
    linea: '<path d="M8 6v36M8 12h10M8 24h18M8 36h12"/><circle cx="24" cy="12" r="4"/><circle cx="32" cy="24" r="4"/><circle cx="26" cy="36" r="4"/>',
    medicinas: '<rect x="6" y="18" width="36" height="14" rx="7" transform="rotate(-35 24 25)"/><path d="M20 15l10 16"/>',
    citas: '<rect x="6" y="10" width="36" height="32" rx="5"/><path d="M6 20h36M16 6v8M32 6v8"/><circle cx="24" cy="31" r="4"/>',
    expediente: '<path d="M6 14a4 4 0 0 1 4-4h10l4 5h14a4 4 0 0 1 4 4v19a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z"/><path d="M16 28h16M16 34h10"/>',
    equipo: '<circle cx="17" cy="16" r="6"/><circle cx="33" cy="18" r="5"/><path d="M5 40c0-7 6-12 12-12s12 5 12 12M28 40c0-6 3-10 8-10s8 4 8 10"/>',
    mensajes: '<path d="M6 10h36v22H20l-9 8v-8H6z"/><path d="M14 18h20M14 24h12"/>',
    sala: '<circle cx="16" cy="18" r="9"/><circle cx="32" cy="28" r="9"/><path d="M13 18h.01M19 18h.01M29 28h.01M35 28h.01"/>',
    animo: '<circle cx="24" cy="24" r="17"/><path d="M17 28q7 7 14 0M18 19h.01M30 19h.01"/>',
    hoy: '<circle cx="24" cy="24" r="8"/><path d="M24 4v6M24 38v6M4 24h6M38 24h6M10 10l4 4M34 34l4 4M38 10l-4 4M14 34l-4 4"/>',
    lupi: '<circle cx="20" cy="20" r="13"/><path d="M30 30l12 12"/>',
  };
  const icon = (k, cls) => `<svg class="ico ${cls || ""}" viewBox="0 0 48 48" aria-hidden="true">${I[k] || ""}</svg>`;

  const STICKERS = {
    star: '<path d="M24 4l6 13 14 2-10 10 3 14-13-7-13 7 3-14L4 19l14-2z" fill="var(--chalk)"/>',
    heart: '<path d="M24 42S6 30 6 17a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 13-18 25-18 25z" fill="var(--amaranth)"/>',
    sun: '<circle cx="24" cy="24" r="10" fill="var(--chalk)"/><path d="M24 3v7M24 38v7M3 24h7M38 24h7M9 9l5 5M34 34l5 5M39 9l-5 5M14 34l-5 5"/>',
    smile: '<circle cx="24" cy="24" r="18" fill="var(--pomelo)"/><path d="M16 27q8 8 16 0M18 19h.01M30 19h.01"/>',
    cloud: '<path d="M14 36a9 9 0 0 1 0-18 12 12 0 0 1 22 2 8 8 0 0 1-1 16z" fill="var(--brook)"/>',
  };
  const sticker = (k) => `<svg class="stk" viewBox="0 0 48 48" aria-label="sticker">${STICKERS[k] || ""}</svg>`;

  /* ---------- toast ---------- */
  let toastT;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2600);
  }

  /* =========================================================
     INICIO: marquesina, carrusel y desplegables
     ========================================================= */
  /* ---- Carrusel animado: del ingreso al alta ---- */
  const A = "var(--amaranth)", B = "var(--brook)", C = "var(--chalk)", P = "var(--pomelo)";
  // carita feliz (el mismo personaje de Lupi) en (x, y) con radio r
  const face = (x, y, r, cls) => `
    <g class="${cls || ""}" transform="translate(${x} ${y})">
      <circle r="${r}" fill="${B}" stroke="${A}" stroke-width="${r / 7}"/>
      <ellipse cx="${-r * 0.32}" cy="${-r * 0.15}" rx="${r * 0.1}" ry="${r * 0.15}" fill="${A}" class="sc-eye"/>
      <ellipse cx="${r * 0.32}" cy="${-r * 0.15}" rx="${r * 0.1}" ry="${r * 0.15}" fill="${A}" class="sc-eye"/>
      <path d="M${-r * 0.42} ${r * 0.2} q${r * 0.42} ${r * 0.45} ${r * 0.84} 0" fill="none" stroke="${A}" stroke-width="${r / 8}" stroke-linecap="round"/>
    </g>`;

  const SCENES = [
    {
      title: "Llegas", line: "Te recibimos y te explicamos todo, sin prisa.",
      svg: `
        <rect x="40" y="120" width="220" height="14" rx="4" fill="${P}"/>
        <rect x="40" y="96" width="14" height="60" rx="4" fill="${A}"/>
        <rect x="246" y="108" width="14" height="48" rx="4" fill="${A}"/>
        <rect x="58" y="98" width="56" height="24" rx="10" fill="${C}" stroke="${A}" stroke-width="4"/>
        ${face(88, 88, 22, "sc-breathe")}
        <path d="M110 104 h136 v18 h-136z" fill="${B}" stroke="${A}" stroke-width="4" class="sc-blanket"/>
        <line x1="270" y1="30" x2="270" y2="156" stroke="${A}" stroke-width="5" stroke-linecap="round"/>
        <rect x="258" y="34" width="24" height="32" rx="6" fill="${C}" stroke="${A}" stroke-width="4"/>
        <circle cx="270" cy="76" r="3.5" fill="${A}" class="sc-drip"/>
        <text x="120" y="60" class="sc-z" fill="${A}">z</text>
        <text x="138" y="44" class="sc-z sc-z2" fill="${A}">z</text>`,
    },
    {
      title: "Te cuidamos", line: "Tu equipo está contigo de día y de noche.",
      svg: `
        ${face(110, 86, 42, "sc-bob")}
        <path d="M215 72 c0-14 22-18 26-2 c4-16 26-12 26 2 c0 20-26 34-26 34 s-26-14-26-34z" fill="${A}" class="sc-beat"/>
        <polyline points="20,160 90,160 105,136 120,182 138,124 152,160 280,160" fill="none" stroke="${A}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" class="sc-ecg"/>`,
    },
    {
      title: "Vas mejorando", line: "Cada día, un pasito más arriba.",
      svg: `
        <rect x="40" y="140" width="44" height="30" fill="${P}" class="sc-grow"/>
        <rect x="92" y="114" width="44" height="56" fill="${B}" stroke="${A}" stroke-width="4" class="sc-grow sc-g2"/>
        <rect x="144" y="88" width="44" height="82" fill="${P}" class="sc-grow sc-g3"/>
        <rect x="196" y="58" width="44" height="112" fill="${A}" class="sc-grow sc-g4"/>
        <line x1="30" y1="170" x2="270" y2="170" stroke="${A}" stroke-width="5" stroke-linecap="round"/>
        <g class="sc-climb">${face(0, 0, 18)}</g>
        <path d="M250 50 l14 -16 l14 16 M264 34 v40" fill="none" stroke="${A}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" class="sc-arrow"/>`,
    },
    {
      title: "¡De alta!", line: "De regreso a casa. ¡Lo lograste!",
      svg: `
        <path d="M180 80 l50 -40 l50 40 v90 h-100z" fill="${B}" stroke="${A}" stroke-width="5" stroke-linejoin="round"/>
        <rect x="212" y="114" width="36" height="56" fill="${C}" stroke="${A}" stroke-width="4"/>
        <rect x="212" y="114" width="36" height="56" fill="${A}" class="sc-door"/>
        <line x1="20" y1="170" x2="290" y2="170" stroke="${A}" stroke-width="5" stroke-linecap="round"/>
        <g class="sc-walk">${face(0, 0, 22)}</g>
        ${[[30, P], [70, A], [110, B], [150, P], [190, A], [250, B], [280, P]].map(([x, c], k) => `<rect x="${x}" y="-12" width="8" height="12" rx="2" fill="${c}" class="sc-confetti" style="animation-delay:${(k * 0.35).toFixed(2)}s"/>`).join("")}`,
    },
  ];

  function buildHome() {
    const words = ["paso a paso", "cada día mejor", "tu equipo contigo", "sin palabras raras", "ya casi", "rumbo a casa"];
    const strip = words.map((w, i) => `<span class="mq-item bg-${COLORS[i % COLORS.length]}">${w}</span><span class="mq-star">✶</span>`).join("");
    $("#marqueeTrack").innerHTML = strip + strip;

    $("#carousel").innerHTML = SCENES.map((s, i) => `
      <article class="slide bg-${COLORS[i % COLORS.length]}" style="--tilt:${i % 2 ? 1.2 : -1.2}deg">
        <div class="scene"><svg viewBox="0 0 300 200" aria-hidden="true">${s.svg}</svg></div>
        <span class="kicker">Paso ${i + 1} de ${SCENES.length}</span>
        <h3 class="slide-title">${esc(s.title)}</h3>
        <p class="slide-line">${esc(s.line)}</p>
      </article>`).join("");
    $("#carDots").innerHTML = SCENES.map((_, i) => `<button class="dot" data-i="${i}" aria-label="Ir al paso ${i + 1}"></button>`).join("");

    const car = $("#carousel");
    const step = () => { const s = car.querySelector(".slide"); return s ? s.getBoundingClientRect().width + 20 : 300; };
    $("#carPrev").onclick = () => car.scrollBy({ left: -step(), behavior: "smooth" });
    $("#carNext").onclick = () => {
      const end = car.scrollLeft + car.clientWidth >= car.scrollWidth - 8;
      end ? car.scrollTo({ left: 0, behavior: "smooth" }) : car.scrollBy({ left: step(), behavior: "smooth" });
    };
    $("#carDots").onclick = (e) => { const d = e.target.closest(".dot"); if (d) car.scrollTo({ left: step() * +d.dataset.i, behavior: "smooth" }); };
    car.addEventListener("scroll", () => {
      const i = Math.round(car.scrollLeft / step());
      $$(".dot", $("#carDots")).forEach((d, j) => d.classList.toggle("on", i === j));
    }, { passive: true });
    $$(".dot", $("#carDots"))[0].classList.add("on");

    // arrastrar con el mouse
    let down = false, sx = 0, sl = 0, moved = false;
    car.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl = car.scrollLeft; car.classList.add("dragging"); });
    window.addEventListener("pointermove", (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) moved = true; car.scrollLeft = sl - dx; });
    window.addEventListener("pointerup", () => { down = false; car.classList.remove("dragging"); });
    car.addEventListener("click", (e) => { if (moved) { e.preventDefault(); moved = false; } });

    // avance automático (se detiene al interactuar)
    let auto = setInterval(() => { if (document.visibilityState === "visible" && currentView === "home") $("#carNext").click(); }, 5000);
    ["pointerdown", "wheel", "keydown", "focusin"].forEach((ev) => car.addEventListener(ev, () => { clearInterval(auto); }, { passive: true }));

    // desplegables
    const FOLDS = [
      { t: "estoy internado", c: "amaranth", go: ["linea", "medicinas", "sala", "animo"] },
      { t: "tengo citas", c: "brook", go: ["citas", "medicinas", "equipo", "expediente"] },
      { t: "soy familiar", c: "chalk", go: ["linea", "equipo", "mensajes", "citas"] },
      { t: "soy personal médico", c: "brook", go: ["personal"] },
    ];
    const label = { linea: "Línea del tiempo", medicinas: "Medicinas", sala: "La sala", animo: "¿Cómo me siento?", citas: "Citas", equipo: "Mi equipo", expediente: "Expediente", mensajes: "Mensajes", personal: "Entrar al panel del personal" };
    $("#folds").innerHTML = FOLDS.map((f, i) => `
      <div class="fold bg-${COLORS[(i + 1) % COLORS.length]}">
        <button class="fold-btn" aria-expanded="false" aria-controls="fold${i}">
          <span>${f.t.charAt(0).toUpperCase() + f.t.slice(1)}</span><span class="fold-plus" aria-hidden="true">+</span>
        </button>
        <div class="fold-body" id="fold${i}" hidden>
          ${f.go.map((g) => `<button class="pill" data-go="${g}">${icon(g === "personal" ? "equipo" : g)}${label[g]}</button>`).join("")}
        </div>
      </div>`).join("");
    Cutout.cutAll($("#folds"));
    $("#folds").addEventListener("click", (e) => {
      const b = e.target.closest(".fold-btn");
      if (b) {
        const open = b.getAttribute("aria-expanded") === "true";
        b.setAttribute("aria-expanded", !open);
        b.nextElementSibling.hidden = open;
        b.parentElement.classList.toggle("open", !open);
        return;
      }
      const p = e.target.closest(".pill");
      if (p) p.dataset.go === "personal" ? goLogin("personal", "#/personal") : goApp(p.dataset.go);
    });
  }

  /* =========================================================
     RUTAS
     ========================================================= */
  let currentView = "home";
  let pending = null;
  let unsub = null;

  function goApp(sec) {
    const s = Store.state;
    if (s.role === "paciente") location.hash = "#/app/" + sec;
    else if (s.role === "personal") location.hash = "#/personal";
    else goLogin("paciente", "#/app/" + sec);
  }
  function goLogin(role, next) {
    pending = next || null;
    setRole(role);
    location.hash = "#/ingresar";
  }

  function show(view) {
    currentView = view;
    $$(".view").forEach((v) => (v.hidden = v.dataset.view !== view));
    $$(".nav-link").forEach((a) => a.classList.toggle("active", a.dataset.nav === view || (a.dataset.nav === "ingresar" && (view === "app" || view === "personal"))));
    window.scrollTo({ top: 0 });
  }

  function route() {
    const parts = location.hash.replace(/^#\/?/, "").split("/");
    const s = Store.state;
    if (unsub && parts[0] !== "app" && parts[0] !== "personal") { unsub(); unsub = null; }
    switch (parts[0]) {
      case "asistente": show("asistente"); break;
      case "ingresar":
        if (s.role === "paciente") { location.replace("#/app/hoy"); return; }
        if (s.role === "personal") { location.replace("#/personal"); return; }
        show("ingresar"); break;
      case "app":
        if (s.role !== "paciente") { goLogin("paciente", location.hash); return; }
        show("app"); renderApp(parts[1] || "hoy"); break;
      case "personal":
        if (s.role !== "personal") { goLogin("personal", "#/personal"); return; }
        show("personal"); renderStaff(); break;
      default: show("home");
    }
    updateNav();
  }

  function updateNav() {
    const s = Store.state;
    const a = $("#navIngresar");
    if (s.role === "paciente") { a.textContent = "Mi espacio"; a.href = "#/app/hoy"; }
    else if (s.role === "personal") { a.textContent = "Mi panel"; a.href = "#/personal"; }
    else { a.textContent = "Ingresar"; a.href = "#/ingresar"; }
  }

  /* =========================================================
     INGRESAR
     ========================================================= */
  let loginRole = "paciente";
  function setRole(role) {
    loginRole = role;
    $$(".role-card").forEach((c) => { const on = c.dataset.role === role; c.classList.toggle("active", on); c.setAttribute("aria-selected", on); });
    $("#loginIdLabel").textContent = role === "paciente" ? "ID de paciente" : "ID de personal médico";
    $("#loginId").placeholder = role === "paciente" ? "WW-0000-00" : "MED-0000";
    $("#loginError").textContent = "";
    $("#loginHint").innerHTML = role === "paciente"
      ? `Prueba: <button type="button" class="link-btn" data-demo="WW-2048-17|123456">WW-2048-17</button> (internada) · <button type="button" class="link-btn" data-demo="WW-3301-09|123456">WW-3301-09</button> (con citas) · código 123456`
      : `Prueba: <button type="button" class="link-btn" data-demo="MED-0042|med2026">MED-0042</button> · <button type="button" class="link-btn" data-demo="ENF-0107|med2026">ENF-0107</button> · código med2026`;
  }

  function initLogin() {
    $$(".role-card").forEach((c) => c.addEventListener("click", () => setRole(c.dataset.role)));
    $("#loginHint").addEventListener("click", (e) => {
      const b = e.target.closest("[data-demo]"); if (!b) return;
      const [id, code] = b.dataset.demo.split("|");
      $("#loginId").value = id; $("#loginCode").value = code;
    });
    $("#loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = $("#loginBtn");
      btn.disabled = true; btn.textContent = "Entrando…";
      $("#loginError").textContent = "";
      try {
        await Store.login(loginRole, $("#loginId").value, $("#loginCode").value);
        $("#loginForm").reset();
        const next = pending; pending = null;
        location.hash = Store.state.role === "personal" ? "#/personal" : (next && next.startsWith("#/app") ? next : "#/app/hoy");
      } catch (ex) {
        $("#loginError").textContent = ex.message || "No se pudo entrar.";
      } finally {
        btn.disabled = false; btn.textContent = "Entrar";
      }
    });
    setRole("paciente");
  }

  async function doLogout() {
    if (unsub) { unsub(); unsub = null; }
    await Store.logout();
    location.hash = "#/";
    toast("Sesión cerrada");
  }

  /* =========================================================
     APP DEL PACIENTE
     ========================================================= */
  const TABS = [
    ["hoy", "Hoy", "chalk"], ["linea", "Línea del tiempo", "amaranth"], ["medicinas", "Medicinas", "brook"],
    ["citas", "Citas", "brook"], ["expediente", "Expediente", "chalk"], ["equipo", "Mi equipo", "chalk"],
    ["mensajes", "Mensajes", "brook"], ["sala", "La sala", "amaranth"], ["animo", "¿Cómo me siento?", "brook"],
  ];
  let salaRoom = "juegos";

  function renderApp(sec) {
    const p = Store.state.me;
    if (!TABS.some((t) => t[0] === sec)) sec = "hoy";
    $("#appHello").innerHTML = "";
    const hello = document.createElement("span");
    hello.dataset.cut = `hola ${(p.apodo || p.nombre.split(" ")[0]).toLowerCase()}`;
    hello.dataset.seed = "5";
    $("#appHello").appendChild(hello);
    Cutout.cut(hello);
    $("#appSub").textContent = [p.hospital, p.cuarto ? "Cuarto " + p.cuarto : p.area, p.codigo].filter(Boolean).join(" · ");
    $("#modeBadge").hidden = Store.state.mode !== "demo";

    $("#appTabs").innerHTML = TABS.map(([k, t, c]) => `<a href="#/app/${k}" class="tab bg-${c} ${k === sec ? "on" : ""}">${icon(k)}<span>${t}</span></a>`).join("");
    const on = $(".tab.on", $("#appTabs")); if (on) on.scrollIntoView({ inline: "center", block: "nearest" });

    const body = $("#appBody");
    body.dataset.sec = sec;
    ({ hoy: secHoy, linea: secLinea, medicinas: secMeds, citas: secCitas, expediente: secExpediente, equipo: secEquipo, mensajes: secMensajes, sala: secSala, animo: secAnimo })[sec](body, p);
    Cutout.cutAll(body);

    if (!unsub) unsub = Store.subscribe(() => {
      const cur = $("#appBody").dataset.sec;
      if (currentView === "app" && (cur === "mensajes" || cur === "sala" || cur === "animo")) refreshLive(cur);
      if (currentView === "personal") refreshStaffLive();
    });
  }

  function refreshLive(sec) {
    const p = Store.state.me;
    if (sec === "mensajes") loadThread($("#thread"), p);
    if (sec === "sala") loadSala();
    if (sec === "animo") loadAnimo($("#animoList"), p);
  }

  /* ---- próxima toma de medicina ---- */
  function nextDoses(p, limit) {
    const now = new Date(); const out = [];
    for (let d = 0; d < 2; d++) {
      p.medicamentos.forEach((m) => {
        (m.horarios || []).forEach((h) => {
          if (!/^\d{1,2}:\d{2}$/.test(h)) return;
          const [hh, mm] = h.split(":").map(Number);
          const t = new Date(); t.setDate(t.getDate() + d); t.setHours(hh, mm, 0, 0);
          const hasta = m.hasta ? new Date(m.hasta + "T23:59:00") : null;
          if (t > now && (!hasta || t <= hasta)) out.push({ m, t });
        });
      });
    }
    return out.sort((a, b) => a.t - b.t).slice(0, limit || 3);
  }

  function secHoy(body, p) {
    const dose = nextDoses(p, 1)[0];
    const cita = p.citas.filter((c) => new Date(c.inicio) > new Date()).sort((a, b) => new Date(a.inicio) - new Date(b.inicio))[0];
    const hoy = p.procedimientos.filter((x) => x.estado === "hoy");
    const hechos = p.procedimientos.filter((x) => x.estado === "hecho").length;
    const pct = p.procedimientos.length ? Math.round((hechos / p.procedimientos.length) * 100) : 0;

    body.innerHTML = `
      <div class="grid-hoy">
        <a href="#/app/medicinas" class="card bg-brook tilt-l">
          <p class="card-k">próxima medicina</p>
          ${dose ? `<p class="card-big">${fHora(dose.t)}</p><p><strong>${esc(dose.m.nombre)}</strong> · ${esc(dose.m.dosis)}</p><p class="small">${esc(dose.m.para_que)}</p>` : `<p class="card-big">—</p><p>No hay tomas pendientes.</p>`}
        </a>
        <a href="#/app/citas" class="card bg-brook tilt-r">
          <p class="card-k">próxima cita</p>
          ${cita ? `<p class="card-big">${cuando(cita.inicio)}</p><p><strong>${esc(cita.titulo)}</strong></p><p class="small">${fFecha(cita.inicio)} · ${fHora(cita.inicio)} · ${esc(cita.lugar)}</p>` : `<p class="card-big">—</p><p>Sin citas próximas.</p>`}
        </a>
        <a href="#/app/linea" class="card bg-amaranth tilt-l">
          <p class="card-k">tu camino</p>
          <p class="card-big">${pct}%</p>
          <div class="progress"><span style="width:${pct}%"></span></div>
          <p class="small">${hechos} de ${p.procedimientos.length} pasos listos</p>
        </a>
        <div class="card bg-chalk tilt-r span-2">
          <p class="card-k">hoy toca</p>
          ${hoy.length ? hoy.map((x) => `<p><strong>${fHora(x.fecha)}</strong> · ${esc(x.titulo)} <span class="small">(${esc(x.lugar)})</span></p>`).join("") : `<p>Hoy no hay procedimientos. ¡A descansar!</p>`}
        </div>
        <div class="card bg-chalk tilt-l">
          <p class="card-k">¿cómo te sientes?</p>
          <div class="faces">${faces()}</div>
        </div>
      </div>`;
    $(".faces", body).addEventListener("click", async (e) => {
      const f = e.target.closest(".face"); if (!f) return;
      await Store.addAnimo(p, +f.dataset.n, null, "");
      toast("¡Gracias! Tu equipo ya lo sabe.");
    });
  }

  const FACES = [["1", "Muy mal"], ["2", "Mal"], ["3", "Más o menos"], ["4", "Bien"], ["5", "¡Súper!"]];
  function faceSVG(n) {
    const mouth = { 1: "M16 34q8-8 16 0", 2: "M17 32q7-4 14 0", 3: "M17 31h14", 4: "M17 29q7 5 14 0", 5: "M15 27q9 11 18 0" }[n];
    const fill = { 1: "var(--brook)", 2: "var(--pomelo)", 3: "var(--chalk)", 4: "var(--chalk)", 5: "var(--amaranth)" }[n];
    return `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="${fill}" stroke="var(--amaranth)" stroke-width="3"/><circle cx="17" cy="19" r="2.6" fill="var(--amaranth)"/><circle cx="31" cy="19" r="2.6" fill="var(--amaranth)"/><path d="${mouth}" fill="none" stroke="var(--amaranth)" stroke-width="3" stroke-linecap="round"/></svg>`;
  }
  const faces = (sel) => FACES.map(([n, t]) => `<button type="button" class="face ${sel == n ? "on" : ""}" data-n="${n}" title="${t}" aria-label="${t}">${faceSVG(n)}</button>`).join("");

  function secLinea(body, p) {
    const items = p.procedimientos.slice().sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const ST = { hecho: ["listo", "brook"], hoy: ["hoy", "chalk"], pendiente: ["próximo", "brook"] };
    body.innerHTML = `
      <div class="sec-head"><h2 class="mag-h">Mi camino</h2>
        <div class="filter" role="group">
          <button class="pill on" data-f="all">Todo</button><button class="pill" data-f="hecho">Listo</button><button class="pill" data-f="next">Lo que viene</button>
        </div></div>
      <ol class="timeline">${items.map((x, i) => {
        const [lbl, col] = ST[x.estado] || ST.pendiente;
        return `<li class="tl-item ${x.estado}" data-st="${x.estado}">
          <span class="tl-dot bg-${col}">${x.estado === "hecho" ? "✓" : i + 1}</span>
          <div class="tl-card bg-${col} ${i % 2 ? "tilt-r" : "tilt-l"}">
            <p class="tl-when">${fFecha(x.fecha)} · ${fHora(x.fecha)} <span class="tag">${lbl}</span></p>
            <h3>${esc(x.titulo)}</h3>
            <p>${esc(x.descripcion)}</p>
            <p class="small">${esc(x.lugar)}${x.responsable ? " · " + esc(x.responsable) : ""}</p>
            <button class="link-btn ask-lupi" data-q="${esc(x.titulo)}">¿Qué es esto? Pregúntale a Lupi</button>
          </div></li>`;
      }).join("")}</ol>`;
    $(".filter", body).addEventListener("click", (e) => {
      const b = e.target.closest(".pill"); if (!b) return;
      $$(".filter .pill", body).forEach((x) => x.classList.toggle("on", x === b));
      $$(".tl-item", body).forEach((li) => { li.hidden = b.dataset.f === "hecho" ? li.dataset.st !== "hecho" : b.dataset.f === "next" ? li.dataset.st === "hecho" : false; });
    });
    bindAskLupi(body);
  }

  function bindAskLupi() { /* manejado por el listener único de #appBody */ }
  function appBodyClicks(e) {
    const q = e.target.closest(".ask-lupi");
    if (q) { location.hash = "#/asistente"; setTimeout(() => Lupi.ask(q.dataset.q), 150); return; }
    const ics = e.target.closest("[data-ics]");
    if (ics) {
      const p = Store.state.me;
      Calendar.addCita(p.citas.find((c) => String(c.id) === ics.dataset.ics), p);
      toast("Te avisaremos 1 día y 1 hora antes");
    }
  }

  function secMeds(body, p) {
    const doses = nextDoses(p, 6);
    body.innerHTML = `
      <div class="sec-head"><h2 class="mag-h">Mis medicinas</h2>
        <button class="btn btn-ink btn-small" id="medsCal">${icon("citas")} Recordatorios en mi calendario</button></div>
      <div class="dose-strip">${doses.length ? doses.map((d, i) => `
        <div class="dose bg-${COLORS[i % COLORS.length]}"><span class="dose-h">${fHora(d.t)}</span><span class="small">${cuando(d.t)}</span><strong>${esc(d.m.nombre)}</strong></div>`).join("") : `<p class="muted">No hay tomas en las próximas horas.</p>`}
      </div>
      <div class="med-grid">${p.medicamentos.map((m, i) => `
        <article class="med paper ${i % 2 ? "tilt-r" : "tilt-l"}">
          <span class="tape"></span>
          <div class="med-top"><span class="pill-ico bg-${COLORS[(i + 2) % COLORS.length]}">${icon("medicinas")}</span>
            <div><h3>${esc(m.nombre)}</h3><p class="small">${esc(m.dosis)} · ${esc(m.via)}</p></div></div>
          <p class="med-why"><strong>¿Para qué?</strong> ${esc(m.para_que)}</p>
          <div class="hours">${(m.horarios || []).map((h) => `<span class="hour">${esc(h)}</span>`).join("")}</div>
          ${m.indicaciones ? `<p class="small">📝 ${esc(m.indicaciones)}</p>` : ""}
          <p class="small muted">${m.desde ? "Del " + fDia(m.desde) : ""}${m.hasta ? " al " + fDia(m.hasta) : ""}</p>
          <button class="link-btn ask-lupi" data-q="${esc(m.nombre)}">¿Qué es ${esc(m.nombre)}?</button>
        </article>`).join("")}</div>`;
    $("#medsCal").onclick = () => { Calendar.addMeds(p); toast("Abre el archivo para agregar los recordatorios"); };
    bindAskLupi(body);
  }

  function secCitas(body, p) {
    const now = new Date();
    const prox = p.citas.filter((c) => new Date(c.inicio) >= now).sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
    const pas = p.citas.filter((c) => new Date(c.inicio) < now);
    const TIPO = { consulta: "amaranth", cirugia: "chalk", estudio: "brook", terapia: "brook" };
    const card = (c, past) => `
      <article class="cita bg-${TIPO[c.tipo] || "chalk"} ${past ? "past" : ""}">
        <div class="cita-date"><span class="cd-day">${new Date(c.inicio).getDate()}</span><span class="cd-mon">${new Date(c.inicio).toLocaleDateString("es-MX", { month: "short" })}</span></div>
        <div class="cita-info">
          <p class="small"><span class="tag">${esc(c.tipo)}</span> ${past ? "" : cuando(c.inicio)}</p>
          <h3>${esc(c.titulo)}</h3>
          <p>${fHora(c.inicio)} · ${esc(c.lugar)}</p>
          ${c.con_quien ? `<p class="small">Con ${esc(c.con_quien)}</p>` : ""}
          ${c.indicaciones ? `<p class="small">📝 ${esc(c.indicaciones)}</p>` : ""}
          ${past ? "" : `<div class="cita-actions"><button class="btn btn-ink btn-small" data-ics="${c.id}">Agregar a mi calendario</button><a class="btn btn-small btn-ghost" target="_blank" rel="noopener" href="${Calendar.googleLink(c, p)}">Google Calendar</a></div>`}
        </div>
      </article>`;
    body.innerHTML = `
      <div class="sec-head"><h2 class="mag-h">Mis citas</h2>
        ${prox.length ? `<button class="btn btn-ink btn-small" id="allCal">Agregar todas (con recordatorios)</button>` : ""}</div>
      <div class="citas">${prox.length ? prox.map((c) => card(c)).join("") : `<p class="muted">No tienes citas próximas.</p>`}</div>
      ${pas.length ? `<details class="past-box"><summary>Citas pasadas (${pas.length})</summary><div class="citas">${pas.map((c) => card(c, true)).join("")}</div></details>` : ""}`;
    const all = $("#allCal"); if (all) all.onclick = () => { Calendar.addAllCitas(p); toast("Abre el archivo para guardar tus citas"); };
  }

  function secExpediente(body, p) {
    body.innerHTML = `
      <div class="sec-head"><h2 class="mag-h">Mi expediente</h2>
        <button class="btn btn-small btn-ghost" onclick="window.print()">Imprimir</button></div>
      <div class="exp-grid">
        <article class="id-card paper">
          <span class="tape"></span>
          <p class="card-k">ID único</p>
          <p class="id-code">${esc(p.codigo)}</p>
          <dl>
            <dt>Nombre</dt><dd>${esc(p.nombre)}</dd>
            <dt>Edad</dt><dd>${edad(p.fecha_nacimiento)}</dd>
            <dt>Tipo de sangre</dt><dd>${esc(p.tipo_sangre || "—")}</dd>
            <dt>Hospital</dt><dd>${esc(p.hospital)}</dd>
            <dt>Contacto de emergencia</dt><dd>${esc(p.contacto_emergencia || "—")}</dd>
          </dl>
        </article>
        <div class="exp-side">
          <div class="card bg-amaranth"><p class="card-k">alergias</p>${p.alergias.length ? p.alergias.map((a) => `<span class="tag big">${esc(a)}</span>`).join(" ") : "<p>Ninguna registrada</p>"}</div>
          <div class="card bg-brook"><p class="card-k">diagnósticos</p>${p.diagnosticos.map((d) => `<p>${esc(d)}</p>`).join("") || "<p>—</p>"}</div>
        </div>
      </div>
      <h3 class="sub">Documentos</h3>
      <div class="docs">${p.documentos.map((d, i) => `
        <details class="doc bg-${COLORS[(i + 1) % COLORS.length]}">
          <summary><span class="tag">${esc(d.tipo)}</span> <strong>${esc(d.titulo)}</strong> <span class="small">${fDia(d.fecha)}</span></summary>
          <p>${esc(d.resumen)}</p>
          ${d.url ? `<a class="btn btn-small btn-ink" href="${esc(d.url)}" target="_blank" rel="noopener">Ver documento</a>` : ""}
          <button class="link-btn ask-lupi" data-q="Explícame esto: ${esc(d.resumen)}">Explícamelo con Lupi</button>
        </details>`).join("")}</div>`;
    bindAskLupi(body);
  }

  function secEquipo(body, p) {
    body.innerHTML = `
      <div class="sec-head"><h2 class="mag-h">Mi equipo</h2></div>
      <div class="team">${p.equipo.map((s, i) => `
        <article class="person bg-${COLORS[(i + 3) % COLORS.length]} ${i % 2 ? "tilt-r" : "tilt-l"}">
          <div class="avatar" aria-hidden="true">${esc(initials(s.nombre))}</div>
          <h3>${esc(s.nombre)}</h3>
          <p class="small">${esc(s.puesto)}${s.especialidad ? " · " + esc(s.especialidad) : ""}</p>
          <p class="why">Búscale para: <strong>${esc(s.motivo || "")}</strong></p>
          <p class="small">📍 ${esc(s.area || "")}</p>
          <p class="small">🕒 ${esc(s.horario || "")}${s.extension ? " · Ext. " + esc(s.extension) : ""}</p>
          <a href="#/app/mensajes" class="btn btn-ink btn-small">Escribir</a>
        </article>`).join("")}</div>`;
  }
  const initials = (n) => n.replace(/^(Dra?\.|Enf\.|Lic\.)\s*/i, "").split(" ").map((x) => x[0]).slice(0, 2).join("");

  /* ---- mensajes con el personal ---- */
  function secMensajes(body, p) {
    body.innerHTML = `
      <div class="sec-head"><h2 class="mag-h">Mensajes</h2>
        <p class="small muted">Tu equipo: ${p.equipo.map((s) => esc(s.nombre)).join(", ")}</p></div>
      <div class="thread-box paper">
        <div class="thread" id="thread"></div>
        <form class="composer" id="msgForm">
          <input id="msgInput" maxlength="600" placeholder="Escribe a tu equipo médico…" autocomplete="off" />
          <button class="btn btn-ink" type="submit">Enviar</button>
        </form>
      </div>
      <p class="small muted center">Para una emergencia usa el botón de llamado de tu cama o avisa en persona.</p>`;
    loadThread($("#thread"), p);
    $("#msgForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const v = $("#msgInput").value.trim(); if (!v) return;
      $("#msgInput").value = "";
      try { await Store.sendMessage(p, v); loadThread($("#thread"), p); } catch (ex) { toast("No se pudo enviar: " + ex.message); }
    });
  }

  async function loadThread(el, p) {
    if (!el) return;
    const list = await Store.messages(p).catch(() => []);
    el.innerHTML = list.length ? list.map((m) => `
      <div class="note ${m.mine ? "mine" : ""} ${m.autor_rol === "personal" ? "staff" : ""}">
        <p class="note-who">${esc(m.autor_nombre)} <span>${fFecha(m.created_at)} ${fHora(m.created_at)}</span></p>
        <p>${esc(m.texto)}</p>
      </div>`).join("") : `<p class="muted center">Aún no hay mensajes. ¡Saluda!</p>`;
    el.scrollTop = el.scrollHeight;
  }

  /* ---- la sala (chat entre pacientes) ---- */
  const ROOMS = [["juegos", "Sala de juegos", "amaranth"], ["general", "Pacientes y familias", "brook"]];
  const BLOCK = /(\d[\s-]?){7,}|@|https?:\/\/|www\.|\.com\b/i;
  const BAD = ["idiota", "estupido", "estúpido", "tonto", "pendejo", "imbecil", "imbécil"];

  function secSala(body) {
    body.innerHTML = `
      <div class="sec-head"><h2 class="mag-h">La sala</h2>
        <div class="filter">${ROOMS.map(([k, t, c]) => `<button class="pill bg-${c} ${k === salaRoom ? "on" : ""}" data-room="${k}">${t}</button>`).join("")}</div></div>
      <div class="sala-box">
        <div class="sala-wall" id="salaWall"></div>
        <form class="composer" id="salaForm">
          <input id="salaInput" maxlength="240" placeholder="Escribe algo bonito…" autocomplete="off" />
          <button class="btn btn-ink" type="submit">Enviar</button>
        </form>
        <div class="stk-row">${Object.keys(STICKERS).map((k) => `<button type="button" class="stk-btn" data-stk="${k}" aria-label="Enviar sticker ${k}">${sticker(k)}</button>`).join("")}</div>
        <p class="small muted center">Por tu seguridad no compartas teléfonos, direcciones ni redes sociales. El personal del hospital cuida esta sala.</p>
      </div>`;
    body.querySelector(".filter").onclick = (e) => { const b = e.target.closest("[data-room]"); if (b) { salaRoom = b.dataset.room; secSala(body); Cutout.cutAll(body); } };
    $("#salaForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const v = $("#salaInput").value.trim(); if (!v) return;
      if (BLOCK.test(v)) { toast("Ups: no compartas teléfonos, correos ni enlaces aquí."); return; }
      if (BAD.some((w) => v.toLowerCase().includes(w))) { toast("Usemos palabras amables 💛"); return; }
      $("#salaInput").value = "";
      try { await Store.sendSala(salaRoom, v, ""); loadSala(); } catch (ex) { toast("No se pudo enviar: " + ex.message); }
    });
    $(".stk-row", body).onclick = async (e) => { const b = e.target.closest("[data-stk]"); if (!b) return; await Store.sendSala(salaRoom, "", b.dataset.stk); loadSala(); };
    loadSala();
  }

  async function loadSala(el, canDelete) {
    el = el || $("#salaWall"); if (!el) return;
    const list = await Store.sala(salaRoom).catch(() => []);
    el.innerHTML = list.length ? list.map((m, i) => `
      <div class="postit bg-${COLORS[i % COLORS.length]} ${m.mine ? "mine" : ""}" style="--rot:${((i * 37) % 7) - 3}deg">
        ${m.sticker ? sticker(m.sticker) : `<p>${esc(m.texto)}</p>`}
        <p class="postit-who">${esc(m.autor_nombre)} · ${fHora(m.created_at)}</p>
        ${canDelete ? `<button class="link-btn del" data-del="${m.id}">quitar</button>` : ""}
      </div>`).join("") : `<p class="muted center">Nadie ha escrito todavía. ¡Sé la primera persona!</p>`;
    el.scrollTop = el.scrollHeight;
  }

  /* ---- ánimo ---- */
  function secAnimo(body, p) {
    body.innerHTML = `
      <div class="sec-head"><h2 class="mag-h">¿Cómo me siento?</h2></div>
      <form class="paper animo-form" id="animoForm">
        <span class="tape"></span>
        <p class="lbl">Hoy me siento…</p>
        <div class="faces big">${faces(3)}</div>
        <label class="lbl" for="dolor">¿Te duele algo? <strong id="dolorVal">0</strong>/10</label>
        <input type="range" id="dolor" min="0" max="10" value="0" class="range" />
        <label class="lbl" for="nota">¿Algo más que quieras contar?</label>
        <textarea id="nota" rows="3" maxlength="400" placeholder="Por ejemplo: me duele la panza cuando me muevo"></textarea>
        <button class="btn btn-ink" type="submit">Enviar a mi equipo</button>
      </form>
      <h3 class="sub">Lo que has contado</h3>
      <div class="animo-list" id="animoList"></div>`;
    let nivel = 3;
    $(".faces", body).onclick = (e) => { const f = e.target.closest(".face"); if (!f) return; nivel = +f.dataset.n; $$(".face", body).forEach((x) => x.classList.toggle("on", x === f)); };
    $("#dolor").oninput = (e) => ($("#dolorVal").textContent = e.target.value);
    $("#animoForm").onsubmit = async (e) => {
      e.preventDefault();
      try {
        await Store.addAnimo(p, nivel, +$("#dolor").value, $("#nota").value.trim());
        $("#nota").value = ""; toast("¡Enviado! Gracias por contarnos.");
        loadAnimo($("#animoList"), p);
      } catch (ex) { toast("No se pudo enviar: " + ex.message); }
    };
    loadAnimo($("#animoList"), p);
  }

  async function loadAnimo(el, p) {
    if (!el) return;
    const list = await Store.animo(p).catch(() => []);
    el.innerHTML = list.length ? list.map((a) => `
      <div class="animo-row">
        <span class="face sm">${faceSVG(a.nivel)}</span>
        <div><p><strong>${FACES[a.nivel - 1][1]}</strong>${a.dolor != null ? ` · dolor ${a.dolor}/10` : ""}</p>${a.nota ? `<p class="small">${esc(a.nota)}</p>` : ""}</div>
        <span class="small muted">${fFecha(a.created_at)} ${fHora(a.created_at)}</span>
      </div>`).join("") : `<p class="muted">Todavía no hay registros.</p>`;
  }

  /* =========================================================
     PANEL DEL PERSONAL
     ========================================================= */
  let staffPatients = [];
  let staffSel = null;
  let staffTab = "mensajes";

  async function renderStaff() {
    const me = Store.state.me;
    $("#staffHello").innerHTML = "";
    const h = document.createElement("span");
    h.dataset.cut = "mi panel"; h.dataset.seed = "9";
    $("#staffHello").appendChild(h); Cutout.cut(h);
    $("#staffSub").textContent = `${me.nombre} · ${me.puesto} · ${me.codigo}`;
    $("#staffBadge").hidden = Store.state.mode !== "demo";

    $("#staffList").innerHTML = `<p class="muted">Cargando pacientes…</p>`;
    try { staffPatients = await Store.myPatients(); } catch (ex) { $("#staffList").innerHTML = `<p class="form-error">${esc(ex.message)}</p>`; return; }
    if (!staffSel && staffPatients[0]) staffSel = staffPatients[0].codigo;
    drawStaffList();
    drawStaffMain();
    if (!unsub) unsub = Store.subscribe(() => refreshStaffLive());
  }

  function drawStaffList() {
    $("#staffList").innerHTML = `
      <p class="card-k">mis pacientes</p>
      ${staffPatients.map((p, i) => `
        <button class="pt-btn bg-${COLORS[i % COLORS.length]} ${p.codigo === staffSel ? "on" : ""}" data-pt="${esc(p.codigo)}">
          <strong>${esc(p.nombre)}</strong>
          <span class="small">${esc(p.codigo)} · ${p.tipo === "internado" ? "Cuarto " + esc(p.cuarto) : "Ambulatorio"}</span>
        </button>`).join("") || `<p class="muted">No tienes pacientes asignados.</p>`}
      <button class="pt-btn bg-chalk ${staffSel === "__sala" ? "on" : ""}" data-pt="__sala"><strong>La sala</strong><span class="small">Moderar chat de pacientes</span></button>`;
    $("#staffList").onclick = (e) => { const b = e.target.closest("[data-pt]"); if (!b) return; staffSel = b.dataset.pt; drawStaffList(); drawStaffMain(); };
  }

  function drawStaffMain() {
    const main = $("#staffMain");
    if (staffSel === "__sala") {
      main.innerHTML = `
        <div class="sec-head"><h2 class="mag-h">La sala</h2>
          <div class="filter">${ROOMS.map(([k, t, c]) => `<button class="pill bg-${c} ${k === salaRoom ? "on" : ""}" data-room="${k}">${t}</button>`).join("")}</div></div>
        <div class="sala-box"><div class="sala-wall" id="staffSala"></div>
          <form class="composer" id="staffSalaForm"><input id="staffSalaInput" maxlength="240" placeholder="Mensaje del personal para la sala…" autocomplete="off"/><button class="btn btn-ink">Enviar</button></form></div>`;
      Cutout.cutAll(main);
      $(".filter", main).onclick = (e) => { const b = e.target.closest("[data-room]"); if (b) { salaRoom = b.dataset.room; drawStaffMain(); } };
      $("#staffSalaForm").onsubmit = async (e) => { e.preventDefault(); const v = $("#staffSalaInput").value.trim(); if (!v) return; $("#staffSalaInput").value = ""; await Store.sendSala(salaRoom, v, ""); loadSala($("#staffSala"), true); };
      $("#staffSala").onclick = async (e) => { const b = e.target.closest("[data-del]"); if (!b) return; try { await Store.deleteSala(salaRoom, b.dataset.del); loadSala($("#staffSala"), true); } catch (ex) { toast(ex.message); } };
      loadSala($("#staffSala"), true);
      return;
    }
    const p = staffPatients.find((x) => x.codigo === staffSel);
    if (!p) { main.innerHTML = `<p class="muted">Elige un paciente.</p>`; return; }
    main.innerHTML = `
      <div class="pt-head bg-brook">
        <div><h2>${esc(p.nombre)}</h2><p class="small">${esc(p.codigo)} · ${edad(p.fecha_nacimiento)} · ${esc(p.area)}${p.cuarto ? " · Cuarto " + esc(p.cuarto) : ""}</p>
        <p class="small">Alergias: <strong>${p.alergias.length ? p.alergias.map(esc).join(", ") : "ninguna"}</strong></p></div>
      </div>
      <div class="filter staff-tabs">
        ${[["mensajes", "Mensajes"], ["animo", "Cómo se siente"], ["resumen", "Resumen"]].map(([k, t]) => `<button class="pill ${k === staffTab ? "on" : ""}" data-st="${k}">${t}</button>`).join("")}
      </div>
      <div id="staffPane"></div>`;
    $(".staff-tabs", main).onclick = (e) => { const b = e.target.closest("[data-st]"); if (b) { staffTab = b.dataset.st; drawStaffMain(); } };
    const pane = $("#staffPane");
    if (staffTab === "mensajes") {
      pane.innerHTML = `<div class="thread-box paper"><div class="thread" id="staffThread"></div>
        <form class="composer" id="staffMsgForm"><input id="staffMsgInput" maxlength="600" placeholder="Escribe a ${esc(p.apodo || p.nombre)}…" autocomplete="off"/><button class="btn btn-ink">Enviar</button></form></div>`;
      loadThread($("#staffThread"), p);
      $("#staffMsgForm").onsubmit = async (e) => {
        e.preventDefault(); const v = $("#staffMsgInput").value.trim(); if (!v) return; $("#staffMsgInput").value = "";
        try { await Store.sendMessage(p, v); loadThread($("#staffThread"), p); } catch (ex) { toast("No se pudo enviar: " + ex.message); }
      };
    } else if (staffTab === "animo") {
      pane.innerHTML = `<div class="animo-list" id="staffAnimo"></div>`;
      loadAnimo($("#staffAnimo"), p);
    } else {
      const doses = nextDoses(p, 4);
      pane.innerHTML = `
        <div class="grid-2">
          <div class="card bg-brook"><p class="card-k">próximas tomas</p>${doses.map((d) => `<p><strong>${fHora(d.t)}</strong> ${esc(d.m.nombre)} ${esc(d.m.dosis)}</p>`).join("") || "<p>—</p>"}</div>
          <div class="card bg-amaranth"><p class="card-k">procedimientos</p>${p.procedimientos.map((x) => `<p>${x.estado === "hecho" ? "✓" : "○"} ${esc(x.titulo)} <span class="small">${fFecha(x.fecha)}</span></p>`).join("")}</div>
        </div>`;
    }
  }

  function refreshStaffLive() {
    if (currentView !== "personal") return;
    if (staffSel === "__sala") return loadSala($("#staffSala"), true);
    const p = staffPatients.find((x) => x.codigo === staffSel);
    if (!p) return;
    if (staffTab === "mensajes") loadThread($("#staffThread"), p);
    if (staffTab === "animo") loadAnimo($("#staffAnimo"), p);
  }

  /* =========================================================
     ARRANQUE
     ========================================================= */
  document.addEventListener("DOMContentLoaded", async () => {
    buildHome();
    Lupi.init();
    initLogin();
    $("#logoutBtn").onclick = doLogout;
    $("#staffLogout").onclick = doLogout;
    $("#appBody").addEventListener("click", appBodyClicks);
    await Store.restore().catch(() => null);
    window.addEventListener("hashchange", route);
    route();
  });
})();
