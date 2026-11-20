import { beforeEach, expect, it } from "vitest";
import { stageAuthDraft, readAuthDraft, saveBuilderDraft } from "./auth-draft";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

it("restores the guest draft after OAuth and backs up an existing account draft", () => {
  const accountKey = "rireki:resume:user-1:ja:v1";
  localStorage.setItem(accountKey, JSON.stringify({ name: "Account draft" }));
  stageAuthDraft({ name: "Unsaved guest work" }, "ja", "rirekisho");
  const restored = readAuthDraft("ja");
  expect(restored.name).toBe("Unsaved guest work");
  expect(readAuthDraft("ko")).toBeNull();
  saveBuilderDraft(restored, accountKey, "ja", "user-1", "rirekisho");
  expect(JSON.parse(localStorage.getItem(accountKey)).name).toBe("Unsaved guest work");
  expect(JSON.parse(localStorage.getItem("rireki:backup:user-1:ja")).data.name).toBe("Account draft");
  expect(JSON.parse(localStorage.getItem("rireki:resume:ja:v1")).name).toBe("Unsaved guest work");
  expect(localStorage.getItem("resumemaker-style")).toBe("rirekisho");
  expect(readAuthDraft("ja")).toBeNull();
  saveBuilderDraft({ name: "Next edit" }, accountKey, "ja", "user-1", "rirekisho");
  expect(JSON.parse(localStorage.getItem("rireki:backup:user-1:ja")).data.name).toBe("Account draft");
});

it("keeps a staged draft available during the guest mount before session restoration", () => {
  const draft = { name: "Guest" };
  stageAuthDraft(draft, "ja", "modern");
  saveBuilderDraft(draft, "rireki:resume:ja:v1", "ja", undefined, "modern");
  expect(readAuthDraft("ja").name).toBe("Guest");
});
