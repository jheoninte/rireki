export const bulletLines = value => String(value || '').split('\n').map(line => line.replace(/^\s*(?:[•●▪*-]|\d+[.)])\s+/, '').trim()).filter(Boolean);
export const actionVerbs = ['Achieved', 'Analyzed', 'Automated', 'Built', 'Collaborated', 'Coordinated', 'Created', 'Delivered', 'Designed', 'Developed', 'Drove', 'Established', 'Evaluated', 'Expanded', 'Generated', 'Implemented', 'Improved', 'Increased', 'Introduced', 'Launched', 'Mapped', 'Led', 'Managed', 'Mentored', 'Optimized', 'Organized', 'Partnered', 'Planned', 'Produced', 'Reduced', 'Resolved', 'Researched', 'Shipped', 'Simplified', 'Streamlined', 'Supported', 'Tested', 'Trained', 'Validated', 'Wrote', 'Lead', 'Build', 'Design', 'Develop', 'Manage', 'Deliver', 'Improve', 'Support', 'Coordinate', 'Analyze', 'Collaborate', 'Create', 'Implement', 'Optimize', 'Maintain'];
export const startsWithAction = value => actionVerbs.some(verb => value.trim().split(/\s+/)[0]?.replace(/[^a-z]/gi, '').toLowerCase() === verb.toLowerCase());
export const englishSections = { summary: 'Professional Summary', careers: 'Experience', projects: 'Projects', education: 'Education', skills: 'Skills', qualifications: 'Certifications & Languages' };
export const englishEntries = rows => (rows || []).filter(row => Object.values(row).some(value => value?.trim()));
export function englishChecks(data) {
  const bullets = [...englishEntries(data.careers).flatMap(row => bulletLines(row.role)), ...englishEntries(data.projects).flatMap(row => bulletLines(row.projectResult))];
  const words = (data.summary || '').trim().split(/\s+/).filter(Boolean).length;
  return [
    { label: 'Add your name and target role', ok: Boolean(data.name.trim() && data.title.trim()), section: 'personal' },
    { label: 'Check your contact email', ok: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()), section: 'personal' },
    { label: 'Write a focused summary (about 45–85 words)', ok: words >= 45 && words <= 85, section: 'personal' },
    { label: 'Include experience or project achievement bullets', ok: bullets.length > 0, section: 'experience' },
    { label: 'Start each achievement with an action verb', ok: bullets.length > 0 && bullets.every(startsWithAction), section: 'experience' },
    { label: 'Add relevant skills', ok: Boolean(data.skills.trim()), section: 'skills' },
    { label: 'Replace fictional contact details and examples', ok: !/example\.com|Alex Morgan|Northstar Labs|Example University/.test([data.name, data.email, data.portfolio, ...englishEntries(data.careers).map(row => row.company), ...englishEntries(data.education).map(row => row.school)].join(' ')), section: 'personal' },
  ];
}
export function keywordReview(data) {
  const stop = new Set('about after again also among and are around because been before being between both can candidate candidates company could each employer experience for from have has hiring into its job join looking more must new not our position preferred required requirements responsibilities role should skills team than that the their them then there these they this those through time use using was were what when where which who will with work working would years your you'.split(' '));
  const terms = [...new Set((data.targetDescription || '').toLowerCase().match(/[a-z][a-z0-9+#.-]{2,}/g) || [])].filter(word => !stop.has(word)).slice(0, 30);
  const content = [data.summary, data.skills, ...englishEntries(data.careers).flatMap(row => [row.position, row.role]), ...englishEntries(data.projects).flatMap(row => [row.projectStack, row.projectResult])].join(' ').toLowerCase();
  return { found: terms.filter(word => content.includes(word)), missing: terms.filter(word => !content.includes(word)) };
}
