// The supplied MHLW form remains the standard. Purpose-specific forms adapt
// the writing boxes, while retaining Japanese chronological history and photos.
export const japaneseTemplates = [
  { id: 'rirekisho', category: 'career', name: '一般・転職用', tag: '厚生労働省様式', description: '学歴・職歴・資格を正確に。厚生労働省の様式を使う基本の履歴書。', audience: '就職・転職を考えている方', writingFields: [], preferenceFields: [], prHeading: '志望の動機、特技、自己PR、アピールポイントなど', preferencesHeading: '本人希望記入欄（特に給料、職種、勤務時間、勤務地、その他についての希望などがあれば記入）' },
  { id: 'rirekisho-graduate', category: 'graduate', name: '新卒・インターン用', tag: '学業・ガクチカ', description: '学業・ゼミ・研究内容と、学生時代に力を入れたことを整理する新卒向けの書式。', audience: '学生・卒業予定の方', writingFields: ['academicWork', 'studentActivities'], preferenceFields: [], prHeading: '志望動機・自己PR・学業・学生時代の取り組み', preferencesHeading: '本人希望記入欄（希望職種・入社可能時期など）' },
  { id: 'rirekisho-part-time', category: 'part-time', name: 'アルバイト・パート用', tag: '勤務条件を明確に', description: '勤務できる曜日・時間帯・開始日を、志望動機と一緒に伝えられる書式。', audience: 'アルバイト・パートに応募する方', writingFields: [], preferenceFields: ['workDays', 'workHours', 'availableFrom'], prHeading: '志望動機・自己PR', preferencesHeading: '勤務可能な曜日・時間帯・開始日／本人希望' },
  { id: 'rirekisho-return', category: 'return', name: '再就職・ブランクのある方向け', tag: '経験とこれから', description: 'これまでの強みと、再就職に向けた学び・取り組みを中心にまとめる書式。', audience: '仕事への復帰を考えている方', writingFields: ['returnPreparation'], preferenceFields: ['workDays', 'workHours', 'availableFrom'], prHeading: '志望動機・自己PR・再就職に向けた取り組み', preferencesHeading: '勤務条件・入社可能時期／本人希望' },
  { id: 'work-history', category: 'history', name: '職務経歴書', tag: '経験・実績を詳しく', description: '会社ごとの担当業務・実績・プロジェクト・技術を伝える、履歴書と併用する書類。', audience: '職務経験を詳しく伝えたい方', writingFields: [], preferenceFields: [] },
];
export const japaneseTemplateIds = japaneseTemplates.map(template => template.id);
export const japaneseTemplate = id => japaneseTemplates.find(template => template.id === id);
export const isRirekishoTemplate = id => id === 'rirekisho' || ['rirekisho-graduate', 'rirekisho-part-time', 'rirekisho-return'].includes(id);
export const applicantFieldLabels = {
  academicWork: '学業・ゼミ・研究内容', studentActivities: '学生時代に力を入れたこと',
  workDays: '勤務可能な曜日', workHours: '勤務可能な時間帯', availableFrom: '勤務・入社可能日',
  returnPreparation: '再就職に向けた学び・取り組み',
};
export const japaneseCategories = [
  ['all', 'すべて'], ['career', '一般・転職'], ['graduate', '新卒・インターン'],
  ['part-time', 'アルバイト・パート'], ['return', '再就職'], ['history', '職務経歴書'],
];
