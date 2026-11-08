/* =========================================================
   Well Well · lógica de la landing, el panel del paciente
   y el panel clínico del personal.

   Nota: es una demo sin servidor. Los datos se guardan en el
   navegador (localStorage), así que lo que el personal cambia
   se ve en la cuenta del paciente en este mismo navegador.
   En producción, el login, los datos y los archivos vivirían
   en el servidor del hospital, y el asistente se conectaría a
   un modelo de IA desde ese servidor.
   ========================================================= */

/* ---------- Utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Math.random().toString(36).slice(2, 10);
const pad = (n) => String(n).padStart(2, "0");
const DAY = 24 * 60 * 60 * 1000;

const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO = () => iso(startOfToday());
const isoIn = (n) => { const d = startOfToday(); d.setDate(d.getDate() + n); return iso(d); };
const parseISO = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const fmtDate = (s) => parseISO(s).toLocaleDateString("es", { day: "numeric", month: "short" }).replace(".", "");
const fmtDay = (s) => {
  const diff = Math.round((parseISO(s) - startOfToday()) / DAY);
  return diff === 0 ? "hoy" : diff === 1 ? "mañana" : diff === -1 ? "ayer" : fmtDate(s);
};
const fmtStamp = (isoStr) =>
  new Date(isoStr).toLocaleString("es", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).replace(".", "");
const fmtSize = (b) => (b > 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB");
const nowAt = (h, m) => { const d = new Date(); d.setHours(h, m, 0, 0); return d.toISOString(); };
const sortByDate = (a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || ""));

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 3200);
}

/* ---------- Catálogos del hospital ---------- */
const DOCTORS = [
  { name: "Dra. Carmen Ortiz", spec: "Pediatría" },
  { name: "Dr. Andrés Molina", spec: "Cirugía pediátrica" },
  { name: "Dr. Luis Paredes", spec: "Traumatología" },
  { name: "Dra. Elena Salas", spec: "Anestesiología" },
  { name: "Dr. Ricardo Núñez", spec: "Radiología" },
  { name: "Lic. Paula Ríos", spec: "Nutrición" },
  { name: "Enf. Laura Gómez", spec: "Enfermería" },
  { name: "Lic. Diego Sosa", spec: "Fisioterapia" },
  { name: "Psic. Tomás Vera", spec: "Psicología" },
];

const AREAS = [
  { name: "Habitación del paciente", where: "En tu habitación" },
  { name: "Urgencias pediátricas", where: "Edificio A · Planta baja · Entrada principal" },
  { name: "Laboratorio clínico", where: "Edificio A · Planta baja · Ventanilla 3" },
  { name: "Radiología e imagen", where: "Edificio A · Piso 1 · Sala 104" },
  { name: "Quirófanos pediátricos", where: "Edificio B · Piso 2 · Elevador azul" },
  { name: "Traumatología", where: "Edificio B · Piso 1 · Consultorio 130" },
  { name: "Consulta externa pediátrica", where: "Edificio C · Piso 1 · Consultorios 110–120" },
  { name: "Vacunación", where: "Edificio C · Planta baja · Módulo 2" },
  { name: "Fisioterapia", where: "Edificio C · Planta baja · Gimnasio" },
  { name: "Nutrición", where: "Edificio C · Piso 2 · Consultorio 205" },
];
const whereOf = (area) => (AREAS.find((a) => a.name === area) || {}).where || "";

const VISIT = "Visita a la habitación";
const CITA_TYPES = [VISIT, "Consulta", "Control", "Estudio", "Revisión anual", "Vacunación", "Terapia"];

/* Cuentas de personal (demo). En producción: inicio de sesión del hospital. */
const STAFF = {
  "MED-0042": { code: "2026", name: "Dra. Carmen Ortiz", role: "Pediatría" },
  "ENF-0108": { code: "1234", name: "Enf. Laura Gómez", role: "Enfermería" },
};

/* Protocolos para el plan automático. `d` = días desde la fecha de inicio. */
const TEMPLATES = [
  {
    name: "Apendicectomía laparoscópica",
    steps: [
      { title: "Valoración prequirúrgica", d: 0, time: "09:00", doctor: "Dr. Andrés Molina", area: "Habitación del paciente", desc: "El cirujano revisa al paciente y explica la cirugía a la familia." },
      { title: "Análisis de sangre", d: 0, time: "10:00", doctor: "Enf. Laura Gómez", area: "Laboratorio clínico", desc: "Hemograma y pruebas de coagulación antes de la cirugía." },
      { title: "Valoración de anestesia", d: 0, time: "16:00", doctor: "Dra. Elena Salas", area: "Habitación del paciente", desc: "La anestesióloga conoce al paciente y resuelve dudas." },
      { title: "Apendicectomía", d: 1, time: "07:30", doctor: "Dr. Andrés Molina", area: "Quirófanos pediátricos", desc: "Cirugía por laparoscopia. Ayuno desde la noche anterior." },
      { title: "Curación de herida", d: 3, time: "11:00", doctor: "Enf. Laura Gómez", area: "Habitación del paciente", desc: "Revisión y limpieza de las heridas pequeñas." },
      { title: "Alta médica", d: 4, time: "12:00", doctor: "Dr. Andrés Molina", area: "Habitación del paciente", desc: "Indicaciones para casa y fecha de control." },
    ],
  },
  {
    name: "Fractura con yeso",
    steps: [
      { title: "Radiografía", d: 0, time: "09:00", doctor: "Dr. Ricardo Núñez", area: "Radiología e imagen", desc: "Imagen para ver la fractura." },
      { title: "Reducción y yeso", d: 0, time: "12:00", doctor: "Dr. Luis Paredes", area: "Traumatología", desc: "Se acomoda el hueso con anestesia y se coloca el yeso." },
      { title: "Radiografía de control", d: 1, time: "10:00", doctor: "Dr. Ricardo Núñez", area: "Radiología e imagen", desc: "Comprobar que el hueso sigue alineado." },
      { title: "Fisioterapia", d: 1, time: "17:00", doctor: "Lic. Diego Sosa", area: "Fisioterapia", desc: "Aprender a usar muletas de forma segura." },
      { title: "Control con traumatología", d: 21, time: "09:30", doctor: "Dr. Luis Paredes", area: "Traumatología", desc: "Revisión del yeso y nueva radiografía." },
    ],
  },
  {
    name: "Resonancia con sedación",
    steps: [
      { title: "Ayuno", d: 0, time: "00:00", doctor: "Enf. Laura Gómez", area: "Habitación del paciente", desc: "Sin comer desde la medianoche ni beber 2 horas antes." },
      { title: "Valoración de anestesia", d: 0, time: "08:00", doctor: "Dra. Elena Salas", area: "Radiología e imagen", desc: "Revisión antes de la sedación." },
      { title: "Resonancia magnética", d: 0, time: "09:00", doctor: "Dr. Ricardo Núñez", area: "Radiología e imagen", desc: "Estudio de imagen con sedación suave. No duele." },
      { title: "Recuperación", d: 0, time: "10:30", doctor: "Enf. Laura Gómez", area: "Radiología e imagen", desc: "Observación hasta que despierte por completo." },
    ],
  },
  {
    name: "Revisión anual (consulta externa)",
    steps: [
      { title: "Análisis de sangre", d: 0, time: "08:00", doctor: "Enf. Laura Gómez", area: "Laboratorio clínico", desc: "Ayuno de 8 horas. Llegar 10 minutos antes." },
      { title: "Consulta de revisión anual", d: 0, time: "09:30", doctor: "Dra. Carmen Ortiz", area: "Consulta externa pediátrica", desc: "Peso, talla, desarrollo y revisión general." },
      { title: "Vacunación", d: 0, time: "10:30", doctor: "Enf. Laura Gómez", area: "Vacunación", desc: "Aplicación de las vacunas que correspondan por edad." },
      { title: "Entrega de resultados", d: 7, time: "11:00", doctor: "Dra. Carmen Ortiz", area: "Consulta externa pediátrica", desc: "Revisión de los análisis con la familia." },
    ],
  },
];

