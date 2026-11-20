import React, { useState } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  act,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import { I18nProvider } from "../i18n";
import ja from "../i18n/ja";
import { LEGACY_KEY } from "../lib/legacy-draft";
import { japaneseToday } from '../lib/japanese-personal';
vi.mock("../lib/auth", () => ({ supabase: null, authConfigured: false }));
vi.mock("../lib/export", () => ({ exportResume: vi.fn().mockResolvedValue(undefined) }));
import { exportResume } from "../lib/export";
import Builder from "./Builder";

function TestBuilder({ onLogin = () => {}, session } = {}) {
  const [variant, setVariant] = useState("modern");
  return (
    <I18nProvider>
      <Builder
        variant={variant}
        setVariant={setVariant}
        onHome={() => {}}
        onLogin={onLogin}
        session={session}
      />
    </I18nProvider>
  );
}
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.clearAllMocks();
  Element.prototype.scrollIntoView = vi.fn();
});
it('defaults the Japanese date, auto-calculates age, permits manual edits and saves separate postal codes', () => {
  const view = render(<TestBuilder />);
  expect(screen.getByRole('textbox', { name: '記入日', exact: true }).value).toBe(japaneseToday());
  const jobs = screen.getByRole('combobox', { name: '希望する職種', exact: true });
  expect(Array.from(jobs.options).map(option => option.text)).toEqual(['営業', '事務・管理', '企画・マーケティング', 'ITエンジニア', 'クリエイティブ', '販売・接客・サービス', '医療・福祉・教育', '製造・建築・物流']);
  fireEvent.change(jobs, { target: { value: 'care' } });
  expect(view.container.textContent).toContain('個人が特定される情報は含めません');
  fireEvent.change(screen.getByRole('textbox', { name: '記入日', exact: true }), { target: { value: '令和7年2月7日' } });
  fireEvent.change(screen.getByRole('textbox', { name: '生年月日', exact: true }), { target: { value: '平成12年2月1日' } });
  expect(screen.getByRole('textbox', { name: '満年齢', exact: true }).value).toBe('25');
  fireEvent.change(screen.getByRole('textbox', { name: '満年齢', exact: true }), { target: { value: '24' } });
  fireEvent.change(screen.getByRole('textbox', { name: '郵便番号', exact: true }), { target: { value: '1000003' } });
  fireEvent.change(screen.getByRole('textbox', { name: '連絡先の郵便番号', exact: true }), { target: { value: '5300001' } });
  expect(view.container.querySelector('.unified-preview').textContent).toContain('〒100-0003');
  expect(view.container.querySelector('.unified-preview').textContent).toContain('〒530-0001');
  view.unmount();
  render(<TestBuilder />);
  expect(screen.getByRole('textbox', { name: '満年齢', exact: true }).value).toBe('24');
  expect(screen.getByRole('textbox', { name: '記入日', exact: true }).value).toBe('令和7年2月7日');
  fireEvent.change(screen.getByRole('textbox', { name: '記入日', exact: true }), { target: { value: '令和8年2月7日' } });
  expect(screen.getByRole('textbox', { name: '満年齢', exact: true }).value).toBe('26');
});

it("nudges after three meaningful items, ignores blank rows and stays dismissed", () => {
  const onLogin = vi.fn();
  render(<TestBuilder onLogin={onLogin} />);
  expect(screen.queryByText(ja.auth.nudge)).toBeNull();
  fireEvent.change(screen.getByRole("textbox", { name: /^氏名/ }), { target: { value: "山田" } });
  fireEvent.change(screen.getByLabelText(ja.fields.email), { target: { value: "a@example.test" } });
  expect(screen.queryByText(ja.auth.nudge)).toBeNull();
  fireEvent.change(screen.getByLabelText(ja.fields.position), { target: { value: "Developer" } });
  expect(screen.getByText(ja.auth.nudge)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: ja.auth.nudgeAction }));
  expect(onLogin).toHaveBeenCalledOnce();
  fireEvent.change(screen.getByLabelText(ja.fields.position), { target: { value: "Designer" } });
  expect(screen.queryByText(ja.auth.nudge)).toBeNull();
});

