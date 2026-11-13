/* =========================================================
   Datos de demostración (se usan solo si la cuenta no existe
   en Supabase). Las fechas se calculan a partir de hoy.
   ========================================================= */
(function () {
  function at(days, hh, mm) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hh, mm || 0, 0, 0);
    return d.toISOString();
  }
  function day(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  const personal = {
    "MED-0042": { id: "p-42", codigo: "MED-0042", nombre: "Dra. Elena Torres", puesto: "Pediatra", especialidad: "Cirugía pediátrica", area: "Piso 3 · Pediatría", extension: "3042", horario: "Lun a vie, 8:00–16:00" },
    "ENF-0107": { id: "p-107", codigo: "ENF-0107", nombre: "Enf. Raúl Méndez", puesto: "Enfermero", especialidad: "Enfermería pediátrica", area: "Piso 3 · Pediatría", extension: "3107", horario: "Turno matutino" },
    "MED-0090": { id: "p-90", codigo: "MED-0090", nombre: "Dr. Andrés Salgado", puesto: "Cardiólogo", especialidad: "Cardiología", area: "Consulta externa · Torre B", extension: "2090", horario: "Mar y jue, 9:00–14:00" },
    "TSO-0015": { id: "p-15", codigo: "TSO-0015", nombre: "Lic. Paula Rivas", puesto: "Trabajo social", especialidad: "Apoyo a familias", area: "Planta baja", extension: "1015", horario: "Lun a vie, 9:00–17:00" },
  };

  const pacientes = {
    "WW-2048-17": {
      id: "pac-2048",
      codigo: "WW-2048-17",
      nombre: "Sofía Ramírez",
      apodo: "Sofi",
      fecha_nacimiento: "2017-04-12",
      tipo: "internado",
      hospital: "Hospital Infantil del Valle",
      area: "Pediatría",
      cuarto: "304-B",
      tipo_sangre: "O+",
      alergias: ["Penicilina"],
      diagnosticos: ["Apendicitis aguda (operada)"],
      contacto_emergencia: "Laura Ramírez (mamá) · 55 1234 5678",
      equipo: [
        { codigo: "MED-0042", motivo: "Tu cirugía y cómo vas sanando" },
        { codigo: "ENF-0107", motivo: "Medicinas, dolor o si algo te molesta" },
        { codigo: "TSO-0015", motivo: "Dudas de tu familia, permisos y trámites" },
      ],
      procedimientos: [
        { id: "pr1", titulo: "Llegada a urgencias", descripcion: "Te revisaron la pancita y te tomaron signos vitales.", fecha: at(-3, 21, 10), estado: "hecho", lugar: "Urgencias", responsable: "Equipo de urgencias" },
        { id: "pr2", titulo: "Ultrasonido de abdomen", descripcion: "Una cámara especial vio tu apéndice sin dolor.", fecha: at(-3, 22, 30), estado: "hecho", lugar: "Imagen", responsable: "Dr. Ortiz" },
        { id: "pr3", titulo: "Cirugía: apendicectomía", descripcion: "Te quitaron el apéndice inflamado mientras dormías.", fecha: at(-2, 8, 0), estado: "hecho", lugar: "Quirófano 2", responsable: "Dra. Elena Torres" },
        { id: "pr4", titulo: "Revisión de la herida", descripcion: "Vemos que tu herida esté limpia y cerrando bien.", fecha: at(0, 11, 0), estado: "hoy", lugar: "Cuarto 304-B", responsable: "Enf. Raúl Méndez" },
        { id: "pr5", titulo: "Análisis de sangre", descripcion: "Un piquete rapidito para ver que no haya infección.", fecha: at(1, 7, 30), estado: "pendiente", lugar: "Cuarto 304-B", responsable: "Laboratorio" },
        { id: "pr6", titulo: "Alta a casa", descripcion: "Si todo va bien, ¡te vas a casa!", fecha: at(2, 12, 0), estado: "pendiente", lugar: "Piso 3", responsable: "Dra. Elena Torres" },
      ],
      medicamentos: [
        { id: "m1", nombre: "Paracetamol", dosis: "250 mg", via: "Por la boca", para_que: "Quitar el dolor y bajar la fiebre", horarios: ["08:00", "14:00", "20:00"], desde: day(-2), hasta: day(3), indicaciones: "Después de comer" },
        { id: "m2", nombre: "Ceftriaxona", dosis: "1 g", via: "Por el suero", para_que: "Ayudar a que no haya infección", horarios: ["09:00", "21:00"], desde: day(-2), hasta: day(1), indicaciones: "La pone tu enfermero" },
        { id: "m3", nombre: "Ondansetrón", dosis: "4 mg", via: "Por la boca", para_que: "Si sientes ganas de vomitar", horarios: ["Solo si lo necesitas"], desde: day(-2), hasta: day(2), indicaciones: "Pídelo a tu enfermero" },
      ],
      citas: [
        { id: "c1", titulo: "Revisión de herida", tipo: "consulta", inicio: at(0, 11, 0), fin: at(0, 11, 30), lugar: "Cuarto 304-B", con_quien: "Enf. Raúl Méndez", indicaciones: "" },
        { id: "c2", titulo: "Análisis de sangre", tipo: "estudio", inicio: at(1, 7, 30), fin: at(1, 7, 45), lugar: "Cuarto 304-B", con_quien: "Laboratorio", indicaciones: "Sin desayunar" },
        { id: "c3", titulo: "Consulta de seguimiento", tipo: "consulta", inicio: at(10, 10, 0), fin: at(10, 10, 30), lugar: "Consulta externa · Consultorio 12", con_quien: "Dra. Elena Torres", indicaciones: "Traer tu carnet" },
      ],
      documentos: [
        { id: "d1", titulo: "Hoja de ingreso", tipo: "Ingreso", fecha: day(-3), resumen: "Dolor abdominal de 12 horas, fiebre de 38.4 °C." },
        { id: "d2", titulo: "Ultrasonido abdominal", tipo: "Estudio", fecha: day(-3), resumen: "Apéndice inflamado, sin perforación." },
        { id: "d3", titulo: "Nota quirúrgica", tipo: "Cirugía", fecha: day(-2), resumen: "Apendicectomía laparoscópica sin complicaciones." },
        { id: "d4", titulo: "Biometría hemática", tipo: "Laboratorio", fecha: day(-1), resumen: "Glóbulos blancos bajando, buena evolución." },
      ],
    },
    "WW-3301-09": {
      id: "pac-3301",
      codigo: "WW-3301-09",
      nombre: "Mateo Herrera",
      apodo: "Mateo",
      fecha_nacimiento: "1990-09-30",
      tipo: "ambulatorio",
      hospital: "Hospital General del Valle",
      area: "Cardiología",
      cuarto: "",
      tipo_sangre: "A+",
      alergias: [],
      diagnosticos: ["Hipertensión arterial"],
      contacto_emergencia: "Ana Herrera · 55 8765 4321",
      equipo: [
        { codigo: "MED-0090", motivo: "Tu presión y tus medicinas del corazón" },
        { codigo: "TSO-0015", motivo: "Trámites, citas y apoyo" },
      ],
      procedimientos: [
        { id: "q1", titulo: "Primera consulta", descripcion: "Revisión general y toma de presión.", fecha: at(-30, 9, 0), estado: "hecho", lugar: "Consultorio 4", responsable: "Dr. Andrés Salgado" },
        { id: "q2", titulo: "Electrocardiograma", descripcion: "Unos parches leyeron el ritmo de tu corazón.", fecha: at(-28, 10, 0), estado: "hecho", lugar: "Cardiología", responsable: "Técnico de cardiología" },
        { id: "q3", titulo: "Holter de 24 horas", descripcion: "Un aparatito mide tu presión durante un día completo.", fecha: at(4, 9, 0), estado: "pendiente", lugar: "Cardiología · Torre B", responsable: "Dr. Andrés Salgado" },
      ],
      medicamentos: [
        { id: "n1", nombre: "Losartán", dosis: "50 mg", via: "Por la boca", para_que: "Mantener la presión en orden", horarios: ["08:00"], desde: day(-28), hasta: day(60), indicaciones: "Todos los días a la misma hora" },
      ],
      citas: [
        { id: "k1", titulo: "Colocación de Holter", tipo: "estudio", inicio: at(4, 9, 0), fin: at(4, 9, 30), lugar: "Cardiología · Torre B", con_quien: "Dr. Andrés Salgado", indicaciones: "Ropa cómoda, baño antes" },
        { id: "k2", titulo: "Consulta de resultados", tipo: "consulta", inicio: at(12, 12, 0), fin: at(12, 12, 30), lugar: "Consultorio 4", con_quien: "Dr. Andrés Salgado", indicaciones: "" },
      ],
      documentos: [
        { id: "e1", titulo: "Historia clínica", tipo: "Consulta", fecha: day(-30), resumen: "Presión 150/95. Se inicia tratamiento." },
        { id: "e2", titulo: "Electrocardiograma", tipo: "Estudio", fecha: day(-28), resumen: "Ritmo normal." },
      ],
    },
  };

  const asignaciones = {
    "MED-0042": ["WW-2048-17"],
    "ENF-0107": ["WW-2048-17"],
    "MED-0090": ["WW-3301-09"],
    "TSO-0015": ["WW-2048-17", "WW-3301-09"],
  };

  const mensajesIniciales = {
    "WW-2048-17": [
      { id: "x1", autor_nombre: "Enf. Raúl Méndez", autor_rol: "personal", texto: "¡Hola Sofi! A las 11 paso a ver tu herida. ¿Cómo dormiste?", created_at: at(0, 8, 5) },
    ],
    "WW-3301-09": [],
  };

  const salaInicial = {
    juegos: [
      { id: "s1", autor_nombre: "Leo · cuarto 301", texto: "¿Alguien quiere jugar memorama en la sala de juegos a las 4?", sticker: "", created_at: at(0, 9, 12) },
      { id: "s2", autor_nombre: "Vale · cuarto 307", texto: "", sticker: "star", created_at: at(0, 9, 20) },
    ],
    general: [
      { id: "s3", autor_nombre: "Mamá de Leo", texto: "La cafetería del piso 1 ya abrió 😊", sticker: "", created_at: at(0, 7, 40) },
    ],
  };

  // Códigos de acceso de prueba (solo modo demo)
  const codigos = { paciente: "123456", personal: "med2026" };

  window.DEMO = { personal, pacientes, asignaciones, mensajesIniciales, salaInicial, codigos };
})();
