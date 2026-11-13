-- =========================================================
-- well well · esquema de base de datos (Supabase)
-- Ejecuta este archivo en: Supabase → SQL Editor → New query
-- Es seguro correrlo varias veces.
--
-- Conserva tu tabla "perfiles" (id = usuario de Supabase Auth)
-- y le agrega rol y código. El inicio de sesión es con el ID:
--   paciente WW-2048-17  →  ww-2048-17@paciente.wellwell.app
--   personal MED-0042    →  med-0042@personal.wellwell.app
-- La contraseña de ese usuario es el "código de acceso".
-- =========================================================

-- ---------- perfiles (ya existe; solo se amplía) ----------
create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null
);
alter table public.perfiles add column if not exists rol text check (rol in ('paciente', 'personal'));
alter table public.perfiles add column if not exists codigo text unique;
alter table public.perfiles enable row level security;

-- ---------- pacientes ----------
create table if not exists public.pacientes (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid unique references public.perfiles (id) on delete set null,
  codigo text unique not null,
  nombre text not null,
  apodo text,
  fecha_nacimiento date,
  tipo text not null default 'ambulatorio' check (tipo in ('internado', 'ambulatorio')),
  hospital text,
  area text,
  cuarto text,
  tipo_sangre text,
  alergias text[] not null default '{}',
  diagnosticos text[] not null default '{}',
  contacto_emergencia text,
  created_at timestamptz not null default now()
);

-- ---------- personal médico ----------
create table if not exists public.personal (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid unique references public.perfiles (id) on delete set null,
  codigo text unique not null,
  nombre text not null,
  puesto text,
  especialidad text,
  area text,
  extension text,
  horario text,
  created_at timestamptz not null default now()
);

-- ---------- quién atiende a quién ----------
create table if not exists public.asignaciones (
  paciente_id uuid references public.pacientes (id) on delete cascade,
  personal_id uuid references public.personal (id) on delete cascade,
  motivo text,                       -- "Búscale para: ..."
  primary key (paciente_id, personal_id)
);

-- ---------- expediente ----------
create table if not exists public.procedimientos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes (id) on delete cascade,
  titulo text not null,
  descripcion text,
  fecha timestamptz not null,
  estado text not null default 'pendiente' check (estado in ('hecho', 'hoy', 'pendiente')),
  lugar text,
  responsable text
);

create table if not exists public.medicamentos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes (id) on delete cascade,
  nombre text not null,
  dosis text,
  via text,
  para_que text,
  horarios text[] not null default '{}',   -- {'08:00','20:00'}
  desde date,
  hasta date,
  indicaciones text
);

create table if not exists public.citas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes (id) on delete cascade,
  titulo text not null,
  tipo text not null default 'consulta' check (tipo in ('consulta', 'cirugia', 'estudio', 'terapia')),
  inicio timestamptz not null,
  fin timestamptz,
  lugar text,
  con_quien text,
  indicaciones text
);

create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes (id) on delete cascade,
  titulo text not null,
  tipo text,
  fecha date not null default current_date,
  resumen text,
  url text
);

-- ---------- comunicación ----------
create table if not exists public.mensajes (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes (id) on delete cascade,
  autor_perfil uuid not null references public.perfiles (id) on delete cascade default auth.uid(),
  autor_nombre text not null,
  autor_rol text not null check (autor_rol in ('paciente', 'personal')),
  texto text not null check (char_length(texto) between 1 and 600),
  created_at timestamptz not null default now()
);

