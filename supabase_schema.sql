-- =====================================================================
-- ESQUEMA DE BASE DE DATOS: SISTEMA DE GESTIÓN DE TURNOS (SUPABASE SQL)
-- =====================================================================
-- Diseñado según el Diagrama de Clases del Proyecto Final.
-- Ideal para mitigar filas en hospitales de 2do y 3er nivel.

-- Eliminar tablas anteriores si existen (limpieza)
drop table if exists public.reportes cascade;
drop table if exists public.notificaciones cascade;
drop table if exists public.atenciones cascade;
drop table if exists public.turnos cascade;
drop table if exists public.horarios cascade;
drop table if exists public.usuarios cascade;
drop table if exists public.especialidades cascade;
drop table if exists public.centros_salud cascade;
drop type if exists public.rol_usuario cascade;

-- 1. TIPO DE ROL DE USUARIO
create type public.rol_usuario as enum ('paciente', 'encargado', 'admin');

-- 2. TABLA CENTRO DE SALUD (Hospitales de 2do y 3er nivel)
create table public.centros_salud (
  id_centro uuid default gen_random_uuid() primary key,
  nombre text not null,
  direccion text,
  nivel_atencion integer not null check (nivel_atencion in (1, 2, 3)), -- 1: 1er Nivel, 2: 2do Nivel, 3: 3er Nivel
  telefono text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS en centros_salud
alter table public.centros_salud enable row level security;

-- 3. TABLA ESPECIALIDAD
create table public.especialidades (
  id_especialidad uuid default gen_random_uuid() primary key,
  nombre text not null unique,
  description text, -- alineado con descripcion
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS en especialidades
alter table public.especialidades enable row level security;

-- 4. TABLA USUARIOS (Clase Base + Paciente, PersonalSalud y Administrador como herencia en una sola tabla)
create table public.usuarios (
  id_usuario uuid references auth.users on delete cascade primary key,
  ci text not null unique,
  nombre text not null,
  apellido text not null,
  correo text not null unique,
  telefono text,
  rol public.rol_usuario not null default 'paciente',
  
  -- Atributos de PersonalSalud (encargado)
  matricula_profesional text,
  id_especialidad uuid references public.especialidades(id_especialidad) on delete set null,
  
  -- Atributos de Administrador
  nivel_acceso text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS en usuarios
alter table public.usuarios enable row level security;

-- 5. TABLA HORARIO (Define disponibilidad de atención)
create table public.horarios (
  id_horario uuid default gen_random_uuid() primary key,
  id_centro uuid references public.centros_salud(id_centro) on delete cascade not null,
  fecha date not null,
  hora_inicio time not null,
  hora_fin time not null,
  disponible boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Asegurar que no haya duplicación del mismo bloque en el hospital
  unique (id_centro, fecha, hora_inicio, hora_fin)
);

-- Habilitar RLS en horarios
alter table public.horarios enable row level security;

-- 6. TABLA TURNO (Fichas de atención)
create table public.turnos (
  id_turno uuid default gen_random_uuid() primary key,
  id_paciente uuid references public.usuarios(id_usuario) on delete cascade not null,
  id_personal_salud uuid references public.usuarios(id_usuario) on delete set null, -- Encargado que atiende
  id_centro uuid references public.centros_salud(id_centro) on delete cascade not null,
  id_horario uuid references public.horarios(id_horario) on delete set null,
  fecha date not null,
  hora time not null,
  estado text not null check (estado in ('Pendiente', 'En Atención', 'Atendido', 'Cancelado', 'Ausente')) default 'Pendiente',
  fecha_solicitud timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS en turnos
alter table public.turnos enable row level security;

-- 7. TABLA ATENCION MEDICA (Resultados y evolución)
create table public.atenciones (
  id_atencion uuid default gen_random_uuid() primary key,
  id_turno uuid references public.turnos(id_turno) on delete cascade not null unique,
  fecha_atencion timestamp with time zone default timezone('utc'::text, now()) not null,
  diagnostico text not null,
  observaciones text,
  resultado text
);

-- Habilitar RLS en atenciones
alter table public.atenciones enable row level security;

-- 8. TABLA NOTIFICACION
create table public.notificaciones (
  id_notificacion uuid default gen_random_uuid() primary key,
  id_usuario uuid references public.usuarios(id_usuario) on delete cascade not null,
  tipo text not null, -- 'Email', 'SMS', 'Sistema'
  mensaje text not null,
  fecha_envio timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS en notificaciones
alter table public.notificaciones enable row level security;

-- 9. TABLA REPORTE (Estadísticas generales para la toma de decisiones sobre colas y demanda)
create table public.reportes (
  id_reporte uuid default gen_random_uuid() primary key,
  tipo text not null, -- 'Demanda de Especialidades', 'Tiempos de Espera', 'Ausentismo'
  fecha_generacion timestamp with time zone default timezone('utc'::text, now()) not null,
  contenido jsonb,
  id_administrador uuid references public.usuarios(id_usuario) on delete set null
);

-- Habilitar RLS en reportes
alter table public.reportes enable row level security;


-- =====================================================================
-- TRIGGER DE AUTOREGISTRO EN TABLA USUARIOS DESDE AUTH.USERS (SUPABASE)
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.usuarios (
    id_usuario, 
    ci, 
    nombre, 
    apellido, 
    correo, 
    telefono, 
    rol, 
    matricula_profesional, 
    id_especialidad, 
    nivel_acceso
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'ci', '00000000'),
    coalesce(new.raw_user_meta_data->>'nombre', 'Nombre'),
    coalesce(new.raw_user_meta_data->>'apellido', 'Apellido'),
    new.email,
    new.raw_user_meta_data->>'telefono',
    coalesce((new.raw_user_meta_data->>'rol')::public.rol_usuario, 'paciente'::public.rol_usuario),
    new.raw_user_meta_data->>'matricula_profesional',
    (new.raw_user_meta_data->>'id_especialidad')::uuid,
    new.raw_user_meta_data->>'nivel_acceso'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- =====================================================================
-- POLÍTICAS DE ROW LEVEL SECURITY (RLS) - SIN RECURSIÓN Y COMPATIBLES
-- =====================================================================
-- Se utiliza auth.jwt() para verificar roles del usuario en sesión
-- de manera eficiente y evitar la recursión infinita en PostgreSQL.

-- 1. Políticas para CENTROS DE SALUD
create policy "Centros de salud legibles por todos" 
  on public.centros_salud for select using (true);

create policy "Administradores pueden gestionar centros de salud" 
  on public.centros_salud for all using (
    (coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'admin')
  );

-- 2. Políticas para ESPECIALIDADES
create policy "Especialidades legibles por todos" 
  on public.especialidades for select using (true);

create policy "Administradores pueden gestionar especialidades" 
  on public.especialidades for all using (
    (coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'admin')
  );

-- 3. Políticas para USUARIOS
create policy "Perfiles visibles públicamente" 
  on public.usuarios for select using (true);

create policy "Permitir inserción de perfil propio" 
  on public.usuarios for insert with check (
    auth.uid() = id_usuario
  );

create policy "Usuarios pueden actualizar sus propios datos" 
  on public.usuarios for update using (
    auth.uid() = id_usuario or (coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'admin')
  );

create policy "Administradores tienen control total sobre usuarios" 
  on public.usuarios for all using (
    (coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'admin')
  );

-- 4. Políticas para HORARIOS
create policy "Horarios legibles por todos" 
  on public.horarios for select using (true);

create policy "Personal médico y admin pueden configurar horarios" 
  on public.horarios for all using (
    (coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') in ('admin', 'encargado'))
  );

-- 5. Políticas para TURNOS (FICHAS)
create policy "Usuarios ven turnos autorizados" 
  on public.turnos for select using (
    auth.uid() = id_paciente or 
    auth.uid() = id_personal_salud or 
    (coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') in ('admin', 'encargado'))
  );

create policy "Pacientes pueden solicitar turnos" 
  on public.turnos for insert with check (auth.uid() = id_paciente);

create policy "Usuarios pueden modificar turnos autorizados" 
  on public.turnos for update using (
    auth.uid() = id_paciente or 
    auth.uid() = id_personal_salud or 
    (coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'admin'::text)
  );

-- 6. Políticas para ATENCIONES
create policy "Atenciones legibles por involucrados" 
  on public.atenciones for select using (
    (coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'admin') or
    exists (
      select 1 from public.turnos 
      where turnos.id_turno = atenciones.id_turno and 
      (turnos.id_paciente = auth.uid() or turnos.id_personal_salud = auth.uid())
    )
  );

create policy "Encargados ven y registran atenciones" 
  on public.atenciones for all using (
    (coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'encargado')
  );

-- 7. Políticas para NOTIFICACIONES
create policy "Usuarios ven sus propias notificaciones" 
  on public.notificaciones for select using (auth.uid() = id_usuario);

-- 8. Políticas para REPORTES
create policy "Solo administradores ven reportes" 
  on public.reportes for all using (
    (coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'admin')
  );


-- =====================================================================
-- DATOS DE PRUEBA (MOCK DATA EN ESPAÑOL PARA HOSPITALES DE 2DO Y 3ER NIVEL)
-- =====================================================================

-- 1. Centros de Salud (Segunda y Tercera categoría)
insert into public.centros_salud (nombre, direccion, nivel_atencion, telefono) values
('Hospital Municipal Pampa de la Isla', 'Av. Virgen de Cotoca, UV-132', 2, '346-2022'),
('Hospital General San Juan de Dios', 'Calle Cuéllar N° 45, Zona Central', 3, '333-0222'),
('Hospital de Niños Mario Ortiz Suarez', 'Calle España esq. Rafael Peña', 3, '336-2252')
on conflict do nothing;

-- 2. Especialidades
insert into public.especialidades (nombre, description) values
('Neurología', 'Atención del sistema nervioso, migrañas y epilepsia.'),
('Pediatría', 'Control de crecimiento y desarrollo del niño y patologías infantiles.'),
('Cardiología', 'Enfermedades del corazón y control preventivo de hipertensión.'),
('Traumatología', 'Tratamiento de fracturas, dolores articulares y lesiones óseas.'),
('Medicina General', 'Atención médica primaria y control inicial de pacientes.')
on conflict (nombre) do nothing;

-- 3. Horarios de prueba (para mañana, asociados dinámicamente a los centros de salud creados)
insert into public.horarios (id_centro, fecha, hora_inicio, hora_fin, disponible)
select id_centro, current_date + interval '1 day', '08:00:00', '08:30:00', true
from public.centros_salud where nombre = 'Hospital Municipal Pampa de la Isla'
on conflict do nothing;

insert into public.horarios (id_centro, fecha, hora_inicio, hora_fin, disponible)
select id_centro, current_date + interval '1 day', '08:30:00', '09:00:00', true
from public.centros_salud where nombre = 'Hospital Municipal Pampa de la Isla'
on conflict do nothing;

insert into public.horarios (id_centro, fecha, hora_inicio, hora_fin, disponible)
select id_centro, current_date + interval '1 day', '09:00:00', '09:30:00', true
from public.centros_salud where nombre = 'Hospital Municipal Pampa de la Isla'
on conflict do nothing;

insert into public.horarios (id_centro, fecha, hora_inicio, hora_fin, disponible)
select id_centro, current_date + interval '1 day', '09:00:00', '09:30:00', true
from public.centros_salud where nombre = 'Hospital General San Juan de Dios'
on conflict do nothing;

insert into public.horarios (id_centro, fecha, hora_inicio, hora_fin, disponible)
select id_centro, current_date + interval '1 day', '09:30:00', '10:00:00', true
from public.centros_salud where nombre = 'Hospital General San Juan de Dios'
on conflict do nothing;

insert into public.horarios (id_centro, fecha, hora_inicio, hora_fin, disponible)
select id_centro, current_date + interval '1 day', '10:00:00', '10:30:00', true
from public.centros_salud where nombre = 'Hospital General San Juan de Dios'
on conflict do nothing;

insert into public.horarios (id_centro, fecha, hora_inicio, hora_fin, disponible)
select id_centro, current_date + interval '1 day', '08:00:00', '08:30:00', true
from public.centros_salud where nombre = 'Hospital de Niños Mario Ortiz Suarez'
on conflict do nothing;

insert into public.horarios (id_centro, fecha, hora_inicio, hora_fin, disponible)
select id_centro, current_date + interval '1 day', '08:30:00', '09:00:00', true
from public.centros_salud where nombre = 'Hospital de Niños Mario Ortiz Suarez'
on conflict do nothing;