it("offers the PDF soft wall once and downloads after closing and choosing the fallback", async () => {
  const onLogin = vi.fn();
  render(<TestBuilder onLogin={onLogin} />);
  fireEvent.change(screen.getByRole("textbox", { name: /^氏名/ }), { target: { value: "山田" } });
  fireEvent.click(screen.getByRole("button", { name: ja.common.pdf }));
  expect(exportResume).not.toHaveBeenCalled();
  const request = onLogin.mock.calls[0][0];
  expect(request.reason).toBe("pdf");
  act(() => request.onDismiss());
  fireEvent.click(screen.getByRole("button", { name: ja.auth.downloadAnyway }));
  await waitFor(() => expect(exportResume).toHaveBeenCalledOnce());
  expect(exportResume.mock.calls[0][3]).toMatchObject({ authenticated: false, watermark: true });
  expect(onLogin).toHaveBeenCalledOnce();
});

it("downloads directly for signed-in users without a watermark", async () => {
  render(<TestBuilder session={{ user: { id: "user-1" } }} />);
  fireEvent.change(screen.getByRole("textbox", { name: /^氏名/ }), { target: { value: "山田" } });
  fireEvent.click(screen.getByRole("button", { name: ja.common.pdf }));
  await waitFor(() => expect(exportResume).toHaveBeenCalledOnce());
  expect(exportResume.mock.calls[0][3]).toMatchObject({ authenticated: true, watermark: false });
  expect(screen.queryByText(ja.auth.nudge)).toBeNull();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("lets a user choose between drafts and undo an import without deleting the original", () => {
  const old = {
    fullName: "以前の下書き",
    experience: [
      {
        company: "旧会社",
        role: "Designer",
        description: "制作実績",
        start: "2022-01",
        end: "",
      },
    ],
  };
  localStorage.setItem(LEGACY_KEY, JSON.stringify(old));
  localStorage.setItem(
    "rireki:resume:ja:v1",
    JSON.stringify({ name: "現在の下書き" }),
  );
  render(<TestBuilder />);
  expect(screen.getByRole("textbox", { name: /^氏名/ }).value).toBe(
    "現在の下書き",
  );
  const banner = screen.getByRole("region", { name: ja.unified.legacyTitle });
  fireEvent.click(
    within(banner).getByRole("button", { name: ja.unified.legacyImport }),
  );
  fireEvent.click(
    within(screen.getByRole("dialog")).getByRole("button", {
      name: ja.unified.legacyImport,
    }),
  );
  expect(screen.getByRole("textbox", { name: /^氏名/ }).value).toBe(
    "以前の下書き",
  );
  expect(screen.getByLabelText(ja.fields.position).value).toBe("Designer");
  expect(JSON.parse(localStorage.getItem(LEGACY_KEY))).toEqual(old);
  fireEvent.click(screen.getByRole("button", { name: ja.unified.restore }));
  fireEvent.click(
    within(screen.getByRole("dialog")).getByRole("button", {
      name: ja.unified.restore,
    }),
  );
  expect(screen.getByRole("textbox", { name: /^氏名/ }).value).toBe(
    "現在の下書き",
  );
});

it("switches between mobile editing and preview, restoring scroll and keyboard access", () => {
  vi.stubGlobal("matchMedia", () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  render(<TestBuilder />);
  const toggle = screen.getByRole("button", { name: ja.unified.previewOpen });
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  expect(
    screen.queryByRole("complementary", { name: ja.builder.preview }),
  ).toBeNull();
  fireEvent.click(toggle);
  expect(document.body.style.overflow).toBe("hidden");
  expect(
    screen.getByRole("complementary", { name: ja.builder.preview }),
  ).toBeTruthy();
  expect(document.querySelector(".unified-editor").hasAttribute("inert")).toBe(
    true,
  );
  fireEvent.keyDown(document, { key: "Escape" });
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  expect(document.body.style.overflow).toBe("");
  expect(document.querySelector(".unified-editor").hasAttribute("inert")).toBe(
    false,
  );
});

it('keeps the same draft when switching Japanese document types and saves added fields', () => {
  render(<TestBuilder />);
  const picker = screen.getByRole('combobox', { name: '書類・テンプレート', exact: true });
  fireEvent.change(screen.getByRole('textbox', { name: /^氏名/ }), { target: { value: '下書き保持テスト' } });
  fireEvent.change(picker, { target: { value: 'rirekisho' } });
  fireEvent.change(screen.getByRole('textbox', { name: ja.fields.addressFurigana, exact: true }), { target: { value: 'とうきょうと' } });
  fireEvent.change(screen.getByRole('textbox', { name: new RegExp('^' + ja.fields.qualifications) }), { target: { value: '基本情報技術者' } });
  fireEvent.change(picker, { target: { value: 'work-history' } });
  expect(screen.getByRole('textbox', { name: /^氏名/ }).value).toBe('下書き保持テスト');
  const preview = screen.getByRole('complementary', { name: ja.builder.preview });
  expect(preview.textContent).toContain('職 務 経 歴 書');
  expect(preview.textContent).toContain('基本情報技術者');
  const saved = JSON.parse(localStorage.getItem('rireki:resume:ja:v1'));
  expect(saved).toMatchObject({ name: '下書き保持テスト', addressFurigana: 'とうきょうと', qualifications: '基本情報技術者' });
});

it('applies a contextual example and confirms before replacing existing writing', () => {
  render(<TestBuilder />);
  fireEvent.click(screen.getByRole('button', { name: '自己PR · 書き方のヒント' }));
  const hint = screen.getByRole('region', { name: '自己PR · 書き方のヒント' });
  expect(hint.textContent).toContain('STAR');
  fireEvent.click(within(hint).getByRole('button', { name: ja.builderFeatures.apply }));
  const input = screen.getByRole('textbox', { name: ja.fields.intro, exact: true });
  expect(input.value).toContain('私の強み');
  fireEvent.change(input, { target: { value: '自分で書いた文章' } });
  fireEvent.click(within(hint).getByRole('button', { name: ja.builderFeatures.apply }));
  expect(input.value).toBe('自分で書いた文章');
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: ja.builderFeatures.apply }));
  expect(input.value).toContain('私の強み');
});

