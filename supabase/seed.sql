-- =========================================================
-- well well · datos de ejemplo (opcional)
--
-- ANTES de correr esto, crea los usuarios en:
-- Supabase → Authentication → Users → Add user → Create new user
-- (marca "Auto Confirm User"):
--
--   ww-2048-17@paciente.wellwell.app   contraseña: el código de acceso que quieras
--   med-0042@personal.wellwell.app     contraseña: el código de acceso que quieras
--
-- Luego ejecuta este archivo en el SQL Editor.
-- =========================================================

-- Perfiles ligados a los usuarios de Auth
insert into public.perfiles (id, nombre, rol, codigo)
select id, 'Sofía Ramírez', 'paciente', 'WW-2048-17' from auth.users where email = 'ww-2048-17@paciente.wellwell.app'
on conflict (id) do update set rol = excluded.rol, codigo = excluded.codigo;

insert into public.perfiles (id, nombre, rol, codigo)
select id, 'Dra. Elena Torres', 'personal', 'MED-0042' from auth.users where email = 'med-0042@personal.wellwell.app'
on conflict (id) do update set rol = excluded.rol, codigo = excluded.codigo;

-- Paciente
insert into public.pacientes (perfil_id, codigo, nombre, apodo, fecha_nacimiento, tipo, hospital, area, cuarto, tipo_sangre, alergias, diagnosticos, contacto_emergencia)
select p.id, 'WW-2048-17', 'Sofía Ramírez', 'Sofi', '2017-04-12', 'internado', 'Hospital Infantil del Valle', 'Pediatría', '304-B', 'O+',
       '{Penicilina}', '{"Apendicitis aguda (operada)"}', 'Laura Ramírez (mamá) · 55 1234 5678'
from public.perfiles p where p.codigo = 'WW-2048-17'
on conflict (codigo) do nothing;

-- Personal
insert into public.personal (perfil_id, codigo, nombre, puesto, especialidad, area, extension, horario)
select p.id, 'MED-0042', 'Dra. Elena Torres', 'Pediatra', 'Cirugía pediátrica', 'Piso 3 · Pediatría', '3042', 'Lun a vie, 8:00–16:00'
from public.perfiles p where p.codigo = 'MED-0042'
on conflict (codigo) do nothing;

-- Asignación
insert into public.asignaciones (paciente_id, personal_id, motivo)
select pa.id, pe.id, 'Tu cirugía y cómo vas sanando'
from public.pacientes pa, public.personal pe
where pa.codigo = 'WW-2048-17' and pe.codigo = 'MED-0042'
on conflict do nothing;

-- Línea del tiempo, medicinas, citas y documentos
with pa as (select id from public.pacientes where codigo = 'WW-2048-17')
insert into public.procedimientos (paciente_id, titulo, descripcion, fecha, estado, lugar, responsable)
select pa.id, x.titulo, x.descripcion, x.fecha, x.estado, x.lugar, x.responsable from pa, (values
  ('Llegada a urgencias', 'Te revisaron la pancita y te tomaron signos vitales.', now() - interval '3 days', 'hecho', 'Urgencias', 'Equipo de urgencias'),
  ('Cirugía: apendicectomía', 'Te quitaron el apéndice inflamado mientras dormías.', now() - interval '2 days', 'hecho', 'Quirófano 2', 'Dra. Elena Torres'),
  ('Revisión de la herida', 'Vemos que tu herida esté limpia y cerrando bien.', now() + interval '2 hours', 'hoy', 'Cuarto 304-B', 'Enfermería'),
  ('Alta a casa', 'Si todo va bien, ¡te vas a casa!', now() + interval '2 days', 'pendiente', 'Piso 3', 'Dra. Elena Torres')
) as x(titulo, descripcion, fecha, estado, lugar, responsable);

with pa as (select id from public.pacientes where codigo = 'WW-2048-17')
insert into public.medicamentos (paciente_id, nombre, dosis, via, para_que, horarios, desde, hasta, indicaciones)
select pa.id, 'Paracetamol', '250 mg', 'Por la boca', 'Quitar el dolor y bajar la fiebre', '{08:00,14:00,20:00}', current_date - 2, current_date + 3, 'Después de comer' from pa;

with pa as (select id from public.pacientes where codigo = 'WW-2048-17')
insert into public.citas (paciente_id, titulo, tipo, inicio, fin, lugar, con_quien, indicaciones)
select pa.id, 'Consulta de seguimiento', 'consulta', now() + interval '10 days', now() + interval '10 days 30 minutes', 'Consulta externa · Consultorio 12', 'Dra. Elena Torres', 'Traer tu carnet' from pa;

with pa as (select id from public.pacientes where codigo = 'WW-2048-17')
insert into public.documentos (paciente_id, titulo, tipo, fecha, resumen)
select pa.id, 'Nota quirúrgica', 'Cirugía', current_date - 2, 'Apendicectomía laparoscópica sin complicaciones.' from pa;
