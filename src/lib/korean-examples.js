// Original fictional writing samples. These are content choices, not layouts.
export const koreanExamples = {
  general: {
    label: '일반·사무', focus: '반복 업무를 개선한 과정을 구체적으로',
    title: '업무 기준을 정리하는 경영지원 담당자',
    summary: '계약 문서와 월별 정산 자료를 관리했습니다. 반복되는 확인 업무를 줄이기 위해 분류 기준과 업무 체크리스트를 정리한 경험이 있습니다.',
    skills: 'Excel(자료 정리·함수), 문서 관리, 일정 조율',
    project: { projectName: '월별 정산 자료 정비', projectPeriod: '2025.03 – 2025.06', projectRole: '자료 정리·검수 담당 · 3인 팀', projectStack: 'Excel, 공유 문서', projectResult: '부서마다 다른 정산 자료를 비교하고 공통 양식을 만들었습니다. 누락 확인 항목을 체크리스트로 정리해 담당자들과 검수 기준을 공유했습니다.' },
  },
  developer: {
    label: '개발·IT', focus: '기술 목록보다 문제·본인 역할·검증을',
    title: '사용 흐름을 개선하는 프론트엔드 개발자',
    summary: 'React 기반 웹 화면을 개발했습니다. 입력 오류가 자주 발생하는 구간을 찾아 검증 메시지와 상태 표시를 개선하고, 주요 사용자 흐름을 테스트한 경험이 있습니다.',
    skills: 'React(화면 개발), TypeScript, 접근성 점검, 단위 테스트',
    project: { projectName: '예약 신청 화면 개선', projectPeriod: '2025.03 – 2025.06', projectRole: '프론트엔드 개발 · 4인 팀', projectStack: 'React, TypeScript, Vitest', projectResult: '예약 신청 중 입력 내용을 잃는 문제를 재현했습니다. 임시 저장과 오류 안내를 구현하고 새로고침·재접속 시나리오를 테스트했습니다. API 담당자와 저장 실패 시 처리 방식도 조율했습니다.' },
  },
  designer: {
    label: '디자인', focus: '문제 발견부터 설계·검증까지 연결',
    title: '사용자의 다음 행동을 명확하게 만드는 UX 디자이너',
    summary: '웹 서비스의 화면 설계와 사용성 검토를 담당했습니다. 사용자 인터뷰에서 발견한 탐색 문제를 정보 구조와 프로토타입에 반영한 경험이 있습니다.',
    skills: 'Figma(프로토타입·컴포넌트), 사용자 인터뷰, 사용성 테스트',
    project: { projectName: '서비스 도움말 탐색 개선', projectPeriod: '2025.03 – 2025.06', projectRole: 'UX 조사·화면 설계 · 4인 팀', projectStack: 'Figma, FigJam', projectResult: '도움말을 찾기 어렵다는 의견을 인터뷰로 확인했습니다. 질문을 목적별로 묶고 검색 결과 화면을 설계했습니다. 프로토타입 테스트에서 관찰한 혼동 구간을 수정하고 설계 근거를 포트폴리오에 정리했습니다.' },
  },
  marketing: {
    label: '마케팅', focus: '목표·담당 범위·비교 기준을 명시',
    title: '고객 반응을 바탕으로 콘텐츠를 개선하는 마케터',
    summary: '서비스 소개 콘텐츠 기획과 캠페인 운영을 담당했습니다. 유입 경로별 반응을 비교하고 다음 콘텐츠의 메시지와 배포 계획에 반영한 경험이 있습니다.',
    skills: 'GA4(유입 분석), Excel, 콘텐츠 기획, 캠페인 운영',
    project: { projectName: '신규 서비스 소개 캠페인', projectPeriod: '2025.03 – 2025.06', projectRole: '콘텐츠 기획·성과 정리 · 3인 팀', projectStack: 'GA4, Excel', projectResult: '서비스 인지도 확대를 목표로 채널별 콘텐츠를 기획했습니다. UTM 기준을 정리해 유입 경로를 구분하고 동일 기간의 반응을 비교했습니다. 분석 내용은 다음 캠페인의 메시지 개선안으로 제안했습니다.' },
  },
};

export const koreanAccents = [
  { key: 'blue', label: '블루', color: '#2563eb' },
  { key: 'navy', label: '네이비', color: '#243b60' },
  { key: 'slate', label: '차콜', color: '#374151' },
];
export const accentColor = key => (koreanAccents.find(item => item.key === key) || koreanAccents[0]).color;
export const koreanExampleKey = key => Object.hasOwn(koreanExamples, key) ? key : 'general';
export function koreanSample(base, job, accent = '') {
  const example = koreanExamples[koreanExampleKey(job)];
  return { ...base, accent, title: example.title, summary: example.summary, skills: example.skills,
    careers: [{ period: '2024.03 – 현재', company: '가상컴퍼니', position: example.label, role: example.project.projectResult }],
    projects: [{ ...example.project }],
    intro: '문제를 발견하면 근거를 정리하고 동료와 개선 방향을 구체화합니다. 프로젝트에서 맡은 역할과 확인한 결과를 바탕으로 업무를 개선해 왔습니다.',
    motivation: '지원 기업과 직무를 조사한 뒤, 본인의 경험으로 기여할 수 있는 점을 구체적으로 작성하세요.',
  };
}