/* ---------- Base de datos (demo en localStorage) ---------- */
const DB_KEY = "ww-db-v2";

function seedDB() {
  const visit = (time, doctor, title) => ({ id: uid(), type: VISIT, title, date: todayISO(), time, doctor, area: "Habitación del paciente", notes: "" });
  const proc = (title, d, time, doctor, area, desc) => ({ id: uid(), title, date: isoIn(d), time, doctor, area, desc });
  const rem = (text, when) => ({ id: uid(), text, when });

  return {
    patients: {
      "WW-2048-17": {
        id: "WW-2048-17", name: "Sofía Ramírez", age: 9, type: "internado",
        room: "Habitación 312 · Pediatría", reason: "Recuperación de apendicitis",
        procedures: [
          proc("Ingreso y valoración", -5, "09:00", "Dra. Carmen Ortiz", "Urgencias pediátricas", "Revisión general al llegar: signos vitales y entrevista con la familia."),
          proc("Análisis de sangre", -5, "10:00", "Enf. Laura Gómez", "Laboratorio clínico", "Hemograma completo para revisar si había infección."),
          proc("Ecografía abdominal", -4, "08:30", "Dr. Ricardo Núñez", "Radiología e imagen", "Imagen del abdomen con ultrasonido, sin dolor ni radiación."),
          proc("Apendicectomía", -3, "07:00", "Dr. Andrés Molina", "Quirófanos pediátricos", "Cirugía por laparoscopia para retirar el apéndice inflamado. Todo salió bien."),
          proc("Curación de herida", 0, "11:00", "Enf. Laura Gómez", "Habitación del paciente", "La enfermera revisará y limpiará las pequeñas heridas de la cirugía."),
          proc("Retiro de vía intravenosa", 1, "09:00", "Enf. Laura Gómez", "Habitación del paciente", "Si comes y tomas líquidos bien, se retira el suero del brazo."),
          proc("Alta médica", 3, "12:00", "Dr. Andrés Molina", "Habitación del paciente", "¡A casa! Recibirás indicaciones de cuidados y la fecha de control."),
        ],
        appointments: [
          visit("08:00", "Enf. Laura Gómez", "Signos vitales y medicamentos"),
          visit("10:30", "Dr. Andrés Molina", "Revisión post-operatoria"),
          visit("13:00", "Lic. Paula Ríos", "Plan de comidas"),
          visit("16:00", "Dra. Carmen Ortiz", "Pediatra de guardia"),
          visit("18:30", "Psic. Tomás Vera", "Acompañamiento emocional"),
          { id: uid(), type: "Control", title: "Control post-operatorio", date: isoIn(10), time: "10:00", doctor: "Dr. Andrés Molina", area: "Consulta externa pediátrica", notes: "Trae tu hoja de alta. Llega 15 minutos antes." },
        ],
        meds: [
          { id: uid(), name: "Amoxicilina", dose: "250 mg", purpose: "Antibiótico para evitar infecciones", every: "Cada 8 h", next: "14:00" },
          { id: uid(), name: "Paracetamol", dose: "320 mg", purpose: "Calma el dolor y baja la fiebre", every: "Cada 6 h", next: "12:00" },
          { id: uid(), name: "Ondansetrón", dose: "4 mg", purpose: "Evita las náuseas", every: "Si hay náuseas", next: "Solo si lo necesitas" },
        ],
        reminders: [
          rem("Ayuno de 2 h antes de la curación", "hoy, desde las 9:00"),
          rem("Caminar por el pasillo con un adulto", "3 veces al día"),
          rem("Anotar si sientes dolor (del 0 al 10)", "en cada visita de enfermería"),
          rem("Preparar preguntas para el alta", fmtDate(isoIn(3))),
        ],
        messages: [
          { id: uid(), from: "staff", author: "Dr. Andrés Molina", text: "¡Hola, Sofía! La cirugía salió muy bien. Hoy paso a verte a las 10:30.", at: nowAt(8, 15), important: false },
        ],
        record: {
          blood: "O+", allergies: "Ninguna conocida", weight: "29 kg", height: "1.32 m",
          diagnosis: "Apendicitis aguda · post-operatorio de apendicectomía laparoscópica",
          notes: "Evolución favorable. Tolera dieta líquida y camina con ayuda.",
          updated: nowAt(8, 0), by: "Dr. Andrés Molina",
        },
        docs: [],
      },

      "WW-1120-05": {
        id: "WW-1120-05", name: "Mateo Fernández", age: 13, type: "internado",
        room: "Habitación 207 · Traumatología", reason: "Fractura de tibia",
        procedures: [
          proc("Urgencias", -2, "18:00", "Dra. Carmen Ortiz", "Urgencias pediátricas", "Valoración inicial y control del dolor."),
          proc("Radiografía", -2, "19:00", "Dr. Ricardo Núñez", "Radiología e imagen", "Imagen de la pierna para ver la fractura."),
          proc("Reducción y yeso", -1, "10:00", "Dr. Luis Paredes", "Traumatología", "Se acomodó el hueso bajo anestesia y se colocó un yeso."),
          proc("Radiografía de control", 0, "11:00", "Dr. Ricardo Núñez", "Radiología e imagen", "Comprobar que el hueso sigue bien alineado."),
          proc("Fisioterapia", 1, "17:00", "Lic. Diego Sosa", "Fisioterapia", "Aprender a usar muletas de forma segura."),
          proc("Alta médica", 2, "12:00", "Dr. Luis Paredes", "Habitación del paciente", "Regreso a casa con indicaciones."),
        ],
        appointments: [
          visit("09:00", "Dr. Luis Paredes", "Revisión del yeso"),
          visit("17:00", "Lic. Diego Sosa", "Ejercicios con muletas"),
        ],
        meds: [
          { id: uid(), name: "Ibuprofeno", dose: "400 mg", purpose: "Reduce el dolor y la inflamación", every: "Cada 8 h", next: "15:00" },
          { id: uid(), name: "Paracetamol", dose: "500 mg", purpose: "Refuerzo para el dolor", every: "Cada 6 h", next: "12:00" },
        ],
        reminders: [
          rem("Mantener la pierna elevada", "todo el día"),
          rem("Avisar si los dedos se sienten fríos o dormidos", "en cualquier momento"),
        ],
        messages: [],
        record: { blood: "A+", allergies: "Penicilina", weight: "46 kg", height: "1.58 m", diagnosis: "Fractura cerrada de tibia derecha", notes: "Buena alineación tras la reducción.", updated: nowAt(9, 0), by: "Dr. Luis Paredes" },
        docs: [],
      },

      "WW-3301-09": {
        id: "WW-3301-09", name: "Valentina Cruz", age: 6, type: "ambulatorio",
        room: "Consulta externa", reason: "Revisión anual",
        procedures: [],
        appointments: [
          { id: uid(), type: "Estudio", title: "Análisis de sangre", date: isoIn(2), time: "08:00", doctor: "Enf. Laura Gómez", area: "Laboratorio clínico", notes: "Ayuno de 8 horas. Trae tu ID Well Well." },
          { id: uid(), type: "Revisión anual", title: "Revisión anual de pediatría", date: isoIn(2), time: "09:30", doctor: "Dra. Carmen Ortiz", area: "Consulta externa pediátrica", notes: "Llega 15 minutos antes para tomar peso y talla." },
          { id: uid(), type: "Vacunación", title: "Vacunas de los 6 años", date: isoIn(2), time: "10:30", doctor: "Enf. Laura Gómez", area: "Vacunación", notes: "Trae la cartilla de vacunación." },
        ],
        meds: [],
        reminders: [rem("Ayuno desde las 0:00 para el análisis", fmtDate(isoIn(2)))],
        messages: [
          { id: uid(), from: "staff", author: "Dra. Carmen Ortiz", text: "Hola, familia Cruz. Les esperamos para la revisión anual de Valentina. Revisen en “A dónde ir y cuándo” cada lugar.", at: nowAt(9, 30), important: true },
        ],
        record: { blood: "B+", allergies: "Ninguna conocida", weight: "21 kg", height: "1.16 m", diagnosis: "Niña sana · control anual", notes: "", updated: nowAt(9, 0), by: "Dra. Carmen Ortiz" },
        docs: [],
      },
    },
  };
}

