/* =========================================================
   Calendario del dispositivo
   Genera archivos .ics (iPhone, Android, Outlook, Mac los
   abren directo en su calendario) con recordatorios, y
   enlaces a Google Calendar.
   ========================================================= */
(function () {
  const pad = (n) => String(n).padStart(2, "0");
  const utc = (d) => {
    d = new Date(d);
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  };
  const esc = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (m) => "\\" + m);

  function alarm(minutes, text) {
    return ["BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(text)}`, `TRIGGER:-PT${minutes}M`, "END:VALARM"];
  }

  function citaEvent(c, paciente) {
    const fin = c.fin || new Date(new Date(c.inicio).getTime() + 30 * 60000).toISOString();
    return [
      "BEGIN:VEVENT",
      `UID:${c.id}-${paciente.codigo}@wellwell`,
      `DTSTAMP:${utc(new Date())}`,
      `DTSTART:${utc(c.inicio)}`,
      `DTEND:${utc(fin)}`,
      `SUMMARY:${esc(c.titulo)}`,
      `LOCATION:${esc([c.lugar, paciente.hospital].filter(Boolean).join(" · "))}`,
      `DESCRIPTION:${esc([c.con_quien && "Con: " + c.con_quien, c.indicaciones].filter(Boolean).join("\n"))}`,
      ...alarm(24 * 60, "Mañana: " + c.titulo),
      ...alarm(60, "En 1 hora: " + c.titulo),
      "END:VEVENT",
    ];
  }

  function medEvents(m, paciente) {
    const out = [];
    (m.horarios || []).forEach((h, i) => {
      if (!/^\d{1,2}:\d{2}$/.test(h)) return;
      const [hh, mm] = h.split(":").map(Number);
      const start = new Date(); start.setHours(hh, mm, 0, 0);
      if (m.desde) { const d = new Date(m.desde + "T00:00:00"); if (d > start) { start.setFullYear(d.getFullYear(), d.getMonth(), d.getDate()); } }
      const end = new Date(start.getTime() + 10 * 60000);
      const until = m.hasta ? new Date(m.hasta + "T23:59:00") : null;
      out.push(
        "BEGIN:VEVENT",
        `UID:${m.id}-${i}-${paciente.codigo}@wellwell`,
        `DTSTAMP:${utc(new Date())}`,
        `DTSTART:${utc(start)}`,
        `DTEND:${utc(end)}`,
        `RRULE:FREQ=DAILY${until ? ";UNTIL=" + utc(until) : ""}`,
        `SUMMARY:${esc("💊 " + m.nombre + " " + m.dosis)}`,
        `DESCRIPTION:${esc([m.para_que, m.via, m.indicaciones].filter(Boolean).join("\n"))}`,
        ...alarm(5, "Hora de " + m.nombre),
        "END:VEVENT"
      );
    });
    return out;
  }

  function download(lines, filename) {
    const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//well well//ES", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", ...lines, "END:VCALENDAR"].join("\r\n");
    const blob = new Blob([body], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  function googleLink(c, paciente) {
    const fin = c.fin || new Date(new Date(c.inicio).getTime() + 30 * 60000).toISOString();
    const p = new URLSearchParams({
      action: "TEMPLATE",
      text: c.titulo,
      dates: `${utc(c.inicio)}/${utc(fin)}`,
      details: [c.con_quien && "Con: " + c.con_quien, c.indicaciones].filter(Boolean).join("\n"),
      location: [c.lugar, paciente.hospital].filter(Boolean).join(" · "),
    });
    return "https://calendar.google.com/calendar/render?" + p.toString();
  }

  window.Calendar = {
    addCita: (c, p) => download(citaEvent(c, p), `cita-${c.id}.ics`),
    addAllCitas: (p) => download(p.citas.filter((c) => new Date(c.inicio) > new Date()).flatMap((c) => citaEvent(c, p)), "mis-citas-wellwell.ics"),
    addMeds: (p) => download(p.medicamentos.flatMap((m) => medEvents(m, p)), "mis-medicinas-wellwell.ics"),
    googleLink,
  };
})();
