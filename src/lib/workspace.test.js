// @vitest-environment node
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { completion } from './services';

let db;
const alice = '00000000-0000-4000-8000-000000000001';
const bob = '00000000-0000-4000-8000-000000000002';
const request = i => `10000000-0000-4000-8000-${String(i).padStart(12, '0')}`;
const document = { data: { name: 'Alice', education: [], careers: [] }, variant: 'modern' };
const result = async (sql, args = []) => (await db.query(sql, args)).rows[0]?.value;
const asUser = async id => db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
const reserve = (id, uuid, budget = 50000, free = 100) => result('select public.reserve_coaching($1,$2,$3,$4) as value', [id, uuid, budget, free]);
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth to authenticated; grant execute on function auth.uid to authenticated;
    insert into auth.users values ('${alice}'),('${bob}');`);
  await db.exec(readFileSync(new URL('../../supabase/migrations/202611200001_workspace.sql', import.meta.url), 'utf8'));
  await db.exec(readFileSync(new URL('../../supabase/migrations/202611200002_document_templates.sql', import.meta.url), 'utf8'));
  await db.exec(readFileSync(new URL('../../supabase/migrations/202611200003_applicant_templates.sql', import.meta.url), 'utf8'));
  await db.exec(readFileSync(new URL('../../supabase/migrations/202611200004_korean_market.sql', import.meta.url), 'utf8'));
  await db.exec(readFileSync(new URL('../../supabase/migrations/202611200005_korean_career.sql', import.meta.url), 'utf8'));
  await db.exec(readFileSync(new URL('../../supabase/migrations/202611200006_english_market.sql', import.meta.url), 'utf8'));
}, 30000);
afterAll(async () => { await db?.close(); });

describe('cloud persistence and account isolation (real PostgreSQL)', () => {
  it('saves every English template with locale and revision checks', async () => {
    const { englishTemplateIds } = await import('./english-templates');
    await asUser(bob);
    for (const variant of englishTemplateIds) {
      const saved = await result('select public.save_resume($1,$2,$3) as value', ['en', { ...document, variant }, 0]);
      expect(saved.revision).toBeGreaterThan(0);
      expect(await result('select public.save_resume($1,$2,$3) as value', ['en', { ...document, variant }, 0])).toEqual({ conflict: true });
      await result('select public.delete_resume($1,$2) as value', ['en', saved.revision]);
    }
    await expect(result('select public.save_resume($1,$2,$3) as value', ['ja', { ...document, variant: 'en-clear' }, 0])).rejects.toThrow(/invalid_document/);
    await expect(result('select public.save_resume($1,$2,$3) as value', ['en', document, 0])).rejects.toThrow(/invalid_document/);
  });
  it('saves the Korean career document with revision locking and rejects it for Japanese drafts', async () => {
    await asUser(bob);
    const career = { ...document, variant: 'career-description', data: { ...document.data, projects: [{ projectName: '프로젝트', projectResult: '성과' }], accent: 'navy' } };
    const saved = await result('select public.save_resume($1,$2,$3) as value', ['ko', career, 0]);
    expect(saved.revision).toBeGreaterThan(0);
    expect(await result('select public.save_resume($1,$2,$3) as value', ['ko', career, 0])).toEqual({ conflict: true });
    await expect(result('select public.save_resume($1,$2,$3) as value', ['ja', career, 0])).rejects.toThrow(/invalid_document/);
    expect((await db.query('select document from public.resumes where user_id=$1 and locale=$2', [bob, 'ko'])).rows[0].document).toEqual(career);
    await result('select public.delete_resume($1,$2) as value', ['ko', saved.revision]);
  });
  it('separates Korean and Japanese drafts and rejects a Japanese form for a Korean draft', async () => {
    await asUser(bob);
    const save = (locale, variant, name) => result('select public.save_resume($1,$2,$3) as value', [locale, { data: { name, education: [], careers: [] }, variant }, 0]);
    const korean = await save('ko', 'modern', '한국어 초안');
    const japanese = await save('ja', 'rirekisho', '日本語の下書き');
    expect((await db.query('select locale, document from public.resumes where user_id = $1 order by locale', [bob])).rows.map(row => [row.locale, row.document.data.name])).toEqual([['ja', '日本語の下書き'], ['ko', '한국어 초안']]);
    await expect(save('ko', 'rirekisho', '잘못된 서식')).rejects.toThrow(/invalid_document/);
    await result('select public.delete_resume($1,$2) as value', ['ko', korean.revision]);
    await result('select public.delete_resume($1,$2) as value', ['ja', japanese.revision]);
  });
  it('accepts the new applicant templates with the same account and revision rules', async () => {
    await asUser(bob);
    for (const variant of ['rirekisho-graduate', 'rirekisho-part-time', 'rirekisho-return']) {
      const saved = await result('select public.save_resume($1,$2,$3) as value', ['ja', { ...document, variant }, 0]);
      expect(saved.revision).toBeGreaterThan(0);
      expect(await result('select public.save_resume($1,$2,$3) as value', ['ja', { ...document, variant }, 0])).toEqual({ conflict: true });
      await result('select public.delete_resume($1,$2) as value', ['ja', saved.revision]);
    }
  });
  it('saves each Japanese document type without bypassing revision checks', async () => {
    await asUser(bob);
    const first = await result('select public.save_resume($1,$2,$3) as value', ['ja', { ...document, variant: 'rirekisho' }, 0]);
    const next = await result('select public.save_resume($1,$2,$3) as value', ['ja', { ...document, variant: 'work-history' }, first.revision]);
    expect(next.revision).toBeGreaterThan(first.revision);
    expect(await result('select public.save_resume($1,$2,$3) as value', ['ja', { ...document, variant: 'work-history' }, first.revision])).toEqual({ conflict: true });
    await result('select public.delete_resume($1,$2) as value', ['ja', next.revision]);
  });
  it('prevents lost updates, cross-account reads, and stale saves after delete/recreate', async () => {
    await asUser(alice);
    const save = revision => result('select public.save_resume($1,$2,$3) as value', ['ja', document, revision]);
    const first = await save(0);
    expect(first.revision).toBeGreaterThan(0);
    expect(await save(0)).toEqual({ conflict: true });
    await asUser(bob);
    await db.exec('set role authenticated');
    expect((await db.query('select * from public.resumes')).rows).toHaveLength(0);
    await expect(db.query('update public.resumes set revision=123')).rejects.toThrow(/permission denied/);
    await db.exec('reset role');
    await asUser(alice);
    expect(await result('select public.delete_resume($1,$2) as value', ['ja', first.revision])).toEqual({ deleted: true });
    const recreated = await save(0);
    expect(recreated.revision).toBeGreaterThan(first.revision);
    expect(await save(first.revision)).toEqual({ conflict: true });
  });
  it('denies anonymous and client-side billing mutation', async () => {
    await db.exec('set role authenticated');
    await expect(db.query('select public.fulfill_payment($1,$2,$3,$4,$5)', ['event', 'session', 'intent', alice, 'credits'])).rejects.toThrow(/permission denied/);
    await expect(db.query('insert into public.accounts(user_id,credits) values($1,999)', [alice])).rejects.toThrow(/permission denied/);
    await db.exec('reset role');
    await asUser('');
    await expect(result('select public.account_status() as value')).rejects.toThrow(/unauthorized/);
  });
});

describe('billing and AI cost controls (real PostgreSQL)', () => {
  it('fulfills each paid session and payment intent only once', async () => {
    const pay = (event, session, intent) => db.query('select public.fulfill_payment($1,$2,$3,$4,$5)', [event, session, intent, alice, 'credits']);
    await pay('evt1', 'cs1', 'pi1');
    await pay('evt1', 'cs1', 'pi1');
    await pay('evt2', 'cs1', 'pi1');
    await pay('evt3', 'cs2', 'pi1');
    await asUser(alice);
    expect((await result('select public.account_status() as value')).credits).toBe(20);
  });
  it('reserves before generation, replays completed requests, refunds once, and retains cost reservations', async () => {
    expect(await reserve(alice, request(1))).toEqual({ reserved: true });
    expect(await reserve(alice, request(1))).toEqual({ error: 'in_progress' });
    expect(await reserve(alice, request(2))).toEqual({ error: 'in_progress' });
    await db.query('select public.finish_coaching($1,$2,$3)', [alice, request(1), '完成した文章']);
    expect(await reserve(alice, request(1))).toEqual({ text: '完成した文章' });
    expect(await reserve(alice, request(2))).toEqual({ reserved: true });
    await db.query('select public.finish_coaching($1,$2,null)', [alice, request(2)]);
    await db.query('select public.finish_coaching($1,$2,null)', [alice, request(2)]);
    await asUser(alice);
    expect((await result('select public.account_status() as value')).free_remaining).toBe(1);
    expect(await result('select sum(reserved_microdollars)::int as value from public.ai_budget')).toBe(20000);
    expect(await reserve(alice, request(3), 20000)).toEqual({ error: 'budget_limit' });
  });
  it('limits trials globally and blocks paid generation without credits', async () => {
    expect(await reserve(bob, request(4), 50000, 0)).toEqual({ error: 'budget_limit' });
    await db.query('update public.accounts set free_used=2 where user_id=$1', [bob]);
    expect(await reserve(bob, request(5))).toEqual({ error: 'no_credits' });
    await db.query('update public.accounts set free_used=2 where user_id=$1', [alice]);
    expect(await reserve(alice, request(6))).toEqual({ reserved: true });
    await db.query('select public.finish_coaching($1,$2,$3)', [alice, request(6), '有料の文章']);
    await asUser(alice);
    expect((await result('select public.account_status() as value')).credits).toBe(19);
  });
  it('recovers crashed reservations once without releasing the cost budget', async () => {
    await db.query('update public.accounts set credits=1 where user_id=$1', [bob]);
    expect(await reserve(bob, request(7))).toEqual({ reserved: true });
    await db.query("update public.ai_requests set created_at=now()-interval '11 minutes' where id=$1", [request(7)]);
    const costBefore = await result('select sum(reserved_microdollars)::int as value from public.ai_budget');
    expect(await result('select public.reconcile_coaching() as value')).toBe(1);
    expect(await result('select public.reconcile_coaching() as value')).toBe(0);
    await asUser(bob);
    expect((await result('select public.account_status() as value')).credits).toBe(1);
    expect(await result('select sum(reserved_microdollars)::int as value from public.ai_budget')).toBe(costBefore);
  });
  it('revokes refunded purchases idempotently and stops further AI spending', async () => {
    await db.query('select public.fulfill_payment($1,$2,$3,$4,$5)', ['evt-pro', 'cs-pro', 'pi-pro', alice, 'pro']);
    await asUser(alice);
    expect((await result('select public.account_status() as value')).pro).toBe(true);
    await db.query('select public.reverse_payment($1)', ['pi-pro']);
    expect((await result('select public.account_status() as value')).pro).toBe(false);
    await db.query('select public.reverse_payment($1)', ['pi1']);
    await db.query('select public.reverse_payment($1)', ['pi1']);
    const account = await result('select public.account_status() as value');
    expect(account.credits).toBe(0);
    expect(account.suspended).toBe(true);
    expect(await reserve(alice, request(8))).toEqual({ error: 'suspended' });
  });
});

it('calculates the halfway login nudge from actual content', () => {
  const data = { name: 'A', email: 'a@b.c', title: 'Engineer', education: [{ school: 'School' }], careers: [], skills: '', intro: '', motivation: '' };
  expect(completion(data)).toBe(50);
});
