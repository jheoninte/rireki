// Original designs: section order, type, header construction and density vary.
const base = ['summary', 'careers', 'projects', 'education', 'skills', 'qualifications'];
const educationFirst = ['summary', 'education', 'projects', 'careers', 'skills', 'qualifications'];
const skillsFirst = ['summary', 'skills', 'careers', 'projects', 'education', 'qualifications'];
const make = (slug, name, category, frame, font, align, density, order, description) => ({ id: `en-${slug}`, name, category, frame, font, align, density, order, description });
export const englishTemplates = [
  make('clear', 'Clear', 'simple', 'rule', 'sans', 'left', 'regular', base, 'A clear hierarchy and open spacing for everyday applications.'),
  make('heritage', 'Heritage', 'simple', 'double', 'serif', 'center', 'regular', base, 'Centered identity, classic serif type and restrained double rules.'),
  make('campus', 'Campus', 'simple', 'rule', 'serif', 'left', 'regular', educationFirst, 'Education and projects first, designed for early-career candidates.'),
  make('air', 'Air', 'simple', 'none', 'sans', 'left', 'airy', base, 'Generous space and quiet section labels let the writing lead.'),
  make('formal', 'Formal', 'simple', 'double', 'serif', 'left', 'compact', base, 'Traditional typography with a practical, compact chronology.'),
  make('horizon', 'Horizon', 'modern', 'banner', 'sans', 'left', 'regular', base, 'A blue identity band and a confident professional hierarchy.'),
  make('outline', 'Outline', 'modern', 'outline', 'sans', 'left', 'regular', skillsFirst, 'A framed heading with core skills near the top.'),
  make('focus', 'Focus', 'modern', 'side', 'sans', 'left', 'compact', skillsFirst, 'A slim side accent and concise technical skills placement.'),
  make('pathway', 'Pathway', 'modern', 'rule', 'sans', 'center', 'airy', base, 'A centered introduction with an easy-to-follow career timeline.'),
  make('ledger', 'Ledger', 'modern', 'bands', 'sans', 'left', 'regular', base, 'Defined section bands for a neatly organized professional record.'),
  make('studio', 'Studio', 'creative', 'side', 'serif', 'left', 'airy', base, 'Editorial serif headlines and a slim blue accent.'),
  make('editorial', 'Editorial', 'creative', 'none', 'serif', 'left', 'regular', base, 'Large serif identity with understated, widely spaced headings.'),
  make('signal', 'Signal', 'creative', 'banner', 'sans', 'center', 'compact', skillsFirst, 'A centered color band with a skills-first narrative.'),
  make('folio', 'Folio', 'creative', 'outline', 'serif', 'left', 'regular', ['summary', 'projects', 'careers', 'skills', 'education', 'qualifications'], 'Projects take priority, supported by a prominent portfolio link.'),
  make('balance', 'Balance', 'creative', 'bands', 'serif', 'center', 'airy', educationFirst, 'Centered serif type and soft section bands for a measured rhythm.'),
  make('compact', 'Compact', 'compact', 'rule', 'sans', 'left', 'compact', base, 'Tighter spacing for detailed experience without tiny body text.'),
  make('executive', 'Executive', 'compact', 'double', 'serif', 'center', 'compact', skillsFirst, 'A skills-led overview and a dense, traditional leadership layout.'),
  make('precision', 'Precision', 'compact', 'outline', 'sans', 'center', 'compact', educationFirst, 'A compact framed identity with education and projects up front.'),
];
export const englishTemplateIds = englishTemplates.map(template => template.id);
export const englishTemplate = id => englishTemplates.find(template => template.id === id) || englishTemplates[0];
export const englishCategories = { all: 'All templates', simple: 'Simple', modern: 'Modern', creative: 'Creative', compact: 'Compact' };
