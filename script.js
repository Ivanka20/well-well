/* =========================================================
Well Well · lógica de la landing, el panel del paciente
y el panel clínico del personal.Nota: es una demo sin servidor. Los datos se guardan en el
navegador (localStorage), así que lo que el personal cambia
se ve en la cuenta del paciente en este mismo navegador.
En producción, el login, los datos y los archivos vivirían
en el servidor del hospital, y el asistente se conectaría a
un modelo de IA desde ese servidor.
========================================================= *//* ---------- Inicialización de Supabase ---------- */
const supabaseUrl = 'https://xkfoiggivoxiwwkzcpbe.supabase.co'
const supabaseKey = 'sb_publishable_4v_AY40WLUYn78Bn1dETlQ_PJnc5bE'
const supabase = supabase.createClient(supabaseUrl, supabaseKey)/* ---------- Utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s = "") =>
String(s).replace(/[&<>"']/g, (c) => ({ "&": "&", "<": "<", ">": ">", '"': """, "'": "'" }[c]));
const uid = () => Math.random().toString(36).slice(2, 10);
const pad = (n) => String(n).padStart(2, "0");
const DAY = 24 * 60 * 60 * 1000;const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const iso = (d) => ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())};
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
const sortByDate = (a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || ""));function toast(msg) {
const t = $("#toast");
t.textContent = msg;
t.classList.add("show");
clearTimeout(toast._t);
toast._t = setTimeout(() => t.classList.remove("show"), 3200);
}/* ---------- Catálogos del hospital ---------- */
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
];const AREAS = [
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
const whereOf = (area) => (AREAS.find((a) => a.name === area) || {}).where || "";const VISIT = "Visita a la habitación";
const CITA_TYPES = [VISIT, "Consulta", "Control", "Estudio", "Revisión anual", "Vacunación", "Terapia"];/* Cuentas de personal (demo). En producción: inicio de sesión del hospital. */
const STAFF = {
"MED-0042": { code: "2026", name: "Dra. Carmen Ortiz", role: "Pediatría" },
"ENF-0108": { code: "1234", name: "Enf. Laura Gómez", role: "Enfermería" },
};/* Protocolos para el plan automático. d = días desde la fecha de inicio. */
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
];/* ---------- Base de datos (demo en localStorage) ---------- */
const DB_KEY = "ww-db-v2";function seedDB() {
const visit = (time, doctor, title) => ({ id: uid(), type: VISIT, title, date: todayISO(), time, doctor, area: "Habitación del paciente", notes: "" });
const proc = (title, d, time, doctor, area, desc) => ({ id: uid(), title, date: isoIn(d), time, doctor, area, desc });
const rem = (text, when) => ({ id: uid(), text, when });return {
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
},  "WW-1120-05": {
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
}function loadDB() {
try {
const raw = localStorage.getItem(DB_KEY);
if (raw) return JSON.parse(raw);
} catch (_) {}
return seedDB();
}
let db = loadDB();function saveDB() {
try {
localStorage.setItem(DB_KEY, JSON.stringify(db));
return true;
} catch (_) {
toast("No hay espacio para guardar en este navegador. Prueba con un archivo más pequeño.");
return false;
}
}
saveDB();/* Ordena procedimientos y marca su estado: realizado / próximo / programado */
function withStatus(procs) {
const list = [...procs].sort(sortByDate);
const t = todayISO();
const next = list.findIndex((p) => p.date >= t);
return list.map((p, i) => ({ ...p, status: next === -1 || i < next ? "done" : i === next ? "next" : "future" }));
}
const STATUS_TEXT = { done: "Realizado", next: "Próximo", future: "Programado" };/* ---------- Glosario del asistente ---------- */
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
];const normalize = (s) =>
s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[¿?¡!.,;:()"“”]/g, " ").replace(/\s+/g, " ").trim();function answer(question) {
const q = ${normalize(question)};
let best = null, bestLen = 0;
for (const entry of GLOSSARY) {
for (const k of entry.keys) {
const nk = normalize(k);
if (q.includes(${nk}) && nk.length > bestLen) { best = entry; bestLen = nk.length; }
}
}
if (!best && /^\s*(hola|buenas|hey)\b/.test(q)) {
return "¡Hola! Escríbeme una palabra médica, por ejemplo anestesia, catéter o hemograma, y te la explico.";
}
if (!best) {
return "Todavía no conozco esa palabra. Te recomiendo preguntarle a tu enfermera o médico — ¡ninguna pregunta es tonta! También puedes escribirle al equipo en “Mensajes del equipo”.";
}
return <strong>${best.term}:</strong> ${best.adult}<span class="kid">En palabras sencillas: ${best.kid}</span>;
}/* ---------- Chat del asistente ---------- */
function setupChat(formId, inputId, logId) {
const form = document.getElementById(formId);
const input = document.getElementById(inputId);
const log = document.getElementById(logId);const add = (html, who) => {
const div = document.createElement("div");
div.className = msg ${who};
if (who === "user") div.textContent = html; else div.innerHTML = html;
log.appendChild(div);
log.scrollTop = log.scrollHeight;
return div;
};const ask = (text) => {
if (!text.trim()) return;
add(text, "user");
const typing = add("", "bot typing");
setTimeout(() => { typing.remove(); add(answer(text), "bot"); }, 650 + Math.random() * 400);
};form.addEventListener("submit", (e) => { e.preventDefault(); ask(input.value); input.value = ""; });
return ask;
}const askPreview = setupChat("previewForm", "previewInput", "previewLog");
const askPortal = setupChat("portalForm", "portalInput", "portalLog");
$$("#previewChips .chip").forEach((chip) => chip.addEventListener("click", () => askPreview(chip.dataset.q)));function askAbout(term) {
askPortal(¿Qué es ${term}?);
$("#portalLog").scrollIntoView({ behavior: "smooth", block: "center" });
}/* ---------- Navegación y vistas ---------- */
const views = { landing: $("#landing"), portal: $("#portal"), staff: $("#staff") };
const navLinks = $("#navLinks");
$("#navToggle").addEventListener("click", () => navLinks.classList.toggle("open"));
$$("a", navLinks).forEach((a) => a.addEventListener("click", () => navLinks.classList.remove("open")));function showView(name) {
Object.entries(views).forEach(([k, el]) => (el.hidden = k !== name));
navLinks.hidden = name !== "landing";
$("#navCta").hidden = name !== "landing";
$("#navToggle").hidden = name !== "landing";
window.scrollTo({ top: 0 });
}const setSession = (s) => { try { s ? sessionStorage.setItem("ww-session", JSON.stringify(s)) : sessionStorage.removeItem("ww-session"); } catch (_) {} };$$("[data-logout]").forEach((b) => b.addEventListener("click", () => {
setSession(null);
currentPatientId = null;
currentStaff = null;
selectedId = null;
$("#patientId").value = "";
$("#staffId").value = "";
$("#staffCode").value = "";
showView("landing");
}));/* ---------- Login: pestañas ---------- */
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
$$("[data-open-staff]").forEach((a) => a.addEventListener("click", () => { switchRole("staff"); setTimeout(() => $("#staffId").focus(), 400); }));function shake(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }
const loginCard = $(".login-card");/* Login de paciente */
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
$$("[data-demo]").forEach((b) => b.addEventListener("click", () => { idInput.value = b.dataset.demo; idInput.focus(); }));$("#loginForm").addEventListener("submit", (e) => {
e.preventDefault();
const id = idInput.value.trim().toUpperCase();
const err = $("#loginError");
if (!ID_PATTERN.test(id)) { err.textContent = "El ID debe tener el formato WW-0000-00."; return shake(loginCard); }
if (!db.patients[id]) { err.textContent = "No encontramos ese ID. Revisa tu pulsera o pregunta en enfermería."; return shake(loginCard); }
setSession({ role: "patient", id });
openPatient(id);
});/* Login de personal */
const staffIdInput = $("#staffId");
staffIdInput.addEventListener("input", () => {
let v = staffIdInput.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
const letters = v.replace(/\d/g, "").slice(0, 3);
const digits = v.replace(/\D/g, "").slice(0, 4);
staffIdInput.value = letters + (letters.length === 3 && (digits || v.length > 3) ? "-" + digits : "");
$("#staffError").textContent = "";
});
$("#staffDemo").addEventListener("click", () => { staffIdInput.value = "MED-0042"; $("#staffCode").value = "2026"; });$("#staffForm").addEventListener("submit", (e) => {
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
});/* =========================================================
PANEL DEL PACIENTE
========================================================= */
let currentPatientId = null;function openPatient(id) {
currentPatientId = id;
showView("portal");
renderPatient();
}function renderPatient() {
const p = db.patients[currentPatientId];
if (!p) return;
const hour = new Date().getHours();
$("#greetingNote").textContent = hour < 12 ? "buenos días," : hour < 19 ? "buenas tardes," : "buenas noches,";
$("#patientName").textContent = p.name.split(" ")[0];
$("#patientMeta").textContent = ${p.age} años · ${p.room} · ${p.reason} · ID ${p.id};renderTimeline(p.procedures);
$("#visitsPanel").hidden = p.type !== "internado";
renderVisits(p);
renderUpcoming(p);
renderMeds(p.meds);
renderReminders(p);
renderThread($("#patientThread"), p.messages, "patient");
renderRecord(p);
renderDocs($("#patientDocs"), p, false);
}function renderTimeline(procs) {
const svg = $("#timelineSvg");
const ns = "http://www.w3.org/2000/svg";
const list = withStatus(procs);
const empty = list.length === 0;
$("#timelineEmpty").hidden = !empty;
$(".timeline-scroll").hidden = empty;
$("#procDetail").hidden = empty;
$(".progress-row").hidden = empty;
if (empty) return;const W = 1000, H = 210, padX = 70, midY = 105;
svg.setAttribute("viewBox", 0 0 ${W} ${H});
svg.innerHTML = "";const step = list.length > 1 ? (W - padX * 2) / (list.length - 1) : 0;
const pts = list.map((_, i) => ({ x: list.length > 1 ? padX + i * step : W / 2, y: midY + (i % 2 ? 14 : -14) }));
const pathFor = (arr) => arr.reduce((d, pt, i) => {
if (i === 0) return M ${pt.x} ${pt.y};
const prev = arr[i - 1], cx = (prev.x + pt.x) / 2;
return ${d} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y};
}, "");
const mk = (tag, attrs) => { const e = document.createElementNS(ns, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); return e; };
