-- ============================================================================
-- Migració 2026-10-27: aprovació de tutors i límits de mida
-- Executa-la sencera al SQL Editor de Supabase. Es pot tornar a executar sense problemes.
-- ============================================================================
--
-- PROBLEMA QUE ES CORREGEIX: el rol "tutor" venia directament del formulari de registre, sense
-- cap comprovació. Qualsevol persona (també un alumne amb un segon compte) podia registrar-se
-- com a tutor/a, crear un grup amb un codi d'invitació i veure les dades (tests, llistes,
-- notes) dels alumnes que s'hi apuntessin. Ara un compte de tutor/a nou queda pendent fins que
-- un admin l'aprova des de la pàgina «Gestió», i mentrestant no pot crear grups ni veure ningú.

-- 1. Nova columna. Els tutors que ja existeixen queden aprovats per no trencar res.
alter table public.profiles add column if not exists tutor_aprovat boolean not null default false;
update public.profiles set tutor_aprovat = true where role in ('tutor', 'admin') and not tutor_aprovat;

-- 2. Funció auxiliar: l'usuari actual és un tutor aprovat (o admin)?
create or replace function public.soc_tutor_aprovat()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and ((role = 'tutor' and tutor_aprovat) or role = 'admin')
  );
$$;

-- 3. Els grups d'un tutor/a només compten si està aprovat (afecta totes les policies de lectura
--    d'alumnes, llistes i tests, que es basen en my_group_ids).
create or replace function public.my_group_ids()
returns setof uuid
language sql stable security definer set search_path = public as $$
  select g.id from public.groups g
  where g.tutor_id = auth.uid() and public.soc_tutor_aprovat();
$$;

-- 4. Crear i modificar grups: només tutors aprovats, i sense poder assignar el grup a una altra persona.
drop policy if exists "groups_write_tutor" on public.groups;
create policy "groups_write_tutor" on public.groups for insert
  with check ((tutor_id = auth.uid() and public.soc_tutor_aprovat()) or public.my_role() = 'admin');

drop policy if exists "groups_update_tutor_or_admin" on public.groups;
create policy "groups_update_tutor_or_admin" on public.groups for update
  using (tutor_id = auth.uid() or public.my_role() = 'admin')
  with check ((tutor_id = auth.uid() and public.soc_tutor_aprovat()) or public.my_role() = 'admin');

-- 5. Un codi de classe només és vàlid si el grup és d'un tutor/a aprovat.
create or replace function public.validar_codi_classe(codi text)
returns table (domini_correu text)
language sql stable security definer set search_path = public as $$
  select g.domini_correu from public.groups g
  join public.profiles p on p.id = g.tutor_id
  where g.codi_invitacio = upper(trim(codi)) and (p.tutor_aprovat or p.role = 'admin');
$$;
revoke all on function public.validar_codi_classe(text) from public;
grant execute on function public.validar_codi_classe(text) to anon, authenticated;

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
      from public.groups g
      join public.profiles p on p.id = g.tutor_id
      where g.codi_invitacio = v_codi and (p.tutor_aprovat or p.role = 'admin');
    if v_grup_id is null then
      raise exception 'Codi de classe no vàlid';
    end if;
    if lower(split_part(new.email, '@', 2)) <> lower(v_domini) then
      raise exception 'El correu no és del domini del grup';
    end if;
  end if;

  insert into public.profiles (id, email, role, nom, group_id, curs_actual, es_menor_14, consentiment_pares, consentiment_acceptat, consentiment_data, tutor_aprovat)
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
    now(),
    false -- els tutors nous queden pendents d'aprovació
  );
  return new;
end;
$$;

-- 6. Ningú (excepte un admin) pot aprovar-se a si mateix.
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
      or new.tutor_aprovat is distinct from old.tutor_aprovat
    then
      raise exception 'No es poden modificar aquests camps del perfil.';
    end if;
  end if;
  return new;
end;
$$;

-- 7. Límits de mida, perquè ningú pugui omplir la base de dades amb textos enormes.
--    NOT VALID: s'apliquen a les dades noves sense fallar per si n'hi ha d'antigues.
alter table public.profiles drop constraint if exists profiles_nom_mida;
alter table public.profiles add constraint profiles_nom_mida check (char_length(nom) <= 120) not valid;
alter table public.profiles drop constraint if exists profiles_interessos_mida;
alter table public.profiles add constraint profiles_interessos_mida check (cardinality(interessos) <= 20) not valid;
alter table public.groups drop constraint if exists groups_nom_mida;
alter table public.groups add constraint groups_nom_mida check (char_length(nom) <= 80) not valid;
alter table public.lists drop constraint if exists lists_nom_mida;
alter table public.lists add constraint lists_nom_mida check (char_length(nom) <= 100) not valid;
alter table public.tutor_notes drop constraint if exists tutor_notes_mida;
alter table public.tutor_notes add constraint tutor_notes_mida check (char_length(contingut) <= 10000) not valid;
alter table public.test_results drop constraint if exists test_results_mida;
alter table public.test_results add constraint test_results_mida
  check (pg_column_size(respostes) <= 20000 and pg_column_size(resultat) <= 20000) not valid;
alter table public.profiles drop constraint if exists profiles_nota_rang;
alter table public.profiles add constraint profiles_nota_rang check (nota_mitjana is null or (nota_mitjana >= 0 and nota_mitjana <= 10)) not valid;
