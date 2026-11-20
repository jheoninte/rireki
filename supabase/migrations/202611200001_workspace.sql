-- Apply in the Supabase SQL editor or with `supabase db push`.
create sequence public.resume_revision;
create table public.resumes (
  user_id uuid not null references auth.users(id) on delete cascade,
  locale text not null check (locale in ('ja')),
  document jsonb not null check (octet_length(document::text) <= 1500000),
  revision bigint not null default nextval('public.resume_revision'),
  updated_at timestamptz not null default now(),
  primary key (user_id, locale)
);
alter table public.resumes enable row level security;
create policy own_resume on public.resumes for select to authenticated using (user_id = auth.uid());
grant select on public.resumes to authenticated;
revoke insert, update, delete on public.resumes from anon, authenticated;

create function public.save_resume(p_locale text, p_document jsonb, p_revision bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r public.resumes;
begin
  if auth.uid() is null then raise exception 'unauthorized'; end if;
  if p_locale <> 'ja' or p_document is null or
    jsonb_typeof(p_document->'data') is distinct from 'object' or
    jsonb_typeof(p_document->'data'->'education') is distinct from 'array' or
    jsonb_typeof(p_document->'data'->'careers') is distinct from 'array' or
    p_document->>'variant' not in ('classic','modern','developer','designer','marketing','ats') or
    p_document->>'variant' is null then raise exception 'invalid_document'; end if;
  -- Serialize inserts as well as updates to avoid a first-save race.
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text || p_locale, 0));
  select * into r from public.resumes where user_id = auth.uid() and locale = p_locale for update;
  if coalesce(r.revision, 0) <> p_revision then return jsonb_build_object('conflict', true); end if;
  insert into public.resumes(user_id, locale, document) values(auth.uid(), p_locale, p_document)
  on conflict(user_id, locale) do update set document = excluded.document,
    revision = nextval('public.resume_revision'), updated_at = clock_timestamp()
  returning * into r;
  return jsonb_build_object('revision', r.revision, 'updated_at', r.updated_at);
end $$;

create function public.delete_resume(p_locale text, p_revision bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare current_revision bigint;
begin
  if auth.uid() is null then raise exception 'unauthorized'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text || p_locale, 0));
  select revision into current_revision from public.resumes where user_id = auth.uid() and locale = p_locale for update;
  if coalesce(current_revision, 0) <> p_revision then return jsonb_build_object('conflict', true); end if;
  delete from public.resumes where user_id = auth.uid() and locale = p_locale;
  return jsonb_build_object('deleted', true);
end $$;

create table public.accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  credits integer not null default 0 check (credits >= 0),
  free_used integer not null default 0 check (free_used between 0 and 2),
  pro boolean not null default false,
  suspended boolean not null default false
);
create table public.ai_budget (
  day date primary key,
  reserved_microdollars bigint not null default 0 check (reserved_microdollars >= 0)
);
create table public.ai_requests (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  state text not null default 'pending' check (state in ('pending','complete','failed')),
  free boolean not null,
  result text,
  constraint result_size check (octet_length(result) <= 20000)
);
create index ai_user_day on public.ai_requests(user_id, created_at);
create table public.payment_events (
  event_id text primary key,
  session_id text not null unique,
  payment_intent text unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  product text not null check (product in ('pro','credits')),
  reversed boolean not null default false,
  created_at timestamptz not null default now()
);
-- These tables have no client write policies. Credits and costs are server-owned.
alter table public.accounts enable row level security;
alter table public.ai_budget enable row level security;
alter table public.ai_requests enable row level security;
alter table public.payment_events enable row level security;
revoke all on public.accounts, public.ai_budget, public.ai_requests, public.payment_events from anon, authenticated;
grant select, insert, update, delete on public.accounts, public.ai_budget, public.ai_requests, public.payment_events to service_role;

create function public.account_status() returns jsonb
language plpgsql security definer set search_path = public as $$
declare a public.accounts;
begin
  if auth.uid() is null then raise exception 'unauthorized'; end if;
  select * into a from public.accounts where user_id = auth.uid();
  return jsonb_build_object('credits', coalesce(a.credits,0), 'free_remaining', 2-coalesce(a.free_used,0), 'pro', coalesce(a.pro,false), 'suspended', coalesce(a.suspended,false));
end $$;

