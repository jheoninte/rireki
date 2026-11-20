import React from 'react';
import Portrait from './PassportPortrait';
import { historyRows, qualificationRows, rirekishoPR, rirekishoPreferences } from '../../lib/rirekisho-format';
import { japaneseTemplate } from '../../lib/japanese-templates';
import { japaneseAddress } from '../../lib/japanese-personal';

function HistoryTable({ rows, count, title }) {
  const filled = Array.from({ length: Math.max(count, rows.length) }, (_, i) => rows[i] || {});
  return <table className="mhlw-history"><colgroup><col style={{ width: '10%' }} /><col style={{ width: '7%' }} /><col /></colgroup><thead><tr><th>年</th><th>月</th><th>{title}</th></tr></thead><tbody>{filled.map((row, i) => <tr key={i}><td>{row.year || '　'}</td><td>{row.month}</td><td>{row.text}</td></tr>)}</tbody></table>;
}
export default function RirekishoResume({ data: d, copy, id, example = false, variant = 'rirekisho' }) {
  const rows = historyRows(d);
  const layout = japaneseTemplate(variant);
  const contact = (alternate = false) => <div className="mhlw-address"><div><small>ふりがな</small><span>{alternate ? d.contactFurigana : d.addressFurigana}</span><small>{alternate ? '連絡先' : '現住所'}</small><p>{japaneseAddress(alternate ? d.contactAddress : d.address, alternate ? d.contactPostalCode : d.postalCode) || '〒'}</p>{alternate && <small>（現住所以外に連絡を希望する場合のみ記入）</small>}</div><div><small>電話</small><p>{alternate ? d.contactPhone : d.phone}</p><small>E-mail</small><p>{alternate ? d.contactEmail : d.email}</p></div></div>;
  return <article id={id} className="resume-paper mhlw-document rirekisho-document">
    <section className="mhlw-page" data-export-page>
      <div className="mhlw-heading"><h3>履 歴 書</h3><span>{d.documentDate || '年　　月　　日'} 現在</span></div>
      <div className="mhlw-identity"><div className="mhlw-name"><small>ふりがな</small><p>{d.english}</p><small>氏名</small><strong>{d.name || copy.resume.emptyName}</strong><div className="mhlw-birth"><span>{d.birth || '年　　月　　日'}生 （満 {d.age || '　'} 歳）</span><span>※性別<br />{d.gender}</span></div></div><div className="rirekisho-photo">{d.photo ? <img src={d.photo} alt={copy.resume.photo} /> : example ? <Portrait /> : <><span>写真を貼る位置</span><small>写真が必要な場合<br />縦36〜40mm<br />横24〜30mm<br />本人単身 胸から上</small></>}</div></div>
      {contact()}{contact(true)}
      <HistoryTable rows={rows.slice(0, 15)} count={15} title="学歴・職歴（各別にまとめて書く）" />
      <small>※「性別」欄：記載は任意です。未記載とすることも可能です。</small>
    </section>
    <section className="mhlw-page" data-export-page>
      <HistoryTable rows={rows.slice(15)} count={7} title="学歴・職歴（各別にまとめて書く）" />
      <HistoryTable rows={qualificationRows(d)} count={6} title="免許・資格" />
      <section className="mhlw-box"><h4>{layout.prHeading}</h4><p>{rirekishoPR(d, variant)}</p></section>
      <section className="mhlw-box mhlw-preferences"><h4>{layout.preferencesHeading}</h4><p>{rirekishoPreferences(d, variant)}</p></section>
    </section>
  </article>;
}
