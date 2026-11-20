/* Standalone template. No framework or build step is needed. */
const STORAGE_KEY = "folio.resume-template.v1";
const example = {
  fullName: "김지우", jobTitle: "프로덕트 디자이너", email: "jiwoo.kim@email.com",
  phone: "010-1234-5678", location: "서울특별시",
  summary: "사용자의 작은 불편에서 더 나은 경험의 실마리를 찾는 프로덕트 디자이너입니다. 리서치부터 설계, 검증까지 팀과 함께하며 비즈니스와 사용자 모두에게 의미 있는 변화를 만듭니다.",
  skillList: "Figma, UX 리서치, 프로토타이핑, 디자인 시스템",
  experience: [{ company: "스튜디오 넥스트", role: "프로덕트 디자이너", start: "2022-03", end: "", description: "• 사용자 리서치를 바탕으로 핵심 서비스 온보딩 경험 개선\n• 공통 디자인 시스템 구축 및 개발팀 협업 프로세스 정립\n• 데이터 기반의 실험과 검증으로 전환율 개선" }],
  education: [{ school: "한국대학교", major: "시각디자인학과 · 학사", start: "2016-03", end: "2020-02" }],
};
const form = document.querySelector("#resume-form");
const preview = document.querySelector("#resume-preview");
const toggle = document.querySelector("#mobile-toggle");
let state = structuredClone(example);
let nextId = 0;
let saveTimer;
let toastTimer;
let storageFailed = false;

// Accept only the expected string fields from browser storage.
function normalize(raw) {
  const result = {};
  for (const key of Object.keys(example)) {
    if (Array.isArray(example[key])) {
      result[key] = Array.isArray(raw[key]) ? raw[key].filter(item => item && typeof item === "object").map(item => Object.fromEntries(Object.keys(example[key][0]).map(field => [field, typeof item[field] === "string" ? item[field] : ""]))) : [];
    } else result[key] = typeof raw[key] === "string" ? raw[key] : "";
  }
  return result;
}
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) state = normalize(parsed);
  }
} catch { storageFailed = true; }