-- Reserve 1 cent for every attempt. Failed attempts keep their budget reservation:
-- provider charges can still occur on timeouts. User credits are refunded separately.
create function public.reserve_coaching(p_user uuid, p_id uuid, p_daily_budget bigint, p_free_daily integer)
returns jsonb language plpgsql security definer set search_path = public as $$
declare a public.accounts; previous public.ai_requests; used_free boolean; total bigint;
begin
  if p_daily_budget < 10000 or p_daily_budget > 100000000 or p_free_daily < 0 or p_free_daily > 1000 then
    raise exception 'invalid_budget';
  end if;
  insert into public.accounts(user_id) values(p_user) on conflict do nothing;
  select * into a from public.accounts where user_id = p_user for update;
  if a.suspended then return jsonb_build_object('error','suspended'); end if;
  select * into previous from public.ai_requests where id = p_id;
  if found then
    if previous.user_id <> p_user then return jsonb_build_object('error','invalid_request'); end if;
    if previous.state = 'complete' then return jsonb_build_object('text',previous.result); end if;
    return jsonb_build_object('error','in_progress');
  end if;
  if exists(select 1 from public.ai_requests where user_id=p_user and state='pending' and created_at>now()-interval '2 minutes') then
    return jsonb_build_object('error','in_progress');
  end if;
  if (select count(*) from public.ai_requests where user_id=p_user and created_at >= (now() at time zone 'UTC')::date::timestamp at time zone 'UTC') >= 30 then
    return jsonb_build_object('error','daily_limit');
  end if;
  used_free := a.free_used < 2;
  if not used_free and a.credits < 1 then return jsonb_build_object('error','no_credits'); end if;
  -- A single row serializes the global budget AND the global free-trial cap.
  insert into public.ai_budget(day) values((now() at time zone 'UTC')::date) on conflict do nothing;
  select reserved_microdollars into total from public.ai_budget where day=(now() at time zone 'UTC')::date for update;
  if total + 10000 > p_daily_budget then return jsonb_build_object('error','budget_limit'); end if;
  if used_free and (select count(*) from public.ai_requests where free and created_at >= (now() at time zone 'UTC')::date::timestamp at time zone 'UTC') >= p_free_daily then
    return jsonb_build_object('error','budget_limit');
  end if;
  update public.ai_budget set reserved_microdollars=reserved_microdollars+10000 where day=(now() at time zone 'UTC')::date;
  update public.accounts set free_used=free_used+case when used_free then 1 else 0 end,
    credits=credits-case when used_free then 0 else 1 end where user_id=p_user;
  insert into public.ai_requests(id,user_id,free) values(p_id,p_user,used_free);
  return jsonb_build_object('reserved',true);
end $$;

create function public.finish_coaching(p_user uuid, p_id uuid, p_result text)
returns void language plpgsql security definer set search_path = public as $$
declare r public.ai_requests;
begin
  -- Same locking order as reserve_coaching.
  perform 1 from public.accounts where user_id=p_user for update;
  select * into r from public.ai_requests where id=p_id and user_id=p_user for update;
  if not found or r.state <> 'pending' then return; end if;
  if p_result is null then
    update public.accounts set free_used=free_used-case when r.free then 1 else 0 end,
      credits=credits+case when r.free then 0 else 1 end where user_id=p_user;
  end if;
  update public.ai_requests set state=case when p_result is null then 'failed' else 'complete' end, result=p_result where id=p_id;
end $$;

create function public.fulfill_payment(p_event text, p_session text, p_intent text, p_user uuid, p_product text)
returns void language plpgsql security definer set search_path = public as $$
declare inserted integer;
begin
  if p_product not in ('pro','credits') then raise exception 'invalid_product'; end if;
  insert into public.payment_events(event_id,session_id,payment_intent,user_id,product)
    values(p_event,p_session,p_intent,p_user,p_product) on conflict do nothing;
  get diagnostics inserted = row_count;
  if inserted = 0 then return; end if;
  insert into public.accounts(user_id) values(p_user) on conflict do nothing;
  update public.accounts set pro=pro or p_product='pro', credits=credits+case when p_product='credits' then 20 else 0 end where user_id=p_user;
end $$;

-- Recover reserved user credits after a killed Edge Function. Run every 10 min
-- with pg_cron or a trusted scheduler. Never releases the provider-cost budget.
create function public.reconcile_coaching() returns integer
language plpgsql security definer set search_path = public as $$
declare r record; recovered integer := 0;
begin
  for r in select user_id,id from public.ai_requests where state='pending' and created_at<now()-interval '10 minutes' loop
    perform public.finish_coaching(r.user_id,r.id,null);
    recovered := recovered + 1;
  end loop;
  return recovered;
end $$;

-- Refunds and disputes block further AI spending until an operator reviews them.
create function public.reverse_payment(p_intent text)
returns void language plpgsql security definer set search_path = public as $$
declare payment public.payment_events;
begin
  select * into payment from public.payment_events where payment_intent=p_intent;
  if not found then raise exception 'payment_not_fulfilled_yet'; end if;
  perform 1 from public.accounts where user_id=payment.user_id for update;
  select * into payment from public.payment_events where payment_intent=p_intent for update;
  if payment.reversed then return; end if;
  update public.payment_events set reversed=true where payment_intent=p_intent;
  update public.accounts set suspended=true,
    credits=greatest(0,credits-case when payment.product='credits' then 20 else 0 end),
    pro=exists(select 1 from public.payment_events where user_id=payment.user_id and product='pro' and not reversed)
  where user_id=payment.user_id;
end $$;

revoke execute on function public.save_resume, public.delete_resume, public.account_status from public, anon;
grant execute on function public.save_resume, public.delete_resume, public.account_status to authenticated;
revoke execute on function public.reserve_coaching, public.finish_coaching, public.fulfill_payment, public.reverse_payment, public.reconcile_coaching from public, anon, authenticated;
grant execute on function public.reserve_coaching, public.finish_coaching, public.fulfill_payment, public.reverse_payment, public.reconcile_coaching to service_role;
