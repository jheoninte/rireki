import ja from './ja';

const fields = {
  name: '이름', english: '영문 이름', birth: '생년월일', phone: '연락처', email: '이메일', address: '거주 지역',
  title: '지원 직무·한 줄 소개', education: '학력', careers: '경력', skills: '핵심 역량·활용 도구',
  portfolio: '포트폴리오·GitHub URL', intro: '자기소개·강점', motivation: '지원동기', period: '기간',
  school: '학교명', major: '전공·졸업 구분', company: '회사명', position: '직무·직책', role: '담당 업무·성과',
  summary: '경력 요약', qualifications: '자격증·어학', preferences: '기타 전달사항', documentDate: '작성일',
};
const photo = {
  title: '사진', description: '지원처에서 요구할 때 사진을 추가하세요. 사진 없이도 작성할 수 있습니다.',
  add: '사진 업로드', replace: '사진 변경', loading: '사진을 불러오는 중…', requirements: 'JPG·PNG / 5MB 이하. 3:4 비율로 위치를 조절합니다.',
  local: '사진 자르기는 현재 브라우저에서 처리합니다.', cropTitle: '사진 위치 조절', cropHelp: '사진의 위치와 확대 비율을 조절하세요. 적용 전에는 기존 사진이 바뀌지 않습니다.',
  cropPreview: '잘라낸 사진 미리보기', zoom: '확대', horizontal: '좌우 위치', vertical: '상하 위치', apply: '이 사진 사용',
};
const features = {
  privacyUrl: '/ko/privacy.html',
  selector: '이력서 템플릿', hint: '작성 가이드', example: '작성 예시', apply: '예시 적용하기',
  fictional: '가상의 예시입니다. 본인의 실제 경험과 사실에 맞게 수정하세요.', replace: '작성한 문장을 예시로 바꿀까요?',
  templateNote: '서식을 바꿔도 작성 내용은 유지됩니다.', reference: '',
  descriptions: { modern: '여백과 핵심 내용을 살린 모던 레이아웃', classic: '항목별로 정돈한 스탠더드 레이아웃', 'career-description': '회사별 업무·프로젝트·성과를 상세히 정리하는 경력기술서' },
  fields: { projectName: '프로젝트명', projectPeriod: '프로젝트 기간', projectRole: '담당 역할·팀 구성', projectStack: '사용 기술·도구', projectResult: '문제·수행 내용·성과', projects: '프로젝트·주요 활동' },
  addProject: '프로젝트·활동 추가',
  states: { idle: '브라우저 초안을 사용하고 있습니다.', local: '현재 브라우저에 저장합니다. 클라우드에는 저장되지 않았습니다.', pending: '변경사항 있음 · 입력을 멈추면 2초 후 저장합니다…', saving: '클라우드에 저장 중…', saved: '모든 변경사항을 클라우드에 저장했습니다', choice: '클라우드 초안이 있습니다. 불러오거나 현재 내용으로 저장할 수 있습니다.', error: '클라우드 저장에 실패했습니다. 브라우저 초안은 유지됩니다.', conflict: '다른 기기에서 변경됐습니다. 저장 내용을 다시 확인하세요.', loading: '클라우드 초안을 확인하고 있습니다…', empty: '첫 클라우드 저장 후 자동 저장을 시작합니다.', backupError: '브라우저 백업을 만들지 못했습니다.' },
  justNow: '방금 전', minutesAgo: '{count}분 전', retry: '다시 확인',
  privacy: '초안은 현재 브라우저에 저장됩니다. 로그인 후 선택하면 계정별 접근 제어가 적용된 클라우드에 저장합니다. 동의 없이 지원 기업에 자동 전송하지 않습니다.', privacyLink: '개인정보 처리방침',
};
const workspace = {
  cloudTitle: '초안 저장·복원', progress: '작성 진행률', nudge: '작성 중인 내용을 다른 기기에서도 이어 쓰려면 로그인 후 클라우드 저장을 선택하세요.',
  guestSave: '회원가입 없이 작성할 수 있습니다. 초안은 현재 브라우저에 저장됩니다.', cloudUnavailable: '클라우드 저장은 연결 준비 중입니다. 브라우저 저장은 계속 사용할 수 있습니다.', cloudDate: '클라우드 저장 시각:', cloudStates: features.states,
  load: '클라우드 초안 불러오기', upload: '현재 내용을 클라우드에 저장', refresh: '클라우드 다시 확인', backupNote: '현재 내용을 브라우저에 백업한 뒤 클라우드 초안을 불러옵니다.', overwrite: '클라우드 초안을 현재 내용으로 바꿉니다.', deleteCloud: '클라우드 초안 삭제', deleteNote: '클라우드 초안을 삭제하고 자동 동기화를 멈춥니다. 브라우저 초안은 유지됩니다.',
  importGuest: '이 브라우저의 비회원 초안 가져오기', restoreBackup: '이전 백업 복원', importNote: '현재 내용을 백업한 후 초안을 가져옵니다.', noDraft: '불러올 초안이 없습니다.',
  guide: '직무별 작성 팁', job: '지원 직무', jobs: { general: '일반·사무', developer: '개발·IT', designer: '디자인', marketing: '마케팅' },
  example: '직무별 예시 보기', fictional: features.fictional,
  tips: { default: '지원 공고에서 요구하는 경험부터 구체적으로 적어 보세요.', name: '지원서에 사용할 이름을 입력하세요.', email: '채용 담당자의 연락을 받을 수 있는 이메일을 입력하세요.', skills: '기술·도구와 사용 기간, 실제 활용한 업무를 함께 적으면 좋습니다.', portfolio: '공개 가능한 포트폴리오나 GitHub의 HTTPS 주소를 입력하세요.', role: '문제와 목표 → 본인의 역할 → 실행 → 결과 순서로 적으세요. 수치는 확인 가능한 사실만 사용하세요.', intro: '강점 하나를 고른 뒤 실제 경험과 행동으로 뒷받침하세요.', motivation: '이 기업·직무를 선택한 이유와 기여할 수 있는 점을 연결하세요.' },
  examples: { general: '반복되는 업무의 문제를 발견하고, 정리한 기준과 개선 과정·결과를 설명합니다.', developer: '프로젝트의 문제, 사용 기술, 본인 역할과 검증한 개선 결과를 설명합니다.', designer: '사용자 문제와 조사·설계·검증 과정, 본인 기여를 포트폴리오와 연결합니다.', marketing: '캠페인 목표와 기간, 담당 범위, 비교 기준과 확인 가능한 성과를 정리합니다.' },
  aiTitle: '한국어 AI 코칭 준비 중', aiDescription: '초기 버전에서는 작성 팁과 예시를 이용해 직접 내용을 정리할 수 있습니다.',
  nextTitle: '제출 전에 확인하세요', nextDescription: '기업의 지정 양식과 블라인드 채용 기준이 있다면 먼저 따르세요.',
  jobsLink: '고용24에서 채용정보 찾기', jobsUrl: 'https://www.work24.go.kr/', partnerLink: '커리어 서비스 보기', affiliateDisclosure: '광고·제휴 링크는 별도로 표시합니다.', noSharing: '외부 링크에 이력서나 개인정보를 자동 첨부하지 않습니다.',
  checklist: '제출 전 체크리스트', checks: ['지원 직무와 연락처·오탈자 확인', '실제 경험과 수치인지 확인', '기업별 자기소개서 문항·글자 수 확인', '블라인드 채용에서 요구하지 않는 사진·학교·개인정보 삭제', '요구된 파일 형식과 파일명 확인'],
};
export default {
  ...ja,
  meta: { title: '바로 이력서 | 무료 이력서·경력기술서 작성', description: '한국 기업 지원을 위한 모던·스탠더드 이력서와 경력기술서. 경력·학력·프로젝트·자기소개를 정리하고, 가입 없이 PDF·Word로 저장하세요.' },
  common: { brand: '바로 이력서', tagline: '경험을 정리하고, 다음 기회로.', locale: '한국어', login: '로그인', create: '무료로 작성', start: '이력서 작성 시작', guest: '가입 없이 시작', close: '닫기', cancel: '취소', back: '이전', next: '다음', edit: '작성으로 돌아가기', home: '홈으로', menu: '메뉴', logout: '로그아웃', account: '계정', working: '처리 중…', preview: '미리보기', delete: '삭제', required: '필수', optional: '선택', pdf: 'PDF 다운로드', word: 'Word 다운로드', fileName: '이력서', mine: '나의', marketNav: '지원 국가 선택', comingSoon: '준비 중' },
  nav: { templates: '템플릿', how: '작성 방법', faq: '자주 묻는 질문' },
  fields,
  placeholders: { name: '예: 김하늘', english: '예: Haneul Kim', birth: '예: 1998.03.15 (선택)', documentDate: '예: 2026.11.20', phone: '010-1234-5678', email: 'haneul@example.com', address: '예: 서울시 마포구 (상세 주소는 필요할 때만)', title: '예: 고객 경험을 개선하는 서비스 기획자', portfolio: 'https://example.com/portfolio', period: '예: 2023.03 – 현재', school: '예: 한국대학교', major: '예: 경영학과 졸업', company: '예: 샘플컴퍼니', position: '예: 서비스 기획자', role: '담당 업무, 본인의 역할, 실행 과정과 확인 가능한 성과를 적어 주세요.', summary: '경력 기간, 주요 업무와 핵심 성과를 3~5줄로 요약해 주세요.', skills: '예: Excel(데이터 정리·보고), Figma(화면 설계)', qualifications: '자격증·어학 점수와 취득 시기·발급기관을 적어 주세요.', intro: '실제 경험을 근거로 본인의 강점을 설명해 주세요.', motivation: '지원 기업·직무를 선택한 이유와 기여할 수 있는 점을 적어 주세요.', preferences: '입사 가능 시기 등 전달이 필요한 내용만 적어 주세요.' },
  templates: { eyebrow: '한국 기업 지원을 위한 세 가지 문서', title: '익숙한 서식으로, 경험을 명확하게.', description: '작성 내용을 유지하며 모던·스탠더드 이력서와 경력기술서를 선택할 수 있습니다.', all: '세 문서 모두 무료', modern: '모던', classic: '스탠더드', 'career-description': '경력기술서', 'career-descriptionDescription': '경력 요약과 회사별 업무·프로젝트·성과를 상세하게 보여줍니다.', modernDescription: '간결한 타이포그래피와 여백으로 경력·강점을 먼저 보여줍니다.', classicDescription: '인적사항·학력·경력을 항목별로 정돈한 익숙한 서식입니다.', popular: '기본 템플릿', use: '이 서식으로 작성', expand: '크게 보기', disclaimer: '가상의 예시입니다. 기업의 지정 양식이 있으면 해당 양식을 우선 사용하세요.', modal: '이력서 미리보기' },
  documents: { technicalSkills: '기술 역량', designTools: '디자인 도구·역량', selectedPortfolio: '포트폴리오', portfolioHint: '공개 가능한 포트폴리오 주소를 입력하세요.', detailedHistory: '경력기술', applicableSkills: '핵심 역량·기술', projects: '프로젝트·주요 활동' },
  resume: { heading: '이 력 서', subtitle: '경험과 역량을 한눈에', name: '이름', photo: '이력서 사진', emptyName: '이름을 입력하세요', emptyTitle: '지원 직무·한 줄 소개', confirmation: '위 내용은 사실과 다름없습니다.', signature: '작성자', sections: ['EDUCATION', 'EXPERIENCE', 'SKILLS', 'ABOUT ME', 'MOTIVATION'] },
  builder: { ...ja.builder, title: '한국어 이력서 작성', description: '입력한 내용이 미리보기에 반영됩니다.', saved: '이 브라우저에 자동 저장됨', saveError: '브라우저 저장 실패', sample: '예시 불러오기', sampleConfirm: '예시로 바꿀까요?', sampleWarning: '현재 작성 내용이 예시로 바뀝니다. 필요한 내용은 먼저 다운로드하세요.', sampleApply: '예시로 바꾸기', photoAdd: '사진 업로드', photoHint: 'JPG·PNG / 5MB 이하', photoRemove: '사진 삭제', addEducation: '학력 추가', addCareer: '경력 추가', missingName: '이름을 입력해 주세요.', style: '템플릿', preview: '실시간 미리보기', privacy: features.privacy, reset: '작성 내용 초기화', resetTitle: '작성 내용을 초기화할까요?', resetText: '현재 내용을 비웁니다. 클라우드 동기화 중이면 클라우드에도 빈 내용이 저장됩니다. 필요한 파일은 먼저 다운로드하세요.', resetApply: '초기화', preparing: '파일 생성 중…', downloadHint: 'PDF는 이미지 형식이며 Word는 편집 가능한 문서입니다. 제출처의 요구 형식을 확인하세요.', stepLabel: '이력서 작성 항목', photoEmpty: '사진' },
  unified: { title: '나의 경험을,다음 기회로.', description: '한국 기업 지원에 필요한 내용을 하나씩 정리해 보세요.', document: '나의 한국어 이력서', draft: '초안', save: '저장', progress: '작성 진행률', sections: ['기본정보', '경력·프로젝트', '학력', '역량·자격', '자기소개', '검토·다운로드'], descriptions: ['연락받을 정보와 지원 직무를 입력하세요. 사진과 생년월일은 선택입니다.', '담당 업무와 프로젝트에서 본인이 기여한 내용을 적어 주세요.', '학교·전공·재학 기간과 졸업 구분을 입력하세요.', '직무에 관련된 도구·기술, 자격증·어학을 정리하세요.', '경력 요약과 자기소개·지원동기를 지원처에 맞게 작성하세요.', '연락처·사실관계·제출 형식을 확인하세요.'], extraPersonal: '영문 이름·생년월일·작성일 (선택)', moreTools: '계정·클라우드 저장', previewOpen: '미리보기 열기', previewClose: '작성으로 돌아가기', caption: '입력한 내용이 선택한 서식에 반영됩니다.', skip: '입력 양식으로 이동', legacyTitle: '이전 초안이 있습니다', legacyDescription: '불러올 내용을 확인해 주세요.', legacyImport: '이전 초안 가져오기', legacyKeep: '현재 내용 유지', imported: '이전 초안을 가져왔습니다.', importConfirm: '이전 초안으로 바꿀까요?', restore: '이전 백업 복원', noBackup: '복원할 백업이 없습니다.', restored: '백업을 복원했습니다.', basic: '무료 템플릿', premium: '추가 템플릿' },
  messages: { savedError: '브라우저 저장 공간이 부족하거나 저장이 차단됐습니다. 파일로 다운로드하세요.', sample: '가상의 예시를 불러왔습니다. 본인의 경험으로 바꿔 주세요.', downloaded: '{format} 파일을 다운로드했습니다.', exportError: '파일을 만들지 못했습니다. 다시 시도해 주세요.', photoType: 'JPG 또는 PNG 이미지를 선택하세요.', photoSize: '5MB 이하의 사진을 선택하세요.', photoError: '사진을 불러오지 못했습니다. 다른 파일을 선택하세요.', reset: '작성 내용을 초기화했습니다.' },
  auth: { loginTitle: '로그인하고 작성을 이어가세요.', signupTitle: '계정을 만들고 초안을 보관하세요.', resetTitle: '비밀번호 재설정', recoveryHelp: '메일의 링크에서 새 비밀번호를 설정하세요. 만료된 링크라면 새 메일을 요청하세요.', recoveryInvalid: '인증 링크가 만료됐거나 이미 사용됐습니다. 새 메일을 요청하세요.', recoveryChecking: '인증 링크 확인 중…', updateTitle: '새 비밀번호 설정', subtitle: '회원가입 없이도 이력서를 작성할 수 있습니다.', google: 'Google로 시작', nudge: '작성한 내용을 다른 기기에서도 이어 쓰려면 로그인하세요.', nudgeAction: '로그인하고 이어 쓰기', pdfMessage: '로그인하면 워터마크 없이 다운로드할 수 있습니다. 가입 없이도 파일 저장은 가능합니다.', downloadAnyway: '가입 없이 다운로드', divider: '또는 이메일로', email: '이메일', password: '비밀번호', confirm: '비밀번호 확인', passwordHint: '8자 이상 입력하세요', emailPlaceholder: 'you@example.com', loginSubmit: '로그인', signupSubmit: '계정 만들기', resetSubmit: '재설정 메일 보내기', updateSubmit: '비밀번호 변경', forgot: '비밀번호를 잊으셨나요?', noAccount: '처음 이용하시나요?', hasAccount: '이미 계정이 있나요?', signupLink: '회원가입', loginLink: '로그인', backLogin: '로그인으로 돌아가기', showPassword: '비밀번호 표시', hidePassword: '비밀번호 숨기기', signupSuccess: '확인 메일을 보냈습니다. 메일의 링크에서 가입을 완료하세요.', loginSuccess: '로그인했습니다.', resetSuccess: '등록된 계정이면 재설정 메일을 보냈습니다.', updateSuccess: '비밀번호를 변경했습니다.', updateLoginSuccess: '비밀번호를 변경하고 로그인했습니다. 작성을 이어가세요.', mismatch: '비밀번호가 일치하지 않습니다.', invalid: '이메일과 비밀번호를 확인하세요.', notConfirmed: '확인 메일의 링크에서 이메일 인증을 완료하세요.', exists: '이미 등록된 이메일입니다. 로그인해 주세요.', weak: '비밀번호는 8자 이상이어야 합니다.', rateLimit: '잠시 후 다시 시도해 주세요.', generic: '인증을 완료하지 못했습니다. 다시 시도해 주세요.', unavailable: '계정 기능은 연결 준비 중입니다. 가입 없이 작성·다운로드할 수 있습니다.', storage: '비회원 초안은 이 브라우저에 저장됩니다. 클라우드 저장은 로그인 후 선택할 수 있습니다.', guestLink: '가입 없이 작성', logoutError: '로그아웃하지 못했습니다. 다시 시도해 주세요.', callbackError: '로그인을 완료하지 못했습니다. 다시 시도해 주세요.' },
  photo, builderFeatures: features, workspace,
  footer: { description: '한국 기업 지원을 위한 바로 이력서', privacy: '개인정보 처리방침', account: '회원가입', copyright: 'All rights reserved.', localeNote: '한국어 버전' },
  sample: { name: '김하늘', english: 'Haneul Kim', birth: '', phone: '010-1234-5678', email: 'haneul@example.com', address: '서울시 마포구', title: '사용자 경험을 개선하는 서비스 기획자', photo: '', portfolio: 'https://example.com/portfolio', documentDate: '2026.11.20', summary: '웹 서비스 기획과 운영 개선을 담당했습니다. 사용자 의견을 정리하고 개발·디자인 팀과 개선안을 구체화한 경험이 있습니다.', education: [{ period: '2017.03 – 2021.02', school: '한국대학교', major: '경영학과 졸업' }], careers: [{ period: '2022.03 – 현재', company: '샘플컴퍼니', position: '서비스 기획자', role: '사용자 문의를 유형별로 분석하고, 가입 화면 개선과 운영 가이드 정비를 담당했습니다.' }], skills: 'Figma, Excel, 사용자 인터뷰, 요구사항 정의', qualifications: '2021.06 컴퓨터활용능력 1급', preferences: '', intro: '문제를 구체적으로 정의하고 동료와 해결책을 만드는 것이 강점입니다. 서비스 운영에서 반복 문의의 원인을 정리해 개선 과제를 제안했습니다.', motivation: '고객의 문제를 제품으로 해결하는 방향에 공감합니다. 기획과 운영 경험을 바탕으로 사용자 관점의 서비스 개선에 기여하고 싶습니다.', projects: [{ projectName: '회원가입 흐름 개선', projectPeriod: '2025.03 – 2025.06', projectRole: '기획 담당 · 4인 팀', projectStack: 'Figma, Excel', projectResult: '반복 문의를 분류하고 개선안을 설계했습니다. 개발·디자인 담당자와 요구사항을 조율하고 배포 전 검수를 진행했습니다.' }] },
  templateSamples: {},
};
