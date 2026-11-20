export default {
  selector: '書類・テンプレート', hint: '書き方のヒント', example: '記入例', apply: '例文を入力する',
  fictional: '架空の例文です。ご自身の事実に合わせて修正してください。',
  replace: '現在の文章を例文に置き換えます。よろしいですか？',
  templateNote: '入力内容を引き継いで書式を切り替えられます。',
  reference: '厚生労働省の履歴書様式をもとにしたA4・2ページの固定書式です。写真・ふりがな・学歴・職歴・免許資格などを記入できます。',
  descriptions: { modern: 'A4のモダンなレイアウト', rirekisho: '厚生労働省様式 · A4・2ページの固定書式', 'work-history': '職務要約・プロジェクト・技術スタック' },
  fields: { postalCode: '郵便番号', contactPostalCode: '連絡先の郵便番号', age: '満年齢', gender: '性別（任意）', contactAddress: '連絡先（現住所以外を希望する場合）', contactFurigana: '連絡先のふりがな', contactPhone: '連絡先の電話', contactEmail: '連絡先のE-mail', projectName: 'プロジェクト名', projectPeriod: 'プロジェクト期間', projectRole: '担当・チーム体制', projectStack: '技術スタック', projectResult: '課題・取り組み・成果', projects: 'プロジェクト', },
  addProject: 'プロジェクトを追加',
  states: { local: 'この端末に保存しています。クラウドには未保存です。', pending: '変更あり · 入力が止まって2秒後にクラウドへ保存します…', saving: 'クラウドに保存中…', saved: 'すべての変更をクラウドに保存しました', choice: 'クラウドの下書きを確認し、読み込みか置き換えを選んでください。', error: 'クラウド保存に失敗しました。端末の下書きを確認し、再試行してください。', conflict: '別の端末で更新されています。保存内容を確認してください。', loading: 'クラウドを確認しています…', empty: 'クラウドは未保存です。保存を選ぶと自動同期を開始します。', backupError: 'バックアップを作成できませんでした。', },
  justNow: 'たった今', minutesAgo: '{count}分前', retry: '再試行',
  privacy: 'クラウド保存はログイン後に利用でき、利用者ごとのアクセス制御を行います。本人の同意なく応募先企業へ自動提供しません。ゲストの下書きはこのブラウザに保存されます。',
  privacyLink: 'プライバシーポリシー',
};
