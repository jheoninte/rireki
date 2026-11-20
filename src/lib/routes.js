export function isLegacyEditorPath(path) {
  return /^\/templates\/resume-builder(?:\/index\.html)?\/?$/.test(path);
}
