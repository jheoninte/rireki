import React from 'react';
import { CheckCircle2, CircleAlert } from 'lucide-react';
import { koreanAccents, koreanExamples } from '../lib/korean-examples';
import { reviewKoreanResume } from '../lib/korean-review';

export function KoreanExamplePicker({ job, setJob, onApply }) {
  const example = koreanExamples[job];
  return <section className="ko-example-picker" aria-label="직무별 작성 예시">
    <label className="field">작성 예시 직무<select value={job} onChange={event => setJob(event.target.value)}>{Object.entries(koreanExamples).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select></label>
    <p>{example.focus}</p><blockquote>{example.project.projectResult}</blockquote>
    <button className="btn btn-secondary" type="button" onClick={onApply}>{example.label} 예시 불러오기</button>
    <small>자체 작성한 가상 사례입니다. 불러온 뒤 본인의 실제 경험으로 수정하세요. 서식은 바뀌지 않습니다.</small>
  </section>;
}

export function KoreanFinishTools({ data, variant, update, goSection }) {
  const checks = reviewKoreanResume(data, variant);
  return <>
    <fieldset className="ko-accent-picker"><legend>문서 강조색</legend><div>{koreanAccents.map(item => <label key={item.key} style={{ '--swatch': item.color }}><input type="radio" name="document-accent" value={item.key} checked={(data.accent || 'blue') === item.key} onChange={() => update('accent', item.key)} /><i />{item.label}</label>)}</div><small>미리보기와 PDF·Word의 제목 색상에 반영됩니다.</small></fieldset>
    <section className="ko-review" aria-label="제출 전 자동 점검"><h3>제출 전 자동 점검 <span>{checks.filter(check => check.ok).length}/{checks.length}</span></h3><p>입력 여부와 형식을 확인합니다. 사실관계·채용 공고 기준은 직접 검토해 주세요.</p><ul>{checks.map(check => <li key={check.id} data-ok={check.ok}>{check.ok ? <CheckCircle2 size={16} /> : <CircleAlert size={16} />}<span>{check.label}</span><button type="button" onClick={() => goSection(check.section)}>{check.ok ? '검토' : '수정'}</button></li>)}</ul></section>
  </>;
}
