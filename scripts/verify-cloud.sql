-- Run after migrations. Synthetic documents are always rolled back.
begin;
select set_config('request.jwt.claim.sub', (select id::text from auth.users order by created_at limit 1), true);
set local role authenticated;
do $$
declare market text; template text; saved jsonb; prior bigint;
begin
  if auth.uid() is null then raise exception 'A signed-up test account is required'; end if;
  foreach market in array array['ja','ko','en'] loop
    template := case market when 'ja' then 'rirekisho' when 'ko' then 'modern' else 'en-clear' end;
    select coalesce(max(revision),0) into prior from public.resumes where locale=market;
    saved := public.save_resume(market, jsonb_build_object('variant',template,'data',jsonb_build_object('education','[]'::jsonb,'careers','[]'::jsonb,'name','Launch verification')), prior);
    if saved->>'revision' is null then raise exception 'Save failed: %', market; end if;
    if public.save_resume(market, jsonb_build_object('variant',template,'data',jsonb_build_object('education','[]'::jsonb,'careers','[]'::jsonb)), prior)->>'conflict' is distinct from 'true' then
      raise exception 'Revision conflict protection failed';
    end if;
  end loop;
  perform set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000099',true);
  if exists(select 1 from public.resumes) then raise exception 'Cross-account read isolation failed'; end if;
  if has_table_privilege('authenticated','public.resumes','INSERT') or has_table_privilege('authenticated','public.resumes','UPDATE') or has_table_privilege('authenticated','public.resumes','DELETE') then
    raise exception 'Direct client writes must be blocked';
  end if;
  if has_function_privilege('anon','public.save_resume(text,jsonb,bigint)','EXECUTE') then raise exception 'Anonymous save is exposed'; end if;
end $$;
reset role;
rollback;
select 'PASS: 3 markets, revision conflicts, RLS isolation, write permissions; all test writes rolled back' as verification;
