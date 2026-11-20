import { beforeEach, expect, it } from "vitest";
import {
  LEGACY_IMPORTED,
  LEGACY_KEY,
  convertLegacyDraft,
  loadUnifiedDraft,
} from "./legacy-draft";
import { isLegacyEditorPath } from "./routes";

const old = {
  fullName: "김지우",
  jobTitle: "프로덕트 디자이너",
  email: "example@example.test",
  phone: "010-0000-0000",
  location: "서울",
  summary: "소개",
  skillList: "Figma, React",
  experience: [
    {
      company: "회사",
      role: "디자이너",
      start: "2022-03",
      end: "",
      description: "긴 성과\n".repeat(700),
    },
  ],
  education: [
    { school: "대학", major: "디자인", start: "2016-03", end: "2020-02" },
  ],
};
const key = "rireki:resume:ja:v1";
beforeEach(() => localStorage.clear());

it("converts every legacy field, including role, dates and long descriptions without truncation", () => {
  const data = convertLegacyDraft(old);
  expect(data).toMatchObject({
    name: old.fullName,
    title: old.jobTitle,
    email: old.email,
    phone: old.phone,
    address: old.location,
    intro: old.summary,
    skills: old.skillList,
  });
  expect(data.careers[0]).toEqual({
    company: "회사",
    position: "디자이너",
    period: "2022-03 — 現在",
    role: old.experience[0].description,
  });
  expect(data.education[0].period).toBe("2016-03 — 2020-02");
});
it("migrates to an empty main draft once and preserves the source", () => {
  localStorage.setItem(LEGACY_KEY, JSON.stringify(old));
  const data = loadUnifiedDraft(key, true);
  expect(data.name).toBe("김지우");
  expect(JSON.parse(localStorage.getItem(key)).careers[0].role).toBe(
    old.experience[0].description,
  );
  expect(localStorage.getItem(LEGACY_IMPORTED)).toBe("1");
  expect(JSON.parse(localStorage.getItem(LEGACY_KEY))).toEqual(old);
  expect(loadUnifiedDraft(key, true).careers[0].role).toBe(
    old.experience[0].description,
  );
});
it("keeps both drafts when the main service already has a document", () => {
  localStorage.setItem(key, JSON.stringify({ name: "別の下書き" }));
  localStorage.setItem(LEGACY_KEY, JSON.stringify(old));
  expect(loadUnifiedDraft(key, true).name).toBe("別の下書き");
  expect(localStorage.getItem(LEGACY_IMPORTED)).toBeNull();
  expect(JSON.parse(localStorage.getItem(LEGACY_KEY))).toEqual(old);
});
it("does not copy anonymous data into an account without an explicit import", () => {
  localStorage.setItem(LEGACY_KEY, JSON.stringify(old));
  expect(loadUnifiedDraft("account-draft", false).name).toBe("");
  expect(localStorage.getItem("account-draft")).toBeNull();
});
it("ignores malformed inputs and never deletes their original storage", () => {
  localStorage.setItem(LEGACY_KEY, "{broken");
  expect(loadUnifiedDraft(key, true).name).toBe("");
  expect(localStorage.getItem(LEGACY_KEY)).toBe("{broken");
  expect(convertLegacyDraft(null)).toBeNull();
  expect(convertLegacyDraft({})).toBeNull();
});
it("recognizes all old editor entry URLs without matching unrelated pages", () => {
  for (const path of [
    "/templates/resume-builder",
    "/templates/resume-builder/",
    "/templates/resume-builder/index.html",
  ])
    expect(isLegacyEditorPath(path)).toBe(true);
  expect(isLegacyEditorPath("/")).toBe(false);
  expect(isLegacyEditorPath("/reset-password")).toBe(false);
});
