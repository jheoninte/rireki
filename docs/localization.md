# 다국어 확장 구조

로컬 구현은 일본어(`ja`), 한국어(`ko`), 영어(`en`)의 별도 홈·편집기를 제공합니다. 영어는 Folio. / SwiftResume 브랜드와 자체 템플릿 18종, 불릿 작성 도구 및 텍스트 PDF·Word 출력을 사용합니다. 자세한 내용은 `docs/english-version.md`를 참고하세요. 운영 배포 상태는 배포 문서를 별도로 확인하세요.

- `src/i18n/ja.js`: 소개·편집기·서식·인증·오류·예시 데이터의 일본어 문구
- `src/i18n/index.jsx`: 언어별 catalog, provider, `useI18n()`
- 컴포넌트: `const { copy, locale } = useI18n()`으로 문구 사용
- 문서: 페이지의 `lang`, 제목, description을 언어와 함께 변경
- 저장소: `rireki:resume:<locale>:v1`로 언어별 작성 내용을 구분

`/ko/`·`/ko/app/`에서는 한국어 카탈로그를 사용합니다. `/`·`/app/`의 일본어 기본 동작은 유지합니다. 국가별 홈·허용 서식은 `resume-markets.js`, URL 판별은 `market-routes.js`에서 관리합니다. [한국어 초기 구현](korean-initial-version.md)을 참고하세요.

문자열뿐 아니라 날짜·주소·이름 필드와 이력서 형식도 국가별 검토가 필요합니다. 현 버전의 `english` 데이터 키는 이전 스키마와의 호환을 위해 유지하며, 일본어 UI에서는 `ふりがな` 필드로 사용합니다. 다른 언어를 추가할 때 국가별 필드 모델로 분리하는 것을 권장합니다. 일본어 글꼴은 Noto Sans JP, Word 내보내기는 Yu Gothic을 사용합니다.

입력한 사용자 콘텐츠는 자동 번역하지 않습니다. 기존 한국어 프로토타입의 localStorage 키는 삭제하지 않으며, 일본어 버전은 별도 키에 저장됩니다.