function notify(message) {
  const status = document.querySelector("#status");
  status.textContent = message;
  status.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => status.classList.remove("visible"), 4000);
}
function save(manual = false) {
  clearTimeout(saveTimer);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    storageFailed = false;
    if (manual) notify("이 브라우저에 이력서를 저장했어요.");
  } catch {
    if (manual || !storageFailed) notify("브라우저에 저장할 수 없어요. PDF로 내용을 보관해 주세요.");
    storageFailed = true;
  }
}
// All entered content is rendered as text, never as HTML.
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function field(label, key, value, type = "text", wide = false) {
  const wrapper = element("div", `field${wide ? " full-width" : ""}`);
  const id = `entry-${++nextId}`;
  const caption = element("label", "", label);
  caption.htmlFor = id;
  const input = element(type === "textarea" ? "textarea" : "input");
  input.id = id;
  input.dataset.field = key;
  input.name = id;
  if (type !== "textarea") input.type = type;
  else input.rows = 4;
  input.value = value;
  if (key === "end") {
    input.setAttribute("aria-describedby", `${id}-hint`);
    const hint = element("span", "field-hint", "진행 중이라면 비워두세요.");
    hint.id = `${id}-hint`;
    wrapper.append(caption, input, hint);
  } else wrapper.append(caption, input);
  return wrapper;
}
function renderEntries(kind) {
  const list = document.querySelector(`#${kind}-list`);
  list.replaceChildren();
  const isWork = kind === "experience";
  state[kind].forEach((item, index) => {
    const entry = element("div", "repeat-entry");
    entry.dataset.kind = kind;
    entry.dataset.index = index;
    const heading = element("div", "entry-heading");
    const remove = element("button", "button button-remove", "삭제");
    remove.type = "button";
    remove.dataset.remove = kind;
    remove.setAttribute("aria-label", `${isWork ? "경력" : "학력"} ${index + 1} 삭제`);
    heading.append(element("h3", "", `${isWork ? "경력" : "학력"} ${String(index + 1).padStart(2, "0")}`), remove);
    const grid = element("div", "form-grid");
    grid.append(
      field(isWork ? "회사명" : "학교명", isWork ? "company" : "school", isWork ? item.company : item.school),
      field(isWork ? "직무 / 직책" : "전공 / 학위", isWork ? "role" : "major", isWork ? item.role : item.major),
      field("시작일", "start", item.start, "month"),
      field("종료일", "end", item.end, "month"),
    );
    if (isWork) grid.append(field("주요 업무 및 성과", "description", item.description, "textarea", true));
    entry.append(heading, grid);
    list.append(entry);
  });
  document.querySelector(`#${kind}-count`).textContent = state[kind].length;
}
function dateLabel(value) { return /^\d{4}-\d{2}$/.test(value) ? value.replace("-", ".") : value; }
function addSection(title) {
  const section = element("section", "resume-section");
  section.append(element("h3", "", title));
  preview.append(section);
  return section;
}
function fitPreview() {
  const canvas = document.querySelector(".preview-canvas");
  if (!canvas.clientWidth) return;
  const styles = getComputedStyle(canvas);
  const width = canvas.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
  const scale = Math.min(1, width / 794);
  preview.style.transform = `scale(${scale})`;
  const fit = document.querySelector("#preview-fit");
  fit.style.width = `${794 * scale}px`;
  fit.style.height = `${preview.offsetHeight * scale}px`;
}
function renderPreview() {
  preview.replaceChildren(element("div", "resume-accent"));
  preview.append(element("h2", "resume-name", state.fullName || "이름을 입력해 주세요"));
  if (state.jobTitle) preview.append(element("p", "resume-role", state.jobTitle));
  const contact = element("div", "resume-contact");
  [state.email, state.phone, state.location].filter(Boolean).forEach(value => contact.append(element("span", "", value)));
  preview.append(contact);
  if (state.summary.trim()) addSection("PROFILE · 소개").append(element("p", "", state.summary));
  ["experience", "education"].forEach(kind => {
    const isWork = kind === "experience";
    const items = state[kind].filter(item => Object.values(item).some(value => value.trim()));
    if (!items.length) return;
    const section = addSection(isWork ? "EXPERIENCE · 경력" : "EDUCATION · 학력");
    items.forEach(item => {
      const entry = element("div", "resume-entry");
      const top = element("div", "resume-entry-top");
      const dates = item.start || item.end ? `${dateLabel(item.start)} — ${item.end ? dateLabel(item.end) : isWork ? "현재" : "재학 중"}` : "";
      top.append(element("h4", "", isWork ? item.company : item.school), element("span", "resume-date", dates));
      entry.append(top, element("div", "resume-subtitle", isWork ? item.role : item.major));
      if (isWork && item.description) entry.append(element("p", "", item.description));
      section.append(entry);
    });
  });
  const skills = state.skillList.split(",").map(value => value.trim()).filter(Boolean);
  if (skills.length) {
    const tags = element("div", "resume-skills");
    skills.forEach(skill => tags.append(element("span", "", skill)));
    addSection("SKILLS · 스킬").append(tags);
  }
  const criteria = [state.fullName, state.jobTitle, state.email, state.summary, state.experience.some(item => item.company && item.role), state.education.some(item => item.school), state.skillList];
  const progress = Math.round(criteria.filter(value => typeof value === "string" ? value.trim() : value).length / criteria.length * 100);
  document.querySelector("#progress-label").textContent = `${progress}%`;
  document.querySelector("#progress").setAttribute("aria-valuenow", progress);
  document.querySelector("#progress > span").style.width = `${progress}%`;
  document.querySelector("#summary-count").textContent = `${state.summary.length} / 600`;
  fitPreview();
}
for (const input of form.querySelectorAll("input[name], textarea[name]")) input.value = state[input.name] || "";
renderEntries("experience");
renderEntries("education");
renderPreview();
form.addEventListener("submit", event => event.preventDefault());
form.addEventListener("input", event => {
  const input = event.target;
  const entry = input.closest(".repeat-entry");
  if (entry) state[entry.dataset.kind][Number(entry.dataset.index)][input.dataset.field] = input.value;
  else if (Object.hasOwn(state, input.name)) state[input.name] = input.value;
  renderPreview();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => save(), 500);
});
form.addEventListener("click", event => {
  const add = event.target.closest("[data-add]");
  const remove = event.target.closest("[data-remove]");
  if (!add && !remove) return;
  const kind = add ? add.dataset.add : remove.dataset.remove;
  let focusIndex;
  if (add) {
    state[kind].push(Object.fromEntries(Object.keys(example[kind][0]).map(key => [key, ""])));
    focusIndex = state[kind].length - 1;
  } else {
    const index = Number(remove.closest(".repeat-entry").dataset.index);
    state[kind].splice(index, 1);
    focusIndex = Math.min(index, state[kind].length - 1);
  }
  renderEntries(kind);
  renderPreview();
  save();
  const target = document.querySelector(`#${kind}-list .repeat-entry[data-index="${focusIndex}"] input`) || document.querySelector(`[data-add="${kind}"]`);
  target.focus();
  notify(`${kind === "experience" ? "경력" : "학력"} 항목을 ${add ? "추가" : "삭제"}했어요.`);
});
document.querySelector("#save-button").addEventListener("click", () => save(true));
document.querySelector("#download-button").addEventListener("click", () => { save(); window.print(); });
function setPreviewOpen(open) {
  document.body.classList.toggle("preview-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.textContent = open ? "입력으로 돌아가기 ↙" : "미리보기 열기 ↗";
  if (matchMedia("(max-width: 800px)").matches) {
    document.querySelector("#editor-panel").inert = open;
    document.querySelector("#preview-panel").inert = !open;
  }
  fitPreview();
}
toggle.addEventListener("click", () => setPreviewOpen(!document.body.classList.contains("preview-open")));
document.addEventListener("keydown", event => { if (event.key === "Escape" && document.body.classList.contains("preview-open")) { setPreviewOpen(false); toggle.focus(); } });
const mobile = matchMedia("(max-width: 800px)");
function syncLayout() {
  if (!mobile.matches) {
    setPreviewOpen(false);
    document.querySelector("#editor-panel").inert = false;
    document.querySelector("#preview-panel").inert = false;
  } else setPreviewOpen(document.body.classList.contains("preview-open"));
}
mobile.addEventListener("change", syncLayout);
syncLayout();
new ResizeObserver(fitPreview).observe(document.querySelector(".preview-canvas"));
new ResizeObserver(fitPreview).observe(preview);
document.fonts.ready.then(fitPreview);
// Save any final keystroke even when navigation happens before the debounce fires.
window.addEventListener("pagehide", () => save());
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") save(); });
const navLinks = [...document.querySelectorAll(".section-nav a")];
const sections = [...form.querySelectorAll(".card")];
let scrollPending = false;
window.addEventListener("scroll", () => {
  if (scrollPending) return;
  scrollPending = true;
  requestAnimationFrame(() => {
    const threshold = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) + 100;
    const current = sections.filter(section => section.getBoundingClientRect().top <= threshold).at(-1) || sections[0];
    navLinks.forEach(link => {
      const active = link.hash === `#${current.id}`;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current");
    });
    scrollPending = false;
  });
}, { passive: true });
navLinks[0].setAttribute("aria-current", "location");
if (storageFailed) notify("저장된 내용을 읽지 못했어요. 예시로 시작합니다. PDF로 내용을 보관해 주세요.");
