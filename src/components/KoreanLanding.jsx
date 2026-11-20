import React from 'react';
import { ArrowRight, ArrowUpRight, CheckCircle2, FileText, ImagePlus, ShieldCheck } from 'lucide-react';
import { useI18n } from '../i18n';
import Resume from './Resume';
import { Logo } from './ui';
import KoreanHomeExamples from './KoreanHomeExamples';
import { resumeMarket } from '../lib/resume-markets';

export default function KoreanLanding({ setPreview }) {
  const { copy } = useI18n();
  return <main className="korean-landing">
    <section className="ko-hero"><div className="ko-hero-inner"><div className="ko-hero-copy"><span className="ko-eyebrow">한국 기업 지원을 위한 이력서</span><h1>바로 이력서</h1><h2 className="ko-hero-tagline">쌓아온 경험이,<br />다음 기회가 되도록.</h2><p>모던·스탠더드 이력서와 경력기술서에 경험을 담아 보세요.<br />직무별 예시부터 제출 전 점검까지 한곳에서.</p><div className="ko-hero-checks">{['가입 없이 작성', '한국어 작성 가이드', 'PDF·Word 저장'].map(text => <span key={text}><CheckCircle2 size={15} />{text}</span>)}</div><a className="btn btn-primary ko-start" href="/ko/app/?template=modern">모던으로 작성 시작<ArrowRight size={18} /></a><div className="ko-secondary-actions"><a href="#templates">이력서·경력기술서 살펴보기<ArrowRight size={14} /></a><a href="/ko/app/">저장한 이력서 이어 쓰기<ArrowUpRight size={14} /></a></div><small>한국어·일본어 작성 내용은 각각 따로 보관됩니다.</small></div><div className="ko-hero-preview"><div className="ko-preview-bar"><span><FileText size={16} />모던 이력서 미리보기</span><small>A4</small></div><div className="ko-hero-paper" aria-hidden="true" inert><Resume variant="modern" example /></div><p>가상의 작성 예시입니다.</p></div></div></section>
    <section className="ko-templates section-container" id="templates"><div className="ko-section-title"><span className="overline">이력서부터 경력기술서까지</span><h2>내용은 그대로, 표현은 나답게.</h2><p>기본 이력서 두 가지와 상세 경력기술서를 무료로 제공합니다. 문서를 바꿔도 입력 내용은 유지되며, 문서별로 필요한 항목을 보여줍니다.</p></div><div className="ko-template-grid">{resumeMarket('ko').templates.map((variant, index) => <article className={`ko-template-card ${variant}`} key={variant}><div className="ko-template-thumb"><div aria-hidden="true" inert className="ko-template-paper"><Resume variant={variant} example /></div><a className="ko-template-expand" href={`/ko/app/?template=${variant}`} onClick={setPreview ? event => { event.preventDefault(); setPreview(variant); } : undefined} aria-label={`${copy.templates[variant]} 크게 보기`}>크게 보기<ArrowUpRight size={14} /></a></div><div className="ko-template-info"><small>0{index + 1} / A4</small><h3>{copy.templates[variant]}</h3><p>{copy.templates[`${variant}Description`]}</p><a href={`/ko/app/?template=${variant}`}>{variant === 'modern' ? '모던으로 작성' : variant === 'classic' ? '스탠더드로 작성' : '경력기술서 작성'}<ArrowRight size={16} /></a></div></article>)}</div><p className="ko-format-note">모던·스탠더드는 범용 디자인 양식입니다. 기업의 지정 양식이나 블라인드 채용 기준이 있다면 해당 기준을 먼저 따르세요.</p></section>
    <KoreanHomeExamples />
    <section className="ko-how" id="how"><div className="section-container"><div className="ko-section-title"><span className="overline">어디서부터 쓸지 고민된다면</span><h2>한 항목씩, 세 단계로 정리하세요.</h2></div><div className="ko-how-grid">{[
      ['01', '경험부터 입력', '연락처·지원 직무, 학력과 경력을 적으세요. 신입이라면 프로젝트와 주요 활동을 활용할 수 있습니다.', FileText],
      ['02', '가이드로 구체화', '담당 역할·실행 과정·성과를 정리하고, 자기소개와 지원동기를 지원 기업에 맞게 다듬으세요.', CheckCircle2],
      ['03', '검토하고 저장', '문서 강조색을 고르고 연락처·가상 예시를 점검하세요. 미리보기로 확인한 뒤 PDF·Word로 저장할 수 있습니다.', ImagePlus],
    ].map(([number, title, text, Icon]) => <article key={number}><span>{number}<Icon size={20} /></span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
    <section className="ko-check section-container"><ShieldCheck size={23} /><div><h2>채용 공고의 기준을 먼저 확인하세요.</h2><p>사진·생년월일·상세 주소는 선택 항목입니다. 주민등록번호, 가족관계 등 불필요한 민감정보는 입력하지 마세요. 기업별 자기소개서 문항과 분량은 별도로 확인해 주세요.</p></div></section>
    <section className="ko-faq section-container" id="faq"><div className="ko-section-title"><h2>자주 묻는 질문</h2></div>{[
      ['이력서와 경력기술서는 어떻게 다른가요?', '모던·스탠더드 이력서는 학력·경력·자기소개를 함께 보여줍니다. 경력기술서는 사진·학력 대신 경력 요약, 회사별 담당 업무·성과, 프로젝트와 핵심 역량에 집중합니다. 지원처에 따라 두 문서를 함께 제출할 수 있습니다.'],
      ['신입이라 경력이 없어도 쓸 수 있나요?', '비어 있는 경력 항목은 삭제하고, 프로젝트·대외활동·팀 과제 등 본인의 경험을 정리할 수 있습니다.'],
      ['사진과 생년월일은 필수인가요?', '아닙니다. 지원처에서 요구하는 경우에만 입력하세요. 블라인드 채용이라면 공고의 개인정보 기재 기준을 따르세요.'],
      ['다른 국가의 이력서와 작성 내용이 섞이나요?', '한국어와 일본어 초안은 각각 저장됩니다. 국가를 전환해도 다른 국가의 작성 내용을 덮어쓰지 않으며 자동 번역도 하지 않습니다.'],
      ['다른 기기에서도 이어 쓸 수 있나요?', '기본 초안은 현재 브라우저에 저장됩니다. 서버 연결이 완료된 환경에서는 로그인 후 클라우드 저장을 선택하면 다른 기기에서 불러올 수 있습니다.'],
    ].map(([title, text]) => <details key={title}><summary>{title}</summary><p>{text}</p></details>)}</section>
    <section className="ko-bottom-cta"><h2>먼저 이름부터, 가볍게 시작하세요.</h2><p>완벽한 문장이 아니어도 괜찮습니다. 작성하면서 다듬어 보세요.</p><a href="/ko/app/?template=modern" className="btn btn-primary">무료로 이력서 작성<ArrowRight size={17} /></a></section>
    <footer className="ko-footer section-container"><Logo /><p>{copy.footer.description}</p><a href="/ko/privacy.html">개인정보 처리방침</a><small>© {new Date().getFullYear()} {copy.common.brand}</small></footer>
  </main>;
}