create table if not exists public.sala_mensajes (
  id uuid primary key default gen_random_uuid(),
  sala text not null check (sala in ('juegos', 'general')),
  autor_perfil uuid not null references public.perfiles (id) on delete cascade default auth.uid(),
  autor_nombre text not null,             -- apodo + cuarto, nunca el nombre completo
  texto text not null default '' check (char_length(texto) <= 240),
  sticker text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.animo (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes (id) on delete cascade,
  nivel int not null check (nivel between 1 and 5),
  dolor int check (dolor between 0 and 10),
  nota text check (char_length(nota) <= 400),
  created_at timestamptz not null default now()
);

create index if not exists idx_proc_pac on public.procedimientos (paciente_id);
create index if not exists idx_med_pac on public.medicamentos (paciente_id);
create index if not exists idx_citas_pac on public.citas (paciente_id);
create index if not exists idx_docs_pac on public.documentos (paciente_id);
create index if not exists idx_msg_pac on public.mensajes (paciente_id, created_at);
create index if not exists idx_sala on public.sala_mensajes (sala, created_at);
create index if not exists idx_animo_pac on public.animo (paciente_id, created_at);

-- =========================================================
-- Funciones de ayuda para las reglas de acceso (RLS)
-- =========================================================
create or replace function public.mi_paciente_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.pacientes where perfil_id = auth.uid()
$$;

create or replace function public.mi_personal_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.personal where perfil_id = auth.uid()
$$;

create or replace function public.puede_ver_paciente(pid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select pid = public.mi_paciente_id()
      or exists (select 1 from public.asignaciones a
                 where a.paciente_id = pid and a.personal_id = public.mi_personal_id())
$$;

-- =========================================================
-- Seguridad por fila: cada quien ve solo lo suyo
-- =========================================================
alter table public.pacientes      enable row level security;
alter table public.personal       enable row level security;
alter table public.asignaciones   enable row level security;
alter table public.procedimientos enable row level security;
alter table public.medicamentos   enable row level security;
alter table public.citas          enable row level security;
alter table public.documentos     enable row level security;
alter table public.mensajes       enable row level security;
alter table public.sala_mensajes  enable row level security;
alter table public.animo          enable row level security;

drop policy if exists "pacientes: ver" on public.pacientes;
create policy "pacientes: ver" on public.pacientes for select to authenticated using (public.puede_ver_paciente(id));

drop policy if exists "personal: ver" on public.personal;
create policy "personal: ver" on public.personal for select to authenticated using (true);

drop policy if exists "asignaciones: ver" on public.asignaciones;
create policy "asignaciones: ver" on public.asignaciones for select to authenticated
  using (paciente_id = public.mi_paciente_id() or personal_id = public.mi_personal_id());

drop policy if exists "procedimientos: ver" on public.procedimientos;
create policy "procedimientos: ver" on public.procedimientos for select to authenticated using (public.puede_ver_paciente(paciente_id));
drop policy if exists "medicamentos: ver" on public.medicamentos;
create policy "medicamentos: ver" on public.medicamentos for select to authenticated using (public.puede_ver_paciente(paciente_id));
drop policy if exists "citas: ver" on public.citas;
create policy "citas: ver" on public.citas for select to authenticated using (public.puede_ver_paciente(paciente_id));
drop policy if exists "documentos: ver" on public.documentos;
create policy "documentos: ver" on public.documentos for select to authenticated using (public.puede_ver_paciente(paciente_id));

drop policy if exists "mensajes: ver" on public.mensajes;
create policy "mensajes: ver" on public.mensajes for select to authenticated using (public.puede_ver_paciente(paciente_id));
drop policy if exists "mensajes: escribir" on public.mensajes;
create policy "mensajes: escribir" on public.mensajes for insert to authenticated
  with check (autor_perfil = auth.uid() and public.puede_ver_paciente(paciente_id)
              and autor_rol = case when public.mi_personal_id() is not null then 'personal' else 'paciente' end);

drop policy if exists "sala: ver" on public.sala_mensajes;
create policy "sala: ver" on public.sala_mensajes for select to authenticated
  using (public.mi_paciente_id() is not null or public.mi_personal_id() is not null);
drop policy if exists "sala: escribir" on public.sala_mensajes;
create policy "sala: escribir" on public.sala_mensajes for insert to authenticated
  with check (autor_perfil = auth.uid() and (public.mi_paciente_id() is not null or public.mi_personal_id() is not null));
drop policy if exists "sala: moderar" on public.sala_mensajes;
create policy "sala: moderar" on public.sala_mensajes for delete to authenticated
  using (public.mi_personal_id() is not null or autor_perfil = auth.uid());

drop policy if exists "animo: ver" on public.animo;
create policy "animo: ver" on public.animo for select to authenticated using (public.puede_ver_paciente(paciente_id));
drop policy if exists "animo: registrar" on public.animo;
create policy "animo: registrar" on public.animo for insert to authenticated with check (paciente_id = public.mi_paciente_id());

-- =========================================================
-- Tiempo real para mensajes, sala y ánimo
-- =========================================================
do $$
begin
  begin alter publication supabase_realtime add table public.mensajes; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.sala_mensajes; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.animo; exception when duplicate_object then null; end;
end $$;
