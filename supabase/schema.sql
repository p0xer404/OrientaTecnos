-- Esquema de Supabase per a "Orienta Tecnos" (Escola Tecnos, Terrassa)
-- Executa aquest fitxer sencer a l'editor SQL de Supabase (Database > SQL Editor) en un
-- projecte nou. Les dades dels estudis (graus, FP, batxillerats, artístics) NO es guarden
-- aquí: viuen als fitxers estàtics de data/ i es serveixen des de public/data/.
--
-- Només es tracten aquí dades de persones: comptes, grups, llistes, resultats de tests i
-- notes del tutor/a. Vegeu docs/ESQUEMA_DATOS.md per als estudis i la proposta de l'esquema
-- (carpetes + BD + RLS + mapeig RIASEC) discutida a l'inici del projecte per al context complet.

create extension if not exists pgcrypto;

-- ============================================================================
-- TAULES
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'alumne' check (role in ('alumne', 'tutor', 'admin')),
  nom text not null default '',
  group_id uuid, -- FK afegida més avall (referència circular amb groups)
  curs_actual text,
  nota_mitjana numeric,
  interessos text[] not null default '{}',
  estat_decisio text not null default 'no_ho_se' check (estat_decisio in ('no_ho_se', 'tinc_opcions', 'ho_tinc_clar')),
  consentiment_acceptat boolean not null default false,
  consentiment_data timestamptz,
  es_menor_14 boolean not null default false,
  consentiment_pares boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  curs text not null,
  tutor_id uuid not null references public.profiles (id) on delete cascade,
  codi_invitacio text not null unique,
  -- Domini del correu del tutor/a en crear el grup (ex: "escolatecnos.cat"). Els alumnes
  -- només es poden registrar amb un correu d'aquest mateix domini, perquè un codi de
  -- classe filtrat no serveixi per registrar-s'hi amb qualsevol adreça (p. ex. @gmail.com).
  domini_correu text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_group_id_fkey foreign key (group_id) references public.groups (id) on delete set null;

create table public.lists (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  nom text not null,
  es_preinscripcio boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists (id) on delete cascade,
  estudi_id text not null,
  estudi_tipus text not null check (estudi_tipus in ('grau', 'fp', 'batxillerat', 'artistic')),
  posicio integer not null default 0
);

create table public.test_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  test_id text not null check (test_id in ('riasec', 'habilitats', 'preferencies')),
  respostes jsonb not null default '{}',
  resultat jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.tutor_notes (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  contingut text not null default '',
  updated_at timestamptz not null default now(),
  unique (tutor_id, student_id)
);

create index on public.profiles (group_id);
create index on public.groups (tutor_id);
create index on public.lists (student_id);
create index on public.list_items (list_id);
create index on public.test_results (student_id);
create index on public.tutor_notes (student_id);

-- ============================================================================
-- FUNCIONS AUXILIARS (security definer, per evitar recursió a les policies RLS)
-- ============================================================================

create or replace function public.my_role()
returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.my_group_ids()
returns setof uuid
language sql stable security definer set search_path = public as $$
  select id from public.groups where tutor_id = auth.uid();
$$;

create or replace function public.is_student_in_my_group(target_student_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = target_student_id and group_id in (select public.my_group_ids())
  );
$$;

-- Crea el perfil automàticament quan algú es registra (auth.users). El rol ve de les
-- dades del formulari ('alumne' o 'tutor'), però MAI pot ser 'admin' per aquesta via. Per
-- als alumnes, el servidor torna a validar el codi de classe i el domini del correu (no
-- es confia en cap group_id enviat pel client). Els comptes d'admin es creen a mà des del
-- Supabase Studio (Authentication > Users) i després es posa role = 'admin' a profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_rol text := case when new.raw_user_meta_data ->> 'role' = 'tutor' then 'tutor' else 'alumne' end;
  v_codi text := upper(trim(coalesce(new.raw_user_meta_data ->> 'codi_invitacio', '')));
  v_grup_id uuid;
  v_domini text;
