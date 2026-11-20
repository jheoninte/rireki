export const emptyResume = () => ({
  name: "",
  english: "",
  birth: "",
  phone: "",
  email: "",
  address: "",
  postalCode: "",
  title: "",
  photo: "",
  accent: "",
  paperSize: "",
  targetDescription: "",
  portfolio: "",
  addressFurigana: "",
  documentDate: "",
  age: "",
  gender: "",
  contactAddress: "",
  contactPostalCode: "",
  contactFurigana: "",
  contactPhone: "",
  contactEmail: "",
  projects: [{ projectName: "", projectPeriod: "", projectRole: "", projectStack: "", projectResult: "" }],
  qualifications: "",
  preferences: "",
  summary: "",
  academicWork: "",
  studentActivities: "",
  workDays: "",
  workHours: "",
  availableFrom: "",
  returnPreparation: "",
  education: [{ period: "", school: "", major: "" }],
  careers: [{ period: "", company: "", position: "", role: "" }],
  skills: "",
  intro: "",
  motivation: "",
});

export function sanitizeResume(saved) {
  const result = emptyResume();
  if (!saved || typeof saved !== "object") return result;
  for (const key of Object.keys(result)) {
    if (Array.isArray(result[key])) {
      const keys = Object.keys(result[key][0]);
      if (Array.isArray(saved[key]))
        result[key] = saved[key]
          .filter((x) => x && typeof x === "object")
          .map((x) =>
            Object.fromEntries(
              keys.map((k) => [k, typeof x[k] === "string" ? x[k] : ""]),
            ),
          );
    } else if (typeof saved[key] === "string") {
      // Preserve existing/legacy text verbatim; editor limits apply to new input.
      result[key] = saved[key];
    }
  }
  if (!/^data:image\/(jpeg|png);base64,/.test(result.photo)) result.photo = "";
  if (!['', 'blue', 'navy', 'slate'].includes(result.accent)) result.accent = '';
  if (!['', 'letter', 'a4'].includes(result.paperSize)) result.paperSize = '';
  return result;
}
