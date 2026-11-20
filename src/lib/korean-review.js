export function reviewKoreanResume(data, variant) {
  const career = variant === 'career-description';
  const hasExperience = (data.careers || []).some(row => row.company?.trim() && row.role?.trim()) ||
    (data.projects || []).some(row => row.projectName?.trim() && row.projectResult?.trim());
  const omitted = career ? ['photo', 'accent', 'english', 'birth', 'age', 'gender', 'address', 'addressFurigana', 'contactAddress', 'contactFurigana', 'contactPhone', 'contactEmail', 'education', 'intro', 'motivation', 'preferences', 'academicWork', 'studentActivities', 'workDays', 'workHours', 'availableFrom', 'returnPreparation'] : ['photo', 'accent'];
  const texts = Object.entries(data).filter(([key]) => !omitted.includes(key)).flatMap(([, value]) =>
    Array.isArray(value) ? value.flatMap(row => Object.values(row)) : [value]).join('\n');
  return [
    { id: 'name', section: 'personal', ok: Boolean(data.name?.trim()), label: '이름 입력' },
    { id: 'contact', section: 'personal', ok: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email?.trim() || '') && (data.phone || '').replace(/\D/g, '').length >= 9, label: '연락 가능한 이메일·전화번호 확인' },
    { id: 'title', section: 'personal', ok: Boolean(data.title?.trim()), label: '지원 직무·한 줄 소개 입력' },
    ...(career ? [{ id: 'summary', section: 'writing', ok: Boolean(data.summary?.trim()), label: '주요 경험과 전문 분야를 경력 요약에 작성' }] : []),
    { id: 'experience', section: 'experience', ok: hasExperience, label: '경력 또는 프로젝트에 본인 역할·수행 내용 작성' },
    { id: 'portfolio', section: 'personal', ok: !data.portfolio?.trim() || /^https:\/\/[^\s/]+(?:\/[^\s]*)?$/i.test(data.portfolio.trim()), label: '포트폴리오 URL 형식 확인 (입력한 경우)' },
    { id: 'sample', section: 'writing', ok: !/example\.com|가상컴퍼니|샘플컴퍼니|한국대학교|본인의 경험으로 기여할 수 있는 점을 구체적으로 작성하세요|김하늘|010-1234-5678/.test(texts), label: '가상 예시·안내 문구를 본인 정보로 교체' },
  ];
}
