-- ============================================================================
-- Migració 2026-10-27: protecció dels grups i límits de mida
-- Executa-la sencera al SQL Editor de Supabase. Es pot tornar a executar sense problemes.
-- Qualsevol persona es pot continuar registrant com a tutor/a i crear grups (decisió del centre).
-- Si s'havia executat una versió anterior d'aquesta migració (amb aprovació de tutors), també
-- la desfà: torna a deixar les funcions com abans i esborra la columna tutor_aprovat.
-- ============================================================================

-- 1. Grups: un tutor/a només pot crear grups a nom seu, i en modificar-ne un no el pot
--    traspassar a una altra persona (abans l'update no tenia "with check").
drop policy if exists "groups_write_tutor" on public.groups;
create policy "groups_write_tutor" on public.groups for insert
  with check (tutor_id = auth.uid() or public.my_role() = 'admin');

drop policy if exists "groups_update_tutor_or_admin" on public.groups;
create policy "groups_update_tutor_or_admin" on public.groups for update
  using (tutor_id = auth.uid() or public.my_role() = 'admin')
  with check (tutor_id = auth.uid() or public.my_role() = 'admin');

-- 2. Desfà l'aprovació de tutors si s'havia aplicat la versió anterior.
drop function if exists public.soc_tutor_aprovat();

create or replace function public.my_group_ids()
returns setof uuid
language sql stable security definer set search_path = public as $$
  select id from public.groups where tutor_id = auth.uid();
$$;

create or replace function public.validar_codi_classe(codi text)
returns table (domini_correu text)
language sql stable security definer set search_path = public as $$
  select g.domini_correu from public.groups g where g.codi_invitacio = upper(trim(codi));
$$;
revoke all on function public.validar_codi_classe(text) from public;
grant execute on function public.validar_codi_classe(text) to anon, authenticated;

-- 3. Registre: igual que abans, però retallant el nom i el curs perquè no es puguin desar
--    textos enormes des del formulari.
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

  insert into public.profiles (id, email, role, nom, group_id, curs_actual, es_menor_14, consentiment_pares, consentiment_acceptat, consentiment_data)
  values (
    new.id,
    new.email,
    v_rol,
    left(coalesce(new.raw_user_meta_data ->> 'nom', ''), 120),
    case when v_rol = 'alumne' then v_grup_id else null end,
    left(new.raw_user_meta_data ->> 'curs_actual', 40),
    coalesce((new.raw_user_meta_data ->> 'es_menor_14')::boolean, false),
    coalesce((new.raw_user_meta_data ->> 'consentiment_pares')::boolean, false),
    true,
    now()
  );
  return new;
end;
$$;

create or replace function public.protegir_camps_perfil()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and coalesce(public.my_role(), '') <> 'admin' then
    if new.id is distinct from old.id
      or new.role is distinct from old.role
      or new.email is distinct from old.email
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

alter table public.profiles drop column if exists tutor_aprovat;

-- 4. Límits de mida, perquè ningú pugui omplir la base de dades amb textos enormes, i rang de
--    la nota mitjana. NOT VALID: s'apliquen a les dades noves sense fallar per si n'hi ha d'antigues.
alter table public.profiles drop constraint if exists profiles_nom_mida;
alter table public.profiles add constraint profiles_nom_mida check (char_length(nom) <= 120) not valid;
alter table public.profiles drop constraint if exists profiles_interessos_mida;
alter table public.profiles add constraint profiles_interessos_mida check (cardinality(interessos) <= 20) not valid;
alter table public.profiles drop constraint if exists profiles_nota_rang;
alter table public.profiles add constraint profiles_nota_rang check (nota_mitjana is null or (nota_mitjana >= 0 and nota_mitjana <= 10)) not valid;
alter table public.groups drop constraint if exists groups_nom_mida;
alter table public.groups add constraint groups_nom_mida check (char_length(nom) <= 80) not valid;
alter table public.lists drop constraint if exists lists_nom_mida;
alter table public.lists add constraint lists_nom_mida check (char_length(nom) <= 100) not valid;
alter table public.tutor_notes drop constraint if exists tutor_notes_mida;
alter table public.tutor_notes add constraint tutor_notes_mida check (char_length(contingut) <= 10000) not valid;
alter table public.test_results drop constraint if exists test_results_mida;
alter table public.test_results add constraint test_results_mida
  check (pg_column_size(respostes) <= 20000 and pg_column_size(resultat) <= 20000) not valid;
