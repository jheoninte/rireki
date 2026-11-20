const student = {
  name: '佐藤 葵', english: 'さとう あおい', age: '21', birth: '2005年5月10日',
  education: [{ period: '2024年4月', school: 'サンプル大学', major: '経済学部 入学' }, { period: '2028年3月', school: 'サンプル大学', major: '経済学部 卒業見込み' }],
  careers: [{ period: '', company: 'なし', position: '', role: '' }],
  academicWork: 'ゼミで地域の商店街を研究し、調査結果を発表しました。',
  studentActivities: '学園祭の運営で担当者の意見を整理し、準備の手順を改善しました。',
  intro: '相手の話を聞き、チームで行動することが強みです。',
  motivation: '地域のお客様に寄り添う姿勢に共感しました。学んだことを活かし貢献したいと考えています。',
  qualifications: '2025年6月 日商簿記検定試験2級 合格', preferences: '2028年4月入社を希望します。',
};
export default {
  'rirekisho-graduate': student,
  'rirekisho-part-time': { ...student, motivation: '丁寧な接客を学び、お客様に気持ちよく利用していただける仕事をしたいと考え応募しました。', intro: '時間を守り、周囲と協力して取り組むことを大切にしています。', workDays: '月・水・金曜日、週3日', workHours: '17時〜21時', availableFrom: '採用決定から2週間後', preferences: '試験期間は事前にご相談させてください。' },
  'rirekisho-return': { returnPreparation: '表計算ソフトの講座を受講し、関数と資料作成の操作を復習しました。', intro: '事務職で培った正確な入力と、丁寧な確認が強みです。', motivation: 'これまでの経験を活かし、周囲と協力しながら業務を支えたいと考えています。', workDays: '月曜日〜金曜日', workHours: '9時〜16時', availableFrom: '入社日はご相談可能です。', preferences: '貴社の規定に従います。' },
};
