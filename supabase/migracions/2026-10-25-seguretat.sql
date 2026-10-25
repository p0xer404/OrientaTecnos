-- Migració de seguretat per a projectes que ja tenen supabase/schema.sql aplicat.
-- Executa aquest fitxer sencer a Supabase (Database > SQL Editor). És idempotent: es pot
-- tornar a executar sense problemes. L'aplicació funciona abans i després d'aplicar-la,
-- però sense aquesta migració hi ha els forats de seguretat descrits a cada bloc.

-- 1) Un usuari no pot canviar-se el rol, el grup, el correu ni els consentiments.
--    Abans, la policy "profiles_update_self" permetia que un alumne fes
--    update profiles set role = 'admin' des de la consola del navegador.
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

-- 2) El servidor valida el codi de classe i el domini del correu en registrar-se.
--    Abans, el trigger confiava en el group_id que enviava el client, i el domini només
--    es comprovava al navegador: amb una crida directa a signUp es podia entrar a
--    qualsevol grup amb qualsevol correu.
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

-- 3) Els codis d'invitació ja no són públics. Abans, "groups_select_all" deixava que
--    qualsevol persona sense sessió llistés tots els grups, codis i dominis. Ara només es
--    pot comprovar un codi concret (i només retorna el domini, no l'id del grup).
create or replace function public.validar_codi_classe(codi text)
returns table (domini_correu text)
language sql stable security definer set search_path = public as $$
  select g.domini_correu from public.groups g where g.codi_invitacio = upper(trim(codi));
$$;
revoke all on function public.validar_codi_classe(text) from public;
grant execute on function public.validar_codi_classe(text) to anon, authenticated;

drop policy if exists "groups_select_all" on public.groups;
drop policy if exists "groups_select_tutor_or_admin" on public.groups;
create policy "groups_select_tutor_or_admin" on public.groups for select
  using (tutor_id = auth.uid() or public.my_role() = 'admin');

-- 4) Esborrar el compte esborra també l'usuari d'autenticació (abans quedava un login orfe
--    que donava "No s'ha trobat el perfil associat a aquest compte").
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

-- 5) Un tutor només pot escriure notes sobre alumnes del seu grup (abans, de qualsevol id).
drop policy if exists "tutor_notes_all_owner" on public.tutor_notes;
create policy "tutor_notes_all_owner" on public.tutor_notes for all
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid() and (public.is_student_in_my_group(student_id) or public.my_role() = 'admin'));

-- 6) OPCIONAL: neteja de comptes orfes creats abans d'aquesta migració (login sense perfil).
--    Està comentat perquè esborra usuaris: revisa'ls primer amb el select i, si són els que
--    esperes, descomenta el delete.
-- select u.id, u.email, u.created_at from auth.users u where not exists (select 1 from public.profiles p where p.id = u.id);
-- delete from auth.users u where not exists (select 1 from public.profiles p where p.id = u.id);
