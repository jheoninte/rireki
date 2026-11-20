import { japaneseAddress } from './japanese-personal';
// Construct Word content from the same document intent as the rendered templates.
// Tables are native Word tables, so Japanese application documents stay editable.
export function documentContent(docx, data, copy, variant, photo, para, locale = 'ja') {
  const { Paragraph, HeadingLevel, Table, TableRow, TableCell, WidthType } = docx;
  const d = data, f = copy.fields;
  const safePortfolio = /^https:\/\//i.test(d.portfolio || '') ? d.portfolio : '';
  const section = (title, text) => [para(title, true), para(text)];
  const contacts = keys => keys.map(key => para(`${f[key]}：${locale === 'ja' && key === 'address' ? japaneseAddress(d.address, d.postalCode) : d[key] || ''}`));
  const experience = () => d.careers.flatMap(x => [para(`${x.period}　${x.company}${x.position ? `　${x.position}` : ''}`, true), para(x.role)]);
  const education = () => d.education.flatMap(x => [para(`${x.period}　${x.school}`), para(x.major)]);
  const portfolio = () => safePortfolio ? section(variant === 'designer' ? copy.documents.selectedPortfolio : f.portfolio, safePortfolio) : [];
  const title = text => new Paragraph({ text, heading: HeadingLevel.TITLE });
  const table = rows => new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(cells => new TableRow({ cantSplit: true, children: cells.map(cell => new TableCell({ children: Array.isArray(cell) ? cell : [para(cell)] })) })),
  });
  const date = d.documentDate ? [para(`${d.documentDate} 現在`)] : [];
  if (locale === 'ko' && variant === 'career-description') {
    const careers = d.careers.filter(row => Object.values(row).some(value => value?.trim()));
    const projects = (d.projects || []).filter(row => Object.values(row).some(value => value?.trim()));
    return [title('경력기술서'), para(d.name), ...(d.title ? [para(d.title)] : []),
      ...contacts(['email', 'phone'].filter(key => d[key])), ...(d.documentDate ? [para(`${f.documentDate}: ${d.documentDate}`)] : []), ...portfolio(),
      ...(d.summary?.trim() ? section('경력 요약', d.summary) : []),
      ...(d.skills?.trim() ? section('핵심 역량·활용 도구', d.skills) : []),
      ...(careers.length ? [para('회사별 경력', true), ...careers.flatMap(row => [para([row.company, row.position].filter(Boolean).join(' · '), true), para(row.period), ...(row.role ? section('담당 업무·주요 성과', row.role) : [])])] : []),
      ...(projects.length ? [para('주요 프로젝트·성과', true), ...projects.flatMap(row => [para(row.projectName, true), para(row.projectPeriod), ...((row.projectRole || row.projectStack) ? [table([...(row.projectRole ? [['역할·팀 구성', row.projectRole]] : []), ...(row.projectStack ? [['사용 기술·도구', row.projectStack]] : [])])] : []), ...(row.projectResult ? section('문제·수행 내용·성과', row.projectResult) : [])])] : []),
      ...(d.qualifications?.trim() ? section('관련 자격·어학', d.qualifications) : [])];
  }
  if (locale === 'ko') {
    const projects = (d.projects || []).filter(row => Object.values(row).some(Boolean));
    const contactsKo = ['email', 'phone', 'address', 'birth'].filter(key => d[key]);
    const personal = [title(variant === 'modern' ? d.name : copy.resume.heading), ...photo,
      ...(variant === 'classic' ? [table([[f.name, d.name], ...contactsKo.map(key => [f[key], d[key]])]), para(d.title)] : [para(d.title), ...contacts(contactsKo)]),
      ...(d.english ? [para(`${f.english}: ${d.english}`)] : []),
      ...(d.documentDate ? [para(`${f.documentDate}: ${d.documentDate}`)] : []), ...portfolio()];
    const career = d.careers.filter(row => Object.values(row).some(Boolean));
    const schools = d.education.filter(row => Object.values(row).some(Boolean));
    return [...personal, ...(d.summary ? section(f.summary, d.summary) : []),
      ...(career.length ? [para(f.careers, true), ...career.flatMap(row => [para(`${row.company} · ${row.position || ''}`, true), para(row.period), para(row.role)])] : []),
      ...(projects.length ? [para(copy.builderFeatures.fields.projects, true), ...projects.flatMap(row => [para(row.projectName, true), para(`${row.projectPeriod} · ${row.projectRole}`), para(`${copy.builderFeatures.fields.projectStack}: ${row.projectStack}`), para(row.projectResult)])] : []),
      ...(schools.length ? [para(f.education, true), ...schools.flatMap(row => [para(`${row.school} · ${row.major}`), para(row.period)])] : []),
      ...['skills', 'qualifications', 'intro', 'motivation', 'preferences'].filter(key => d[key]).flatMap(key => section(f[key], d[key]))];
  }
  if (variant === 'rirekisho') return [
    title('履歴書'), ...date,
    table([[`${f.english}：${d.english}`, photo.length ? photo : [para(`${copy.resume.photo}（縦4cm × 横3cm）`)]], [`${f.name}：${d.name}`, `${f.birth}：${d.birth}`]]),
    ...contacts(['addressFurigana', 'address', 'phone', 'email']),
    table([
      ['年月・期間', '学歴・職歴'], ['', f.education],
      ...d.education.map(x => [x.period, `${x.school}　${x.major}`]),
      ['', f.careers], ...d.careers.map(x => [x.period, `${x.company}　${x.position}`]),
    ]),
    ...['qualifications', 'motivation', 'intro', 'preferences'].map(key => table([[f[key]], [d[key] || '　']])),
  ];
  if (variant === 'work-history') return [
    title('職務経歴書'), ...date, para(d.name), ...contacts(['email', 'phone', 'address']),
    ...section(f.summary, d.summary), para(copy.documents.detailedHistory, true), ...experience(),
    ...(d.projects || []).filter(row => Object.values(row).some(Boolean)).flatMap(row => [para(row.projectName, true), para(`${row.projectPeriod}　${row.projectRole}`), table([[copy.builderFeatures.fields.projectStack, row.projectStack]]), para(row.projectResult)]),
    ...section(copy.documents.applicableSkills, d.skills),
    ...(d.qualifications ? section(f.qualifications, d.qualifications) : []), ...portfolio(),
    ...section(f.intro, d.intro), ...(d.motivation ? section(f.motivation, d.motivation) : []), para('以上'),
  ];
  const identity = [title(d.name), para(d.title), ...contacts(['email', 'phone', 'address'])];
  if (variant === 'developer') return [
    ...identity, ...portfolio(),
    table([[ [...section(copy.documents.technicalSkills, d.skills), para(f.education, true), ...education(), ...section(f.qualifications, d.qualifications)],
      [...section(f.summary, d.summary), ...section(f.intro, d.intro), para(f.careers, true), ...experience(), ...section(f.motivation, d.motivation)] ]]),
  ];
  if (variant === 'designer') return [
    ...identity, ...portfolio(), ...section(f.intro, d.intro), para(f.careers, true), ...experience(),
    table([[section(copy.documents.designTools, d.skills), [para(f.education, true), ...education()]]]),
    ...section(f.qualifications, d.qualifications), ...section(f.summary, d.summary), ...section(f.motivation, d.motivation),
  ];
  return [title(copy.resume.heading), ...(variant === 'ats' ? [] : photo), para(`${d.name}　${d.english}`), para(d.title), ...portfolio(),
    ...contacts(['birth', 'phone', 'email', 'address']), para(f.education, true), ...education(), para(f.careers, true), ...experience(),
    ...['skills', 'qualifications', 'summary', 'intro', 'motivation', 'preferences'].filter(key => d[key]).flatMap(key => section(f[key], d[key])),
  ];
}
