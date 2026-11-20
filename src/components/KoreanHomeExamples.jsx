import React from 'react';
import { ArrowRight } from 'lucide-react';
import { koreanExamples } from '../lib/korean-examples';

// Native radios keep the prerendered landing usable without JavaScript.
export default function KoreanHomeExamples() {
  return <section className="ko-examples section-container" id="examples"><div className="ko-section-title"><span className="overline">막막할 땐, 경험을 풀어 쓰는 방법부터</span><h2>직무에 맞는 작성 예시를 살펴보세요.</h2><p>모던·스탠더드 이력서와 경력기술서에 담을 내용을 예시로 시작하세요.</p></div>
    <fieldset className="ko-example-tabs"><legend className="sr-only">작성 예시 직무 선택</legend>{Object.entries(koreanExamples).map(([key, item], index) => <React.Fragment key={key}><input className="ko-example-radio" type="radio" name="home-example" id={`example-${key}`} value={key} defaultChecked={index === 0} /><label htmlFor={`example-${key}`}>{item.label}</label><article className="ko-example-panel"><div><small>{item.label} 작성 포인트</small><h3>{item.focus}</h3><p>{item.summary}</p><a href={`/ko/app/?template=modern&example=${key}`}>이 직무 예시로 작성 시작<ArrowRight size={16} /></a></div><div className="ko-example-note"><span>프로젝트·주요 활동 예시</span><h4>{item.project.projectName}</h4><small>{item.project.projectRole}</small><p>{item.project.projectResult}</p></div></article></React.Fragment>)}</fieldset>
    <p className="ko-format-note">자체 작성한 가상 사례이며 합격을 보장하는 예시가 아닙니다. 편집기에서 예시 불러오기를 선택한 뒤 본인의 경험으로 바꿔 주세요.</p>
  </section>;
}