function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return seedDB();
}
let db = loadDB();

function saveDB() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return true;
  } catch (_) {
    toast("No hay espacio para guardar en este navegador. Prueba con un archivo más pequeño.");
    return false;
  }
}
saveDB();

/* Ordena procedimientos y marca su estado: realizado / próximo / programado */
function withStatus(procs) {
  const list = [...procs].sort(sortByDate);
  const t = todayISO();
  const next = list.findIndex((p) => p.date >= t);
  return list.map((p, i) => ({ ...p, status: next === -1 || i < next ? "done" : i === next ? "next" : "future" }));
}
const STATUS_TEXT = { done: "Realizado", next: "Próximo", future: "Programado" };

/* ---------- Glosario del asistente ---------- */
const GLOSSARY = [
  { keys: ["biopsia"], term: "Biopsia", adult: "Es tomar una muestra muy pequeña de un tejido para analizarla en el laboratorio con microscopio. Ayuda a confirmar un diagnóstico.", kid: "Los doctores toman un pedacito diminuto para mirarlo con una lupa súper potente." },
  { keys: ["ayuno", "ayunas"], term: "Ayuno", adult: "Significa no comer ni beber durante un tiempo indicado, normalmente antes de una cirugía, anestesia o algunos análisis, para que el procedimiento sea más seguro.", kid: "Tu pancita descansa un ratito sin comida para que todo salga bien." },
  { keys: ["cateter", "catéter"], term: "Catéter", adult: "Es un tubito delgado y flexible que se coloca en una vena u otra parte del cuerpo para administrar medicamentos, líquidos o extraer muestras sin pinchar varias veces.", kid: "Es como una pajita muy fina que ayuda a que la medicina llegue sin más pinchazos." },
  { keys: ["via intravenosa", "vía intravenosa", "suero", "intravenosa"], term: "Vía intravenosa (suero)", adult: "Es un pequeño tubo colocado en una vena, normalmente del brazo o la mano, por donde pasan líquidos, sales y medicamentos directamente a la sangre.", kid: "Es un tubito en tu brazo que te da agua y medicina para que tengas energía." },
  { keys: ["anestesia", "anestesico", "sedacion", "sedación"], term: "Anestesia", adult: "Medicamentos que evitan el dolor durante un procedimiento. Puede ser local (solo una zona) o general (el paciente duerme profundamente y no siente nada). Un anestesiólogo vigila todo el tiempo.", kid: "Es un sueño especial para que no sientas nada mientras los doctores te ayudan." },
  { keys: ["hemograma", "analisis de sangre", "análisis de sangre", "examen de sangre"], term: "Hemograma", adult: "Análisis de sangre que cuenta los glóbulos rojos, glóbulos blancos y plaquetas. Sirve para detectar anemia, infecciones u otros problemas.", kid: "Es contar los soldaditos y ayudantes que viajan por tu sangre." },
  { keys: ["apendicectomia", "apendicectomía", "apendice", "apéndice", "apendicitis"], term: "Apendicectomía", adult: "Cirugía para retirar el apéndice cuando se inflama (apendicitis). El cuerpo funciona perfectamente sin él. Suele hacerse por laparoscopia, con heridas muy pequeñas.", kid: "Los doctores quitaron una partecita de tu pancita que estaba enojada y dolía. ¡No la necesitas!" },
  { keys: ["laparoscopia", "laparoscopica", "laparoscópica"], term: "Laparoscopia", adult: "Técnica quirúrgica que usa una cámara pequeña y pequeñas incisiones en lugar de una gran herida. La recuperación suele ser más rápida y con menos dolor.", kid: "Los doctores usan una camarita muy chiquita para ver por dentro y solo hacen agujeritos pequeños." },
  { keys: ["ecografia", "ecografía", "ultrasonido"], term: "Ecografía", adult: "Estudio de imagen que usa ondas de sonido para ver los órganos por dentro. No duele y no usa radiación.", kid: "Es una cámara que ve por dentro usando sonidos que no puedes oír, con un gel fresquito." },
  { keys: ["radiografia", "radiografía", "rayos x", "placa"], term: "Radiografía", adult: "Imagen que usa una pequeña cantidad de rayos X para ver huesos y algunos órganos. Es rápida y no duele.", kid: "Es una foto especial que muestra tus huesos, ¡como un esqueleto!" },
  { keys: ["resonancia", "resonancia magnetica"], term: "Resonancia magnética", adult: "Estudio de imagen con imanes y ondas de radio que muestra órganos y tejidos con mucho detalle. Hace ruido, pero no duele y no usa radiación.", kid: "Es como entrar a un túnel que toma fotos muy detalladas. Hace ruidos fuertes, pero no duele." },
  { keys: ["antibiotico", "antibiótico", "antibioticos"], term: "Antibiótico", adult: "Medicamento que combate infecciones causadas por bacterias. Es importante completar todas las dosis indicadas, aunque el paciente se sienta mejor.", kid: "Es una medicina que pelea contra los bichitos que causan infecciones." },
  { keys: ["amoxicilina"], term: "Amoxicilina", adult: "Antibiótico de la familia de las penicilinas. Se usa para prevenir o tratar infecciones bacterianas. Avisa al equipo si aparece sarpullido o diarrea.", kid: "Es una medicina que ayuda a que no lleguen bichitos a tu herida." },
  { keys: ["paracetamol", "acetaminofen", "acetaminofén"], term: "Paracetamol", adult: "Analgésico y antipirético: calma el dolor y baja la fiebre. Se respetan los horarios para no superar la dosis máxima diaria.", kid: "Es la medicina que hace que el dolor y la fiebre se vayan." },
  { keys: ["ibuprofeno"], term: "Ibuprofeno", adult: "Antiinflamatorio que reduce el dolor, la inflamación y la fiebre. Se toma preferiblemente con algo de comida.", kid: "Ayuda a que lo que está hinchado y duele se calme." },
  { keys: ["ondansetron", "ondansetrón", "nauseas", "náuseas"], term: "Ondansetrón", adult: "Medicamento que previene o calma las náuseas y los vómitos, frecuentes después de una anestesia.", kid: "Es una medicina que hace que tu pancita deje de sentirse revuelta." },
  { keys: ["analgesico", "analgésico"], term: "Analgésico", adult: "Cualquier medicamento cuyo objetivo es aliviar el dolor.", kid: "Una medicina para que algo deje de doler." },
  { keys: ["alta", "alta medica", "alta médica"], term: "Alta médica", adult: "Es cuando el equipo médico decide que el paciente puede irse a casa. Se entregan indicaciones, recetas y la fecha del próximo control.", kid: "¡Es el día en que puedes volver a casa!" },
  { keys: ["curacion", "curación", "herida", "sutura", "puntos"], term: "Curación de herida", adult: "Limpieza y revisión de una herida o de los puntos de sutura para que cicatrice bien y sin infección.", kid: "La enfermera limpia tu heridita y le pone una curita nueva." },
  { keys: ["valoracion", "valoración", "triaje", "urgencias"], term: "Valoración", adult: "Evaluación en la que el equipo revisa los signos vitales, los síntomas y la historia del paciente para decidir los siguientes pasos.", kid: "Los doctores te conocen y revisan cómo estás." },
  { keys: ["signos vitales", "saturacion", "saturación", "oximetro", "oxímetro"], term: "Signos vitales", adult: "Mediciones básicas: temperatura, frecuencia cardiaca, respiración, presión arterial y saturación de oxígeno (con un pequeño clip en el dedo).", kid: "Es revisar tu temperatura, tu corazón y cómo respiras. ¡El clip del dedo no duele!" },
  { keys: ["fisioterapia", "rehabilitacion", "rehabilitación"], term: "Fisioterapia", adult: "Tratamiento con ejercicios y técnicas para recuperar movimiento, fuerza y equilibrio después de una lesión o cirugía.", kid: "Son ejercicios para que tu cuerpo vuelva a moverse fuerte." },
  { keys: ["fiebre"], term: "Fiebre", adult: "Temperatura corporal por encima de 38 °C. Suele ser una respuesta del cuerpo a una infección. Avisa a enfermería si aparece.", kid: "Cuando tu cuerpo se pone calentito porque está peleando contra bichitos." },
  { keys: ["inflamacion", "inflamación", "inflamado"], term: "Inflamación", adult: "Reacción del cuerpo ante una lesión o infección: la zona puede verse roja, hinchada, caliente y doler.", kid: "Cuando una parte del cuerpo se hincha porque se está curando." },
  { keys: ["fractura", "hueso roto", "yeso", "reduccion", "reducción"], term: "Fractura", adult: "Rotura de un hueso. Se trata acomodándolo (reducción) e inmovilizando la zona con yeso o férula; a veces con cirugía. Los huesos de los niños sanan rápido.", kid: "Es cuando un hueso se rompe. ¡Los huesos se pegan solitos con el tiempo!" },
  { keys: ["vacuna", "vacunas", "vacunacion", "vacunación"], term: "Vacuna", adult: "Protege contra enfermedades enseñándole al sistema inmune a reconocerlas. Puede causar molestia leve en el brazo o un poco de fiebre.", kid: "Es un entrenamiento para que tu cuerpo aprenda a defenderse de los bichitos." },
];