it('shows project fields only for professional history and retains them across switches', () => {
  render(<TestBuilder />);
  const picker = screen.getByRole('combobox', { name: '書類・テンプレート', exact: true });
  expect(screen.queryByLabelText(ja.builderFeatures.fields.projectName, { exact: true })).toBeNull();
  fireEvent.change(picker, { target: { value: 'work-history' } });
  fireEvent.change(screen.getByLabelText(ja.builderFeatures.fields.projectName, { exact: true }), { target: { value: '顧客管理の刷新' } });
  fireEvent.change(screen.getByLabelText(ja.builderFeatures.fields.projectStack, { exact: true }), { target: { value: 'React / Supabase' } });
  const preview = screen.getByRole('complementary', { name: ja.builder.preview });
  expect(preview.textContent).toContain('顧客管理の刷新');
  expect(preview.querySelector('.project-stack-table').textContent).toContain('React / Supabase');
  fireEvent.change(picker, { target: { value: 'rirekisho' } });
  expect(screen.queryByLabelText(ja.builderFeatures.fields.projectName, { exact: true })).toBeNull();
  fireEvent.change(picker, { target: { value: 'work-history' } });
  expect(screen.getByLabelText(ja.builderFeatures.fields.projectName, { exact: true }).value).toBe('顧客管理の刷新');
});

it('adapts Japanese applicant fields and exports only the active template content while retaining the draft', () => {
  render(<TestBuilder />);
  const picker = screen.getByRole('combobox', { name: '書類・テンプレート', exact: true });
  expect(screen.queryByRole('textbox', { name: '学生時代に力を入れたこと', exact: true })).toBeNull();
  fireEvent.change(picker, { target: { value: 'rirekisho-graduate' } });
  fireEvent.change(screen.getByRole('textbox', { name: '学生時代に力を入れたこと', exact: true }), { target: { value: '学園祭の準備を改善した経験' } });
  const preview = screen.getByRole('complementary', { name: ja.builder.preview });
  expect(preview.textContent).toContain('学園祭の準備を改善した経験');
  fireEvent.change(picker, { target: { value: 'rirekisho-part-time' } });
  expect(preview.textContent).not.toContain('学園祭の準備を改善した経験');
  fireEvent.change(screen.getByRole('textbox', { name: '勤務可能な曜日', exact: true }), { target: { value: '火曜日・木曜日' } });
  expect(preview.textContent).toContain('火曜日・木曜日');
  fireEvent.change(picker, { target: { value: 'rirekisho' } });
  expect(preview.textContent).not.toContain('火曜日・木曜日');
  fireEvent.change(picker, { target: { value: 'rirekisho-graduate' } });
  expect(screen.getByRole('textbox', { name: '学生時代に力を入れたこと', exact: true }).value).toBe('学園祭の準備を改善した経験');
  const draft = JSON.parse(localStorage.getItem('rireki:resume:ja:v1'));
  expect(draft.workDays).toBe('火曜日・木曜日');
});