begin
  if v_rol = 'alumne' and v_codi <> '' then
    select g.id, g.domini_correu into v_grup_id, v_domini
      from public.groups g where g.codi_invitacio = v_codi;
    if v_grup_id is null then
      raise exception 'Codi de classe no vàlid';
    end if;
    if lower(split_part(new.email, '@', 2)) <> lower(v_domini) then
      raise exception 'El correu no és del domini del grup';
    end if;
  end if;
  -- Sense codi (p. ex. comptes creats a mà des del Studio), l'alumne queda sense grup.

  insert into public.profiles (id, email, role, nom, group_id, curs_actual, es_menor_14, consentiment_pares, consentiment_acceptat, consentiment_data)
  values (
    new.id,
    new.email,
    v_rol,
    coalesce(new.raw_user_meta_data ->> 'nom', ''),
    case when v_rol = 'alumne' then v_grup_id else null end,
    new.raw_user_meta_data ->> 'curs_actual',
    coalesce((new.raw_user_meta_data ->> 'es_menor_14')::boolean, false),
    coalesce((new.raw_user_meta_data ->> 'consentiment_pares')::boolean, false),
    true,
    now()
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.lists enable row level security;
alter table public.list_items enable row level security;
alter table public.test_results enable row level security;
alter table public.tutor_notes enable row level security;

-- profiles: un alumne només veu/edita el seu propi perfil; un tutor veu els alumnes del
-- seu grup (sense editar-los); un admin ho veu i edita tot.
create policy "profiles_select_self" on public.profiles for select
  using (id = auth.uid());
create policy "profiles_select_tutor_group" on public.profiles for select
  using (group_id in (select public.my_group_ids()));
create policy "profiles_select_admin" on public.profiles for select
  using (public.my_role() = 'admin');
create policy "profiles_update_self" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_update_admin" on public.profiles for update
  using (public.my_role() = 'admin');
create policy "profiles_delete_admin" on public.profiles for delete
  using (public.my_role() = 'admin');
create policy "profiles_delete_self" on public.profiles for delete
  using (id = auth.uid());

-- groups: només el tutor/a propietari i l'admin poden llegir-los. Per validar un codi
-- de classe durant el registre (sense sessió) hi ha la funció validar_codi_classe().
create policy "groups_select_tutor_or_admin" on public.groups for select
  using (tutor_id = auth.uid() or public.my_role() = 'admin');
create policy "groups_write_tutor" on public.groups for insert
  with check (tutor_id = auth.uid() or public.my_role() = 'admin');
create policy "groups_update_tutor_or_admin" on public.groups for update
  using (tutor_id = auth.uid() or public.my_role() = 'admin');
create policy "groups_delete_admin" on public.groups for delete
  using (public.my_role() = 'admin');

-- lists / list_items: només l'alumne propietari hi pot escriure; el tutor del seu grup
-- i l'admin només poden consultar (mai modificar les llistes d'un alumne).
create policy "lists_all_self" on public.lists for all
  using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "lists_select_tutor" on public.lists for select
  using (public.is_student_in_my_group(student_id));
create policy "lists_select_admin" on public.lists for select
  using (public.my_role() = 'admin');

create policy "list_items_all_self" on public.list_items for all
  using (exists (select 1 from public.lists l where l.id = list_id and l.student_id = auth.uid()))
  with check (exists (select 1 from public.lists l where l.id = list_id and l.student_id = auth.uid()));
create policy "list_items_select_tutor" on public.list_items for select
  using (exists (select 1 from public.lists l where l.id = list_id and public.is_student_in_my_group(l.student_id)));
create policy "list_items_select_admin" on public.list_items for select
  using (public.my_role() = 'admin');

-- test_results: igual que les llistes, només l'alumne hi escriu; tutor/admin només lectura.
create policy "test_results_all_self" on public.test_results for all
  using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "test_results_select_tutor" on public.test_results for select
  using (public.is_student_in_my_group(student_id));
create policy "test_results_select_admin" on public.test_results for select
  using (public.my_role() = 'admin');

-- tutor_notes: només el tutor/a propietari hi té accés. L'alumne MAI veu aquesta taula
-- (no hi ha cap policy que li doni accés).
create policy "tutor_notes_all_owner" on public.tutor_notes for all
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid() and (public.is_student_in_my_group(student_id) or public.my_role() = 'admin'));
create policy "tutor_notes_select_admin" on public.tutor_notes for select
  using (public.my_role() = 'admin');

-- ============================================================================
-- PROTECCIONS I FUNCIONS RPC
-- ============================================================================

-- Un usuari no pot canviar-se el rol, el grup, el correu ni els consentiments
-- (sense això, "profiles_update_self" permetria que un alumne es fes admin).
create or replace function public.protegir_camps_perfil()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and coalesce(public.my_role(), '') <> 'admin' then
    if new.id is distinct from old.id
      or new.role is distinct from old.role
      or new.email is distinct from old.email
      -- Passar a null sí que es permet: és el que fa "on delete set null" en esborrar un grup.
      or (new.group_id is distinct from old.group_id and new.group_id is not null)
      or new.consentiment_acceptat is distinct from old.consentiment_acceptat
      or new.consentiment_data is distinct from old.consentiment_data
      or new.es_menor_14 is distinct from old.es_menor_14
      or new.consentiment_pares is distinct from old.consentiment_pares
      or new.created_at is distinct from old.created_at
    then
      raise exception 'No es poden modificar aquests camps del perfil.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protegir_camps_perfil on public.profiles;
create trigger protegir_camps_perfil
  before update on public.profiles
  for each row execute function public.protegir_camps_perfil();

-- Comprovació d'un codi de classe durant el registre, sense exposar la taula groups.
create or replace function public.validar_codi_classe(codi text)
returns table (domini_correu text)
language sql stable security definer set search_path = public as $$
  select g.domini_correu from public.groups g where g.codi_invitacio = upper(trim(codi));
$$;
revoke all on function public.validar_codi_classe(text) from public;
grant execute on function public.validar_codi_classe(text) to anon, authenticated;

-- Esborrar un compte esborra l'usuari d'autenticació (i, en cascada, totes les dades).
create or replace function public.eliminar_el_meu_compte()
returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then
    raise exception 'Cal iniciar sessió';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.eliminar_el_meu_compte() from public;
grant execute on function public.eliminar_el_meu_compte() to authenticated;

create or replace function public.eliminar_usuari(usuari uuid)
returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if coalesce(public.my_role(), '') <> 'admin' then
    raise exception 'Només un admin pot donar de baixa usuaris';
  end if;
  if not exists (select 1 from public.profiles where id = usuari and role = 'alumne') then
    raise exception 'Només es poden donar de baixa alumnes';
  end if;
  delete from auth.users where id = usuari;
end;
$$;
revoke all on function public.eliminar_usuari(uuid) from public;
grant execute on function public.eliminar_usuari(uuid) to authenticated;