const normalize = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[¿?¡!.,;:()"“”]/g, " ").replace(/\s+/g, " ").trim();

function answer(question) {
  const q = ` ${normalize(question)} `;
  let best = null, bestLen = 0;
  for (const entry of GLOSSARY) {
    for (const k of entry.keys) {
      const nk = normalize(k);
      if (q.includes(` ${nk} `) && nk.length > bestLen) { best = entry; bestLen = nk.length; }
    }
  }
  if (!best && /^\s*(hola|buenas|hey)\b/.test(q)) {
    return "¡Hola! Escríbeme una palabra médica, por ejemplo <strong>anestesia</strong>, <strong>catéter</strong> o <strong>hemograma</strong>, y te la explico.";
  }
  if (!best) {
    return "Todavía no conozco esa palabra. Te recomiendo preguntarle a tu enfermera o médico — ¡ninguna pregunta es tonta! También puedes escribirle al equipo en “Mensajes del equipo”.";
  }
  return `<strong>${best.term}:</strong> ${best.adult}<span class="kid">En palabras sencillas: ${best.kid}</span>`;
}

/* ---------- Chat del asistente ---------- */
function setupChat(formId, inputId, logId) {
  const form = document.getElementById(formId);
  const input = document.getElementById(inputId);
  const log = document.getElementById(logId);

  const add = (html, who) => {
    const div = document.createElement("div");
    div.className = `msg ${who}`;
    if (who === "user") div.textContent = html; else div.innerHTML = html;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  };

  const ask = (text) => {
    if (!text.trim()) return;
    add(text, "user");
    const typing = add("<i></i><i></i><i></i>", "bot typing");
    setTimeout(() => { typing.remove(); add(answer(text), "bot"); }, 650 + Math.random() * 400);
  };

  form.addEventListener("submit", (e) => { e.preventDefault(); ask(input.value); input.value = ""; });
  return ask;
}

const askPreview = setupChat("previewForm", "previewInput", "previewLog");
const askPortal = setupChat("portalForm", "portalInput", "portalLog");
$$("#previewChips .chip").forEach((chip) => chip.addEventListener("click", () => askPreview(chip.dataset.q)));

function askAbout(term) {
  askPortal(`¿Qué es ${term}?`);
  $("#portalLog").scrollIntoView({ behavior: "smooth", block: "center" });
}

/* ---------- Navegación y vistas ---------- */
const views = { landing: $("#landing"), portal: $("#portal"), staff: $("#staff") };
const navLinks = $("#navLinks");
$("#navToggle").addEventListener("click", () => navLinks.classList.toggle("open"));
$$("a", navLinks).forEach((a) => a.addEventListener("click", () => navLinks.classList.remove("open")));

function showView(name) {
  Object.entries(views).forEach(([k, el]) => (el.hidden = k !== name));
  navLinks.hidden = name !== "landing";
  $("#navCta").hidden = name !== "landing";
  $("#navToggle").hidden = name !== "landing";
  window.scrollTo({ top: 0 });
}

const setSession = (s) => { try { s ? sessionStorage.setItem("ww-session", JSON.stringify(s)) : sessionStorage.removeItem("ww-session"); } catch (_) {} };

$$("[data-logout]").forEach((b) => b.addEventListener("click", () => {
  setSession(null);
  currentPatientId = null;
  currentStaff = null;
  selectedId = null;
  $("#patientId").value = "";
  $("#staffId").value = "";
  $("#staffCode").value = "";
  showView("landing");
}));

/* ---------- Login: pestañas ---------- */
function switchRole(role) {
  $$(".role-tab").forEach((t) => {
    const on = t.dataset.role === role;
    t.classList.toggle("active", on);
    t.setAttribute("aria-selected", on);
  });
  $("#patientPane").hidden = role !== "patient";
  $("#staffPane").hidden = role !== "staff";
}
$$(".role-tab").forEach((t) => t.addEventListener("click", () => switchRole(t.dataset.role)));
$$("[data-open-staff]").forEach((a) => a.addEventListener("click", () => { switchRole("staff"); setTimeout(() => $("#staffId").focus(), 400); }));

function shake(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }
const loginCard = $(".login-card");

/* Login de paciente */
const idInput = $("#patientId");
const ID_PATTERN = /^WW-\d{4}-\d{2}$/;
idInput.addEventListener("input", () => {
  let raw = idInput.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (raw.startsWith("WW")) raw = raw.slice(2);
  raw = raw.replace(/\D/g, "").slice(0, 6);
  let out = "WW-" + raw.slice(0, 4);
  if (raw.length > 4) out += "-" + raw.slice(4);
  idInput.value = raw.length ? out : "";
  $("#loginError").textContent = "";
});
$$("[data-demo]").forEach((b) => b.addEventListener("click", () => { idInput.value = b.dataset.demo; idInput.focus(); }));

$("#loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = idInput.value.trim().toUpperCase();
  const err = $("#loginError");
  if (!ID_PATTERN.test(id)) { err.textContent = "El ID debe tener el formato WW-0000-00."; return shake(loginCard); }
  if (!db.patients[id]) { err.textContent = "No encontramos ese ID. Revisa tu pulsera o pregunta en enfermería."; return shake(loginCard); }
  setSession({ role: "patient", id });
  openPatient(id);
});

/* Login de personal */
const staffIdInput = $("#staffId");
staffIdInput.addEventListener("input", () => {
  let v = staffIdInput.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const letters = v.replace(/\d/g, "").slice(0, 3);
  const digits = v.replace(/\D/g, "").slice(0, 4);
  staffIdInput.value = letters + (letters.length === 3 && (digits || v.length > 3) ? "-" + digits : "");
  $("#staffError").textContent = "";
});
$("#staffDemo").addEventListener("click", () => { staffIdInput.value = "MED-0042"; $("#staffCode").value = "2026"; });

$("#staffForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = staffIdInput.value.trim().toUpperCase();
  const code = $("#staffCode").value.trim();
  const acc = STAFF[id];
  if (!acc || acc.code !== code) {
    $("#staffError").textContent = "ID o código incorrecto.";
    return shake(loginCard);
  }
  setSession({ role: "staff", id });
  openStaff(id);
});

/* =========================================================
   PANEL DEL PACIENTE
   ========================================================= */
let currentPatientId = null;

function openPatient(id) {
  currentPatientId = id;
  showView("portal");
  renderPatient();
}

function renderPatient() {
  const p = db.patients[currentPatientId];
  if (!p) return;
  const hour = new Date().getHours();
  $("#greetingNote").textContent = hour < 12 ? "buenos días," : hour < 19 ? "buenas tardes," : "buenas noches,";
  $("#patientName").textContent = p.name.split(" ")[0];
  $("#patientMeta").textContent = `${p.age} años · ${p.room} · ${p.reason} · ID ${p.id}`;

  renderTimeline(p.procedures);
  $("#visitsPanel").hidden = p.type !== "internado";
  renderVisits(p);
  renderUpcoming(p);
  renderMeds(p.meds);
  renderReminders(p);
  renderThread($("#patientThread"), p.messages, "patient");
  renderRecord(p);
  renderDocs($("#patientDocs"), p, false);
}

