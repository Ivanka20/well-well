/* =========================================================
   Capa de datos
   - Modo Supabase: inicia sesión con el ID (convertido a un
     correo interno) + código de acceso, y lee/escribe en las
     tablas protegidas con RLS (ver supabase/schema.sql).
   - Modo demo: si el ID no existe en Supabase pero es uno de
     los IDs de prueba, usa datos locales del navegador.
   ========================================================= */
(function () {
  const SUPABASE_URL = "https://xkfoiggivoxiwwkzcpbe.supabase.co";
  const SUPABASE_KEY = "sb_publishable_4v_AY40WLUYn78Bn1dETlQ_PJnc5bEK";
  const sb = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

  // ID → correo interno de Supabase Auth (nadie lo escribe, solo el ID)
  const DOMAINS = { paciente: "paciente.wellwell.app", personal: "personal.wellwell.app" };
  const idToEmail = (role, id) => `${id.trim().toLowerCase()}@${DOMAINS[role]}`;
  const normId = (id) => id.trim().toUpperCase().replace(/\s+/g, "");

  const DEMO_KEY = "ww-demo-v2";
  const SESSION_KEY = "ww-session-v2";
  const listeners = new Set();

  const state = { mode: null, role: null, uid: null, me: null };

  /* ---------- utilidades demo ---------- */
  function demoDb() {
    let db = null;
    try { db = JSON.parse(localStorage.getItem(DEMO_KEY) || "null"); } catch (_) {}
    if (!db) db = { mensajes: structuredClone(DEMO.mensajesIniciales), sala: structuredClone(DEMO.salaInicial), animo: {} };
    return db;
  }
  function saveDemo(db) {
    try { localStorage.setItem(DEMO_KEY, JSON.stringify(db)); } catch (_) {}
    listeners.forEach((fn) => fn());
  }
  window.addEventListener("storage", (e) => { if (e.key === DEMO_KEY) listeners.forEach((fn) => fn()); });
  const uid = () => Math.random().toString(36).slice(2, 10);

  function demoPatient(codigo) {
    const p = DEMO.pacientes[codigo];
    if (!p) return null;
    return {
      ...structuredClone(p),
      equipo: p.equipo.map((a) => ({ ...DEMO.personal[a.codigo], motivo: a.motivo })),
    };
  }

  /* ---------- sesión ---------- */
  function saveSession() {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ mode: state.mode, role: state.role, codigo: state.me && state.me.codigo })); } catch (_) {}
  }

  async function login(role, rawId, code) {
    const id = normId(rawId);
    if (!id || !code) throw new Error("Escribe tu ID y tu código de acceso.");

    // 1) Intentar con Supabase
    if (sb) {
      try {
        const { data, error } = await sb.auth.signInWithPassword({ email: idToEmail(role, id), password: code });
        if (!error && data.user) {
          state.mode = "supabase"; state.role = role; state.uid = data.user.id;
          state.me = role === "paciente" ? await sbPatientByPerfil(data.user.id) : await sbStaffByPerfil(data.user.id);
          if (!state.me) { await sb.auth.signOut(); throw new Error("Tu ID existe pero aún no tiene datos asignados. Pide ayuda en el hospital."); }
          saveSession();
          return state;
        }
      } catch (ex) {
        if (ex && ex.message && ex.message.startsWith("Tu ID existe")) throw ex;
        // si Supabase no responde, seguimos con demo
      }
    }

    // 2) Cuentas de prueba
    const isDemo = role === "paciente" ? DEMO.pacientes[id] : DEMO.personal[id];
    if (isDemo && code === DEMO.codigos[role]) {
      state.mode = "demo"; state.role = role; state.uid = id;
      state.me = role === "paciente" ? demoPatient(id) : structuredClone(DEMO.personal[id]);
      saveSession();
      return state;
    }
    throw new Error("ID o código de acceso incorrectos.");
  }

  async function restore() {
    let s = null;
    try { s = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch (_) {}
    if (sb) {
      const { data } = await sb.auth.getSession();
      const user = data && data.session && data.session.user;
      if (user && user.email) {
        const role = user.email.endsWith(DOMAINS.personal) ? "personal" : user.email.endsWith(DOMAINS.paciente) ? "paciente" : null;
        if (role) {
          try {
            state.mode = "supabase"; state.role = role; state.uid = user.id;
            state.me = role === "paciente" ? await sbPatientByPerfil(user.id) : await sbStaffByPerfil(user.id);
            if (state.me) return state;
          } catch (_) {}
        }
      }
    }
    if (s && s.mode === "demo" && s.codigo) {
      state.mode = "demo"; state.role = s.role; state.uid = s.codigo;
      state.me = s.role === "paciente" ? demoPatient(s.codigo) : structuredClone(DEMO.personal[s.codigo]);
      if (state.me) return state;
    }
    state.mode = state.role = state.me = null;
    return null;
  }

  async function logout() {
    if (state.mode === "supabase" && sb) await sb.auth.signOut();
    state.mode = state.role = state.me = state.uid = null;
    try { sessionStorage.removeItem(SESSION_KEY); } catch (_) {}
  }

  /* ---------- Supabase: lecturas ---------- */
  async function must(q) {
    const { data, error } = await q;
    if (error) throw error;
    return data;
  }

  async function sbPatientBundle(pac) {
    const [procedimientos, medicamentos, citas, documentos, equipo] = await Promise.all([
      must(sb.from("procedimientos").select("*").eq("paciente_id", pac.id).order("fecha")),
      must(sb.from("medicamentos").select("*").eq("paciente_id", pac.id).order("nombre")),
      must(sb.from("citas").select("*").eq("paciente_id", pac.id).order("inicio")),
      must(sb.from("documentos").select("*").eq("paciente_id", pac.id).order("fecha", { ascending: false })),
      must(sb.from("asignaciones").select("motivo, personal(*)").eq("paciente_id", pac.id)),
    ]);
    return {
      ...pac,
      alergias: pac.alergias || [],
      diagnosticos: pac.diagnosticos || [],
      procedimientos, medicamentos, citas, documentos,
      equipo: equipo.filter((a) => a.personal).map((a) => ({ ...a.personal, motivo: a.motivo })),
    };
  }
  async function sbPatientByPerfil(perfilId) {
    const pac = await must(sb.from("pacientes").select("*").eq("perfil_id", perfilId).maybeSingle());
    return pac ? sbPatientBundle(pac) : null;
  }
  async function sbStaffByPerfil(perfilId) {
    return must(sb.from("personal").select("*").eq("perfil_id", perfilId).maybeSingle());
  }

  /* ---------- API pública ---------- */
  const keyOf = (p) => (state.mode === "demo" ? p.codigo : p.id);

  async function myPatients() {
    if (state.mode === "demo") {
      return (DEMO.asignaciones[state.me.codigo] || []).map(demoPatient);
    }
    const rows = await must(sb.from("asignaciones").select("pacientes(*)").eq("personal_id", state.me.id));
    return Promise.all(rows.filter((r) => r.pacientes).map((r) => sbPatientBundle(r.pacientes)));
  }

  function isMine(m) {
    if (state.mode === "supabase") return m.autor_perfil === state.uid;
    return m.autor_rol === state.role && (state.role === "paciente" || m.autor_nombre === state.me.nombre);
  }

  async function messages(p) {
    let list;
    if (state.mode === "demo") list = demoDb().mensajes[p.codigo] || [];
    else list = await must(sb.from("mensajes").select("*").eq("paciente_id", p.id).order("created_at"));
    return list.map((m) => ({ ...m, mine: isMine(m) }));
  }

  async function sendMessage(p, texto) {
    const nombre = state.role === "paciente" ? state.me.nombre : state.me.nombre;
    if (state.mode === "demo") {
      const db = demoDb();
      (db.mensajes[p.codigo] = db.mensajes[p.codigo] || []).push({ id: uid(), autor_nombre: nombre, autor_rol: state.role, texto, created_at: new Date().toISOString() });
      saveDemo(db);
      return;
    }
    await must(sb.from("mensajes").insert({ paciente_id: p.id, autor_perfil: state.uid, autor_nombre: nombre, autor_rol: state.role, texto }));
  }

  async function sala(room) {
    let list;
    if (state.mode === "demo") list = demoDb().sala[room] || [];
    else list = await must(sb.from("sala_mensajes").select("*").eq("sala", room).order("created_at", { ascending: false }).limit(80)).then((r) => r.reverse());
    return list.map((m) => ({ ...m, mine: state.mode === "supabase" ? m.autor_perfil === state.uid : m.autor_nombre && m.autor_nombre.startsWith(apodo() + " ·") }));
  }

  function apodo() {
    const me = state.me || {};
    return me.apodo || (me.nombre || "").split(" ")[0];
  }
  function salaName() {
    const me = state.me || {};
    if (state.role === "personal") return `${me.nombre} · personal`;
    return me.cuarto ? `${apodo()} · cuarto ${me.cuarto}` : `${apodo()} · ${me.area || "paciente"}`;
  }

  async function sendSala(room, texto, sticker) {
    const row = { sala: room, autor_nombre: salaName(), texto: texto || "", sticker: sticker || "" };
    if (state.mode === "demo") {
      const db = demoDb();
      (db.sala[room] = db.sala[room] || []).push({ id: uid(), ...row, created_at: new Date().toISOString() });
      saveDemo(db);
      return;
    }
    await must(sb.from("sala_mensajes").insert({ ...row, autor_perfil: state.uid }));
  }

  async function deleteSala(room, id) {
    if (state.mode === "demo") {
      const db = demoDb();
      db.sala[room] = (db.sala[room] || []).filter((m) => m.id !== id);
      saveDemo(db);
      return;
    }
    await must(sb.from("sala_mensajes").delete().eq("id", id));
  }

  async function animo(p) {
    if (state.mode === "demo") return (demoDb().animo[p.codigo] || []).slice().reverse();
    return must(sb.from("animo").select("*").eq("paciente_id", p.id).order("created_at", { ascending: false }).limit(30));
  }
  async function addAnimo(p, nivel, dolor, nota) {
    if (state.mode === "demo") {
      const db = demoDb();
      (db.animo[p.codigo] = db.animo[p.codigo] || []).push({ id: uid(), nivel, dolor, nota, created_at: new Date().toISOString() });
      saveDemo(db);
      return;
    }
    await must(sb.from("animo").insert({ paciente_id: p.id, nivel, dolor, nota }));
  }

  // Avisos en vivo (mensajes, sala, ánimo). Devuelve función para cancelar.
  function subscribe(fn) {
    if (state.mode === "demo") {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }
    const ch = sb.channel("ww-" + uid())
      .on("postgres_changes", { event: "*", schema: "public", table: "mensajes" }, fn)
      .on("postgres_changes", { event: "*", schema: "public", table: "sala_mensajes" }, fn)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "animo" }, fn)
      .subscribe();
    return () => sb.removeChannel(ch);
  }

  window.Store = { state, login, restore, logout, myPatients, messages, sendMessage, sala, sendSala, deleteSala, animo, addAnimo, subscribe, keyOf };
})();
