-- Add the Korean career document while preserving revision and account isolation.
create or replace function public.save_resume(p_locale text, p_document jsonb, p_revision bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r public.resumes;
begin
  if auth.uid() is null then raise exception 'unauthorized'; end if;
  if p_locale is null or p_locale not in ('ja','ko') or p_document is null or
    (p_locale = 'ko' and p_document->>'variant' not in ('modern','classic','career-description')) or
    (p_locale <> 'ko' and p_document->>'variant' = 'career-description') or
    jsonb_typeof(p_document->'data') is distinct from 'object' or
    jsonb_typeof(p_document->'data'->'education') is distinct from 'array' or
    jsonb_typeof(p_document->'data'->'careers') is distinct from 'array' or
    p_document->>'variant' not in ('classic','modern','career-description','developer','designer','marketing','ats','rirekisho','rirekisho-graduate','rirekisho-part-time','rirekisho-return','work-history') or
    p_document->>'variant' is null then raise exception 'invalid_document'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text || p_locale, 0));
  select * into r from public.resumes where user_id = auth.uid() and locale = p_locale for update;
  if coalesce(r.revision, 0) <> p_revision then return jsonb_build_object('conflict', true); end if;
  insert into public.resumes(user_id, locale, document) values(auth.uid(), p_locale, p_document)
  on conflict(user_id, locale) do update set document = excluded.document,
    revision = nextval('public.resume_revision'), updated_at = clock_timestamp()
  returning * into r;
  return jsonb_build_object('revision', r.revision, 'updated_at', r.updated_at);
end $$;