function renderTimeline(procs) {
  const svg = $("#timelineSvg");
  const ns = "http://www.w3.org/2000/svg";
  const list = withStatus(procs);
  const empty = list.length === 0;
  $("#timelineEmpty").hidden = !empty;
  $(".timeline-scroll").hidden = empty;
  $("#procDetail").hidden = empty;
  $(".progress-row").hidden = empty;
  if (empty) return;

  const W = 1000, H = 210, padX = 70, midY = 105;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.innerHTML = "";

  const step = list.length > 1 ? (W - padX * 2) / (list.length - 1) : 0;
  const pts = list.map((_, i) => ({ x: list.length > 1 ? padX + i * step : W / 2, y: midY + (i % 2 ? 14 : -14) }));
  const pathFor = (arr) => arr.reduce((d, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1], cx = (prev.x + pt.x) / 2;
    return `${d} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");
  const mk = (tag, attrs) => { const el = document.createElementNS(ns, tag); Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v)); return el; };

  const nextIdx = list.findIndex((p) => p.status === "next");
  const lastDone = nextIdx === -1 ? pts.length - 1 : nextIdx;

  if (pts.length > 1) {
    svg.appendChild(mk("path", { d: pathFor(pts), fill: "none", stroke: "#988F8C", "stroke-width": 2.5, "stroke-dasharray": "6 7", "stroke-linecap": "round" }));
    const done = mk("path", { d: pathFor(pts.slice(0, lastDone + 1)), fill: "none", stroke: "#486C79", "stroke-width": 4, "stroke-linecap": "round" });
    svg.appendChild(done);
    const len = done.getTotalLength();
    if (len > 0) {
      done.style.strokeDasharray = len;
      done.style.strokeDashoffset = len;
      done.getBoundingClientRect();
      done.style.transition = "stroke-dashoffset 1.4s ease-out";
      requestAnimationFrame(() => (done.style.strokeDashoffset = 0));
    }
  }

  const nodes = [];
  list.forEach((p, i) => {
    const { x, y } = pts[i];
    const s = p.status;
    const g = mk("g", { class: "node", tabindex: 0, role: "button", "aria-label": `${p.title}, ${fmtDate(p.date)}` });
    if (s === "next") g.appendChild(mk("circle", { cx: x, cy: y, r: 19, fill: "rgba(194,164,153,.35)" }));
    const c = mk("circle", {
      cx: x, cy: y, r: s === "next" ? 12 : 10,
      fill: s === "done" ? "#486C79" : s === "next" ? "#C2A499" : "#FBF7F2",
      stroke: s === "future" ? "#988F8C" : "#FBF7F2", "stroke-width": 3,
    });
    if (s === "future") c.setAttribute("stroke-dasharray", "4 3");
    g.appendChild(c);
    if (s === "done") g.appendChild(mk("path", { d: `M ${x - 4} ${y} l 3 3 l 5 -6`, fill: "none", stroke: "#fff", "stroke-width": 2, "stroke-linecap": "round" }));

    const above = i % 2 === 0;
    const label = mk("text", { x, y: above ? y - 46 : y + 54, "text-anchor": "middle", class: "t-label" });
    label.textContent = p.title.length > 24 ? p.title.slice(0, 23) + "…" : p.title;
    const date = mk("text", { x, y: above ? y - 26 : y + 34, "text-anchor": "middle", class: "t-date" });
    date.textContent = fmtDay(p.date);
    g.append(label, date);

    const select = () => showProc(p, g, nodes);
    g.addEventListener("click", select);
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(); } });
    svg.appendChild(g);
    nodes.push(g);
  });

  const doneCount = list.filter((p) => p.status === "done").length;
  const pct = Math.round((doneCount / list.length) * 100);
  const fill = $("#progressFill");
  fill.style.width = "0";
  requestAnimationFrame(() => setTimeout(() => (fill.style.width = pct + "%"), 50));
  $("#progressLabel").textContent = `${doneCount} de ${list.length} pasos · ¡vas muy bien!`;

  const startIdx = nextIdx === -1 ? list.length - 1 : nextIdx;
  showProc(list[startIdx], nodes[startIdx], nodes);
}

function showProc(p, node, nodes) {
  nodes.forEach((n) => n.classList.remove("active"));
  node.classList.add("active");
  const where = whereOf(p.area);
  const box = $("#procDetail");
  box.innerHTML = `
    <div>
      <span class="tag ${p.status}">${STATUS_TEXT[p.status]}</span><span class="muted">${esc(fmtDate(p.date))} · ${esc(p.time || "")}</span>
      <h3>${esc(p.title)}</h3>
      ${p.desc ? `<p>${esc(p.desc)}</p>` : ""}
      <p class="proc-meta"><b>Responsable:</b> ${esc(p.doctor || "Por asignar")} · <b>Dónde:</b> ${esc(p.area || "Por definir")}${where && where !== "En tu habitación" ? ` — ${esc(where)}` : ""}</p>
    </div>`;
  const btn = document.createElement("button");
  btn.className = "ask-btn";
  btn.textContent = `¿Qué es “${p.title.toLowerCase()}”?`;
  btn.addEventListener("click", () => askAbout(p.title.toLowerCase()));
  box.appendChild(btn);
}

function renderVisits(p) {
  const ul = $("#visitsList");
  const visits = p.appointments.filter((a) => a.type === VISIT && a.date === todayISO()).sort(sortByDate);
  if (!visits.length) { ul.innerHTML = `<li class="empty">Hoy no hay visitas programadas.</li>`; return; }
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  ul.innerHTML = visits.map((v) => {
    const [h, m] = (v.time || "00:00").split(":").map(Number);
    const doc = DOCTORS.find((d) => d.name === v.doctor);
    return `<li class="${h * 60 + m + 30 < mins ? "past" : ""}">
      <span class="visit-time">${esc(v.time)}</span>
      <div><div class="visit-doc">${esc(v.doctor)}</div><div class="visit-role">${esc(doc ? doc.spec + " · " : "")}${esc(v.title)}</div></div>
    </li>`;
  }).join("");
}

function renderUpcoming(p) {
  const t = todayISO();
  const items = [
    ...p.appointments.filter((a) => a.type !== VISIT && a.date >= t),
    ...p.procedures.filter((x) => x.date >= t && x.area !== "Habitación del paciente").map((x) => ({ ...x, notes: x.desc })),
  ].sort(sortByDate).slice(0, 6);
  const ul = $("#upcomingList");
  if (!items.length) { ul.innerHTML = `<li class="empty">No tienes citas fuera de tu habitación por ahora.</li>`; return; }
  ul.innerHTML = items.map((a) => {
    const d = parseISO(a.date);
    const month = d.toLocaleDateString("es", { month: "short" }).replace(".", "");
    return `<li>
      <div class="date-chip"><b>${d.getDate()}</b><small>${esc(month)}</small></div>
      <div>
        <div class="up-title">${esc(a.title)}</div>
        <div class="up-sub">${esc(fmtDay(a.date))} · ${esc(a.time)} · ${esc(a.doctor)}</div>
        <div class="up-where">${esc(a.area)} — ${esc(whereOf(a.area))}</div>
        ${a.notes ? `<div class="up-notes">${esc(a.notes)}</div>` : ""}
      </div>
    </li>`;
  }).join("");
}

function renderMeds(meds) {
  const ul = $("#medsList");
  if (!meds.length) { ul.innerHTML = `<li class="empty" style="cursor:default;border:0;background:none;padding:0">Sin medicamentos activos.</li>`; return; }
  ul.innerHTML = "";
  meds.forEach((m) => {
    const li = document.createElement("li");
    li.title = "Toca para que el asistente te lo explique";
    li.innerHTML = `
      <div class="med-top"><span class="med-name">${esc(m.name)}</span><span class="med-dose">${esc(m.dose)}</span></div>
      <div class="med-purpose">${esc(m.purpose || "")}</div>
      <div class="med-next">${esc(m.every || "")}${m.next ? ` · próxima: ${esc(m.next)}` : ""}</div>`;
    li.addEventListener("click", () => askAbout(m.name));
    ul.appendChild(li);
  });
}

function renderReminders(p) {
  const ul = $("#remindersList");
  const key = `ww-rem-${p.id}`;
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(key) || "{}"); } catch (_) {}
  if (!p.reminders.length) { ul.innerHTML = `<li class="empty">Sin recordatorios.</li>`; return; }
  ul.innerHTML = "";
  p.reminders.forEach((r) => {
    const li = document.createElement("li");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = `rem-${r.id}`;
    cb.checked = !!saved[r.id];
    const label = document.createElement("label");
    label.htmlFor = cb.id;
    label.innerHTML = `<span class="rem-text">${esc(r.text)}</span><span class="rem-when">${esc(r.when || "")}</span>`;
    li.classList.toggle("checked", cb.checked);
    cb.addEventListener("change", () => {
      li.classList.toggle("checked", cb.checked);
      saved[r.id] = cb.checked;
      try { localStorage.setItem(key, JSON.stringify(saved)); } catch (_) {}
    });
    li.append(cb, label);
    ul.appendChild(li);
  });
}

/* Conversación: `viewer` es "patient" o "staff" (los mensajes propios van a la derecha) */
function renderThread(el, messages, viewer) {
  if (!messages.length) {
    el.innerHTML = `<p class="empty">${viewer === "staff" ? "Aún no hay mensajes con esta familia." : "Aquí verás los mensajes de tu equipo médico."}</p>`;
    return;
  }
  el.innerHTML = messages.map((m) => `
    <div class="bubble ${m.from === viewer ? "mine" : ""} ${m.important ? "important" : ""}">
      <span class="bubble-meta">${esc(m.author)} · ${esc(fmtStamp(m.at))}${m.important ? '<span class="badge-imp">importante</span>' : ""}</span>
      ${esc(m.text)}
    </div>`).join("");
  el.scrollTop = el.scrollHeight;
}

$("#patientReplyForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = e.target.elements.text;
  const text = input.value.trim();
  const p = db.patients[currentPatientId];
  if (!text || !p) return;
  p.messages.push({ id: uid(), from: "patient", author: `${p.name.split(" ")[0]} / familia`, text, at: new Date().toISOString(), important: false, unread: true });
  saveDB();
  input.value = "";
  renderThread($("#patientThread"), p.messages, "patient");
});

function renderRecord(p) {
  const r = p.record || {};
  const rows = [["Tipo de sangre", r.blood], ["Alergias", r.allergies], ["Peso", r.weight], ["Talla", r.height], ["Diagnóstico", r.diagnosis]]
    .filter(([, v]) => v);
  $("#patientRecord").innerHTML = rows.length || r.notes
    ? rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("") +
      (r.notes ? `<dd class="rec-notes">“${esc(r.notes)}”${r.by ? ` — ${esc(r.by)}` : ""}</dd>` : "")
    : `<dd class="empty">El equipo médico aún no ha compartido datos.</dd>`;
}

function renderDocs(ul, p, editable) {
  if (!p.docs.length) {
    ul.innerHTML = `<li class="empty">${editable ? "Aún no se han subido documentos." : "Aún no hay documentos compartidos."}</li>`;
    return;
  }
  ul.innerHTML = p.docs.map((d) => {
    const ext = (d.name.split(".").pop() || "").slice(0, 4).toUpperCase();
    return `<li class="doc">
      <span class="doc-icon">${esc(ext)}</span>
      <div class="doc-info">
        <div class="doc-name" title="${esc(d.name)}">${esc(d.name)}</div>
        <div class="doc-sub">${esc(d.category)} · ${esc(fmtSize(d.size))} · ${esc(fmtStamp(d.at))}</div>
      </div>
      <button class="mini-btn" data-open="${d.id}">Ver</button>
      ${editable ? `<button class="mini-btn danger" data-remove="${d.id}">Quitar</button>` : ""}
    </li>`;
  }).join("");
}

async function openDoc(doc) {
  if (!doc || !doc.data) return toast("Este archivo no está disponible en este dispositivo.");
  const blob = await (await fetch(doc.data)).blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

$("#patientDocs").addEventListener("click", (e) => {
  const id = e.target.dataset.open;
  if (id) openDoc(db.patients[currentPatientId].docs.find((d) => d.id === id));
});

/* =========================================================
   PANEL CLÍNICO
   ========================================================= */
let currentStaff = null;
let selectedId = null;
let listFilter = "all";

const sel = () => db.patients[selectedId];

function openStaff(staffId) {
  currentStaff = { id: staffId, ...STAFF[staffId] };
  $("#staffName").textContent = currentStaff.name;
  $("#staffMeta").textContent = `${currentStaff.role} · ID ${staffId} · ${new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}`;
  showView("staff");
  renderPatientList();
  if (selectedId && db.patients[selectedId]) selectPatient(selectedId);
}

/* Rellenar selects de médicos, áreas y tipos de cita */
$$(".doctor-select").forEach((s) => (s.innerHTML = DOCTORS.map((d) => `<option value="${esc(d.name)}">${esc(d.name)} — ${esc(d.spec)}</option>`).join("")));
$$(".area-select").forEach((s) => (s.innerHTML = AREAS.map((a) => `<option value="${esc(a.name)}">${esc(a.name)}</option>`).join("")));
$("#citaType").innerHTML = CITA_TYPES.map((t) => `<option>${esc(t)}</option>`).join("");
$("#tplSelect").innerHTML = TEMPLATES.map((t, i) => `<option value="${i}">${esc(t.name)}</option>`).join("");

/* Lista de pacientes */
function renderPatientList() {
  const q = normalize($("#patientSearch").value || "");
  const list = Object.values(db.patients)
    .filter((p) => listFilter === "all" || p.type === listFilter)
    .filter((p) => !q || normalize(p.name).includes(q) || p.id.toLowerCase().includes(q.replace(/\s/g, "")))
    .sort((a, b) => a.name.localeCompare(b.name));
  const ul = $("#patientList");
  if (!list.length) { ul.innerHTML = `<li class="empty">Sin resultados.</li>`; return; }
  ul.innerHTML = list.map((p) => {
    const unread = p.messages.some((m) => m.from === "patient" && m.unread);
    return `<li><button class="patient-item ${p.id === selectedId ? "active" : ""}" data-id="${p.id}">
      <span class="pi-name">${esc(p.name)}${unread ? '<i class="unread-dot" title="Mensaje nuevo"></i>' : ""}<span class="pi-type ${p.type}">${p.type === "internado" ? "internado" : "con cita"}</span></span>
      <span class="pi-sub">${esc(p.id)} · ${esc(p.reason)}</span>
    </button></li>`;
  }).join("");
}
$("#patientList").addEventListener("click", (e) => {
  const b = e.target.closest(".patient-item");
  if (b) selectPatient(b.dataset.id);
});
$("#patientSearch").addEventListener("input", renderPatientList);
$$("#filterRow .filter").forEach((f) => f.addEventListener("click", () => {
  listFilter = f.dataset.filter;
  $$("#filterRow .filter").forEach((x) => x.classList.toggle("active", x === f));
  renderPatientList();
}));

function selectPatient(id) {
  selectedId = id;
  resetForm($("#procForm"));
  resetForm($("#citaForm"));
  $("#staffEmpty").hidden = true;
  $("#staffPatient").hidden = false;
  renderStaffPatient();
  renderPatientList();
}

function renderStaffPatient() {
  const p = sel();
  if (!p) return;
  $("#spName").textContent = p.name;
  $("#spMeta").textContent = `${p.age} años · ${p.type === "internado" ? "Internado" : "Con cita (no internado)"} · ${p.room} · ${p.reason}`;
  $("#spId").textContent = p.id;
  renderAdminProcs();
  renderAdminCitas();
  renderAdminReminders();
  renderAdminMessages();
  renderAdminRecord();
  renderDocs($("#staffDocs"), p, true);
  renderAdminMeds();
  renderTplPreview();
}

/* Pestañas */
function switchTab(tab) {
  $$("#staffTabs .staff-tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === tab));
  $$("#staffPatient .tab-pane").forEach((p) => (p.hidden = p.dataset.pane !== tab));
  if (tab === "mensajes") {
    const p = sel();
    let changed = false;
    p.messages.forEach((m) => { if (m.unread) { m.unread = false; changed = true; } });
    if (changed) { saveDB(); renderPatientList(); }
    renderAdminMessages();
  }
}
$$("#staffTabs .staff-tab").forEach((t) => t.addEventListener("click", () => switchTab(t.dataset.tab)));

/* Helpers de formularios */
const readForm = (form) => Object.fromEntries(new FormData(form).entries());
function fillForm(form, obj) {
  [...form.elements].forEach((el) => { if (el.name && obj[el.name] !== undefined) el.value = obj[el.name]; });
}
function resetForm(form) {
  form.reset();
  if (form.elements.id) form.elements.id.value = "";
  const submit = $("[data-submit]", form);
  if (submit) submit.textContent = form.id === "procForm" ? "Agregar procedimiento" : "Agendar cita";
  const title = $("[data-form-title]", form);
  if (title) title.textContent = form.id === "procForm" ? "Agregar procedimiento" : "Agendar cita";
  const cancel = $("[data-cancel]", form);
  if (cancel) cancel.hidden = true;
  if (form.elements.date) form.elements.date.value = todayISO();
  $$(".admin-item.editing").forEach((li) => li.classList.remove("editing"));
  if (form.id === "citaForm") updateWhereHint();
}
function startEdit(form, item, label) {
  fillForm(form, item);
  $("[data-submit]", form).textContent = "Guardar cambios";
  $("[data-form-title]", form).textContent = `Editar: ${item.title}`;
  $("[data-cancel]", form).hidden = false;
  if (form.id === "citaForm") updateWhereHint();
  form.scrollIntoView({ behavior: "smooth", block: "center" });
  toast(`Editando “${label}”`);
}
$$("[data-cancel]").forEach((b) => b.addEventListener("click", () => resetForm(b.closest("form"))));

/* --- Procedimientos --- */
function renderAdminProcs() {
  const ul = $("#spProcs");
  const list = withStatus(sel().procedures);
  ul.innerHTML = list.length ? list.map((p) => `
    <li class="admin-item" data-id="${p.id}">
      <div>
        <span class="tag ${p.status}">${STATUS_TEXT[p.status]}</span><strong>${esc(p.title)}</strong>
        <div class="admin-sub">${esc(fmtDate(p.date))} · ${esc(p.time)} — ${esc(p.doctor)} · ${esc(p.area)}</div>
      </div>
      <div class="admin-actions">
        <button class="mini-btn" data-edit="${p.id}">Editar</button>
        <button class="mini-btn danger" data-del="${p.id}">Eliminar</button>
      </div>
    </li>`).join("") : `<li class="empty">Sin procedimientos registrados. Usa el plan automático o agrégalos uno por uno.</li>`;
}
$("#spProcs").addEventListener("click", (e) => {
  const p = sel();
  const { edit, del } = e.target.dataset;
  if (edit) {
    const item = p.procedures.find((x) => x.id === edit);
    startEdit($("#procForm"), item, item.title);
    e.target.closest(".admin-item").classList.add("editing");
  }
  if (del) {
    const item = p.procedures.find((x) => x.id === del);
    if (!confirm(`¿Eliminar “${item.title}” del plan de ${p.name}?`)) return;
    p.procedures = p.procedures.filter((x) => x.id !== del);
    saveDB(); renderAdminProcs(); resetForm($("#procForm"));
    toast("Procedimiento eliminado.");
  }
});
$("#procForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const p = sel();
  const data = readForm(e.target);
  if (data.id) {
    Object.assign(p.procedures.find((x) => x.id === data.id), data);
    toast("Cambios guardados. La familia ya los ve.");
  } else {
    p.procedures.push({ ...data, id: uid() });
    toast(`“${data.title}” se agregó al plan de ${p.name.split(" ")[0]}.`);
  }
  saveDB(); renderAdminProcs(); resetForm(e.target);
});

/* --- Plan automático --- */
function renderTplPreview() {
  const tpl = TEMPLATES[$("#tplSelect").value];
  const base = $("#tplDate").value || todayISO();
  const baseDate = parseISO(base);
  $("#tplPreview").innerHTML = tpl.steps.map((s) => {
    const d = new Date(baseDate); d.setDate(d.getDate() + s.d);
    return `<li><b>${esc(s.title)}</b> <span>· ${esc(fmtDate(iso(d)))} ${esc(s.time)} · ${esc(s.doctor)} · ${esc(s.area)}</span></li>`;
  }).join("");
}
$("#tplDate").value = todayISO();
$("#tplSelect").addEventListener("change", renderTplPreview);
$("#tplDate").addEventListener("change", renderTplPreview);
$("#tplApply").addEventListener("click", () => {
  const p = sel();
  const tpl = TEMPLATES[$("#tplSelect").value];
  const baseDate = parseISO($("#tplDate").value || todayISO());
  tpl.steps.forEach((s) => {
    const d = new Date(baseDate); d.setDate(d.getDate() + s.d);
    p.procedures.push({ id: uid(), title: s.title, date: iso(d), time: s.time, doctor: s.doctor, area: s.area, desc: s.desc });
  });
  saveDB(); renderAdminProcs();
  toast(`Se agregaron ${tpl.steps.length} pasos de “${tpl.name}”.`);
});

/* --- Citas --- */
function renderAdminCitas() {
  const ul = $("#spCitas");
  const list = [...sel().appointments].sort(sortByDate);
  ul.innerHTML = list.length ? list.map((a) => `
    <li class="admin-item" data-id="${a.id}">
      <div>
        <span class="type-pill ${a.type === VISIT ? "visit" : ""}">${esc(a.type)}</span><strong>${esc(a.title)}</strong>
        <div class="admin-sub">${esc(fmtDay(a.date))} · ${esc(a.time)} — ${esc(a.doctor)} · ${esc(a.area)}${whereOf(a.area) && a.type !== VISIT ? ` (${esc(whereOf(a.area))})` : ""}</div>
      </div>
      <div class="admin-actions">
        <button class="mini-btn" data-edit="${a.id}">Editar</button>
        <button class="mini-btn danger" data-del="${a.id}">Eliminar</button>
      </div>
    </li>`).join("") : `<li class="empty">Sin citas agendadas.</li>`;
}
$("#spCitas").addEventListener("click", (e) => {
  const p = sel();
  const { edit, del } = e.target.dataset;
  if (edit) {
    const item = p.appointments.find((x) => x.id === edit);
    startEdit($("#citaForm"), item, item.title);
    e.target.closest(".admin-item").classList.add("editing");
  }
  if (del) {
    const item = p.appointments.find((x) => x.id === del);
    if (!confirm(`¿Eliminar la cita “${item.title}”?`)) return;
    p.appointments = p.appointments.filter((x) => x.id !== del);
    saveDB(); renderAdminCitas(); resetForm($("#citaForm"));
    toast("Cita eliminada.");
  }
});
function updateWhereHint() {
  const f = $("#citaForm");
  const where = whereOf(f.elements.area.value);
  $("#citaWhere").textContent = where ? `La familia verá: ${where}` : "";
}
$("#citaForm").elements.area.addEventListener("change", updateWhereHint);
$("#citaType").addEventListener("change", (e) => {
  if (e.target.value === VISIT) $("#citaForm").elements.area.value = "Habitación del paciente";
  updateWhereHint();
});
$("#citaForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const p = sel();
  const data = readForm(e.target);
  if (data.id) {
    Object.assign(p.appointments.find((x) => x.id === data.id), data);
    toast("Cita actualizada.");
  } else {
    p.appointments.push({ ...data, id: uid() });
    toast(`Cita agendada para ${fmtDay(data.date)} a las ${data.time}.`);
  }
  saveDB(); renderAdminCitas(); resetForm(e.target);
});

/* --- Recordatorios --- */
function renderAdminReminders() {
  const ul = $("#spReminders");
  const list = sel().reminders;
  ul.innerHTML = list.length ? list.map((r) => `
    <li class="admin-item">
      <div><strong>${esc(r.text)}</strong><div class="admin-sub">${esc(r.when || "")}</div></div>
      <div class="admin-actions"><button class="mini-btn danger" data-del="${r.id}">Quitar</button></div>
    </li>`).join("") : `<li class="empty">Sin recordatorios.</li>`;
}
$("#spReminders").addEventListener("click", (e) => {
  const id = e.target.dataset.del;
  if (!id) return;
  sel().reminders = sel().reminders.filter((r) => r.id !== id);
  saveDB(); renderAdminReminders();
});
$("#reminderForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = readForm(e.target);
  sel().reminders.push({ id: uid(), text: data.text.trim(), when: data.when.trim() });
  saveDB(); renderAdminReminders(); e.target.reset();
  toast("Recordatorio agregado.");
});

/* --- Mensajes --- */
function renderAdminMessages() {
  const p = sel();
  renderThread($("#staffThread"), p.messages, "staff");
  const unread = p.messages.filter((m) => m.from === "patient" && m.unread).length;
  $("#msgCount").hidden = !unread;
  $("#msgCount").textContent = unread;
}
$$("#quickMsgs .chip").forEach((c) => c.addEventListener("click", () => {
  const ta = $("#staffMsgForm").elements.text;
  ta.value = c.dataset.text;
  ta.focus();
}));
$("#staffMsgForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target;
  const text = f.elements.text.value.trim();
  if (!text) return;
  sel().messages.push({ id: uid(), from: "staff", author: currentStaff.name, text, at: new Date().toISOString(), important: f.elements.important.checked });
  saveDB(); f.reset(); renderAdminMessages();
  toast("Mensaje enviado a la familia.");
});

/* --- Expediente: datos clínicos --- */
function renderAdminRecord() {
  const r = sel().record || {};
  const f = $("#recordForm");
  f.reset();
  fillForm(f, r);
  $("#recordUpdated").textContent = r.updated ? `Última actualización: ${fmtStamp(r.updated)}${r.by ? ` por ${r.by}` : ""}` : "";
}
$("#recordForm").addEventListener("submit", (e) => {
  e.preventDefault();
  sel().record = { ...readForm(e.target), updated: new Date().toISOString(), by: currentStaff.name };
  saveDB(); renderAdminRecord();
  toast("Expediente actualizado.");
});

/* --- Expediente: archivos --- */
const MAX_FILE = 2 * 1024 * 1024;
const readAsDataURL = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = rej;
  r.readAsDataURL(file);
});

async function uploadFiles(files) {
  const p = sel();
  if (!p) return;
  const category = $("#docCategory").value;
  let added = 0;
  for (const file of files) {
    const okType = file.type === "application/pdf" || file.type.startsWith("image/");
    if (!okType) { toast(`“${file.name}” no es PDF ni imagen.`); continue; }
    if (file.size > MAX_FILE) { toast(`“${file.name}” pesa más de 2 MB.`); continue; }
    const doc = { id: uid(), name: file.name, size: file.size, type: file.type, category, data: await readAsDataURL(file), at: new Date().toISOString(), by: currentStaff.name };
    p.docs.unshift(doc);
    if (!saveDB()) { p.docs.shift(); break; }
    added++;
  }
  renderDocs($("#staffDocs"), p, true);
  if (added) toast(added === 1 ? "Documento subido al expediente." : `${added} documentos subidos al expediente.`);
}

const dropzone = $("#dropzone");
$("#docInput").addEventListener("change", (e) => { uploadFiles([...e.target.files]); e.target.value = ""; });
["dragenter", "dragover"].forEach((ev) => dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.add("over"); }));
["dragleave", "drop"].forEach((ev) => dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.remove("over"); }));
dropzone.addEventListener("drop", (e) => uploadFiles([...e.dataTransfer.files]));

$("#staffDocs").addEventListener("click", (e) => {
  const p = sel();
  const { open, remove } = e.target.dataset;
  if (open) openDoc(p.docs.find((d) => d.id === open));
  if (remove) {
    const d = p.docs.find((x) => x.id === remove);
    if (!confirm(`¿Quitar “${d.name}” del expediente?`)) return;
    p.docs = p.docs.filter((x) => x.id !== remove);
    saveDB(); renderDocs($("#staffDocs"), p, true);
  }
});

/* --- Medicamentos --- */
function renderAdminMeds() {
  const ul = $("#spMeds");
  const list = sel().meds;
  ul.innerHTML = list.length ? list.map((m) => `
    <li class="admin-item">
      <div><strong>${esc(m.name)}</strong> <span class="muted">${esc(m.dose)}</span>
        <div class="admin-sub">${esc(m.purpose || "")}${m.every ? ` · ${esc(m.every)}` : ""}${m.next ? ` · próxima ${esc(m.next)}` : ""}</div></div>
      <div class="admin-actions"><button class="mini-btn danger" data-del="${m.id}">Suspender</button></div>
    </li>`).join("") : `<li class="empty">Sin medicamentos activos.</li>`;
}
$("#spMeds").addEventListener("click", (e) => {
  const id = e.target.dataset.del;
  if (!id) return;
  const m = sel().meds.find((x) => x.id === id);
  if (!confirm(`¿Suspender ${m.name}?`)) return;
  sel().meds = sel().meds.filter((x) => x.id !== id);
  saveDB(); renderAdminMeds();
});
$("#medForm").addEventListener("submit", (e) => {
  e.preventDefault();
  sel().meds.push({ id: uid(), ...readForm(e.target) });
  saveDB(); renderAdminMeds(); e.target.reset();
  toast("Medicamento agregado.");
});

/* --- Nuevo paciente --- */
const dialog = $("#newPatientDialog");
$("#newPatientBtn").addEventListener("click", () => { $("#newPatientForm").reset(); dialog.showModal(); });
$("#cancelNewPatient").addEventListener("click", () => dialog.close());

function generateId() {
  let id;
  do {
    id = `WW-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}-${String(Math.floor(Math.random() * 100)).padStart(2, "0")}`;
  } while (db.patients[id]);
  return id;
}

$("#newPatientForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const d = readForm(e.target);
  const id = generateId();
  db.patients[id] = {
    id, name: d.name.trim(), age: Number(d.age), type: d.type,
    room: d.room.trim() || (d.type === "internado" ? "Hospitalización" : "Consulta externa"),
    reason: d.reason.trim(),
    procedures: [], appointments: [], meds: [], reminders: [], messages: [], docs: [],
    record: { updated: new Date().toISOString(), by: currentStaff.name },
  };
  saveDB();
  dialog.close();
  selectPatient(id);
  switchTab(d.type === "internado" ? "procs" : "citas");
  toast(`Paciente registrado. Su ID es ${id} — entrégalo a la familia.`);
});

/* ---------- Animación al hacer scroll ---------- */
const revealEls = $$(".feature, .step, .hospital-note, .chat-card");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.15 });
  revealEls.forEach((el) => { el.classList.add("reveal"); io.observe(el); });
}

/* ---------- Sincronizar entre pestañas ----------
   Si el personal actualiza algo en otra pestaña, la vista del paciente se refresca sola. */
window.addEventListener("storage", (e) => {
  if (e.key !== DB_KEY) return;
  db = loadDB();
  if (!views.portal.hidden && currentPatientId) renderPatient();
  if (!views.staff.hidden && currentStaff) {
    renderPatientList();
    if (sel()) { renderAdminMessages(); renderAdminProcs(); renderAdminCitas(); renderDocs($("#staffDocs"), sel(), true); }
  }
});

/* ---------- Restaurar sesión ---------- */
try {
  const s = JSON.parse(sessionStorage.getItem("ww-session") || "null");
  if (s && s.role === "patient" && db.patients[s.id]) openPatient(s.id);
  if (s && s.role === "staff" && STAFF[s.id]) openStaff(s.id);
} catch (_) {}
