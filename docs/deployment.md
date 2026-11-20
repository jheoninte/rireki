# 실제 배포

- 공개 주소: https://rireki-easy.pages.dev/
- 호스팅: Cloudflare Pages, 정적 파일 직접 업로드
- 프로젝트: `rireki-easy`
- 최초 배포: 2026-11-20
- 관리: https://dash.cloudflare.com/fe3135135a2ef04ba59361778827023a/pages/view/rireki-easy

`rireki`(履歴書)와 `easy`를 조합해 간편한 일본어 이력서 작성 서비스라는 의미를 담았습니다. 무료 `pages.dev` 서브도메인을 사용하며 별도 도메인 구매는 하지 않았습니다. 무료 플랜의 사용량·제한은 Cloudflare 정책을 따릅니다.

## 업데이트

1. `pnpm build`를 실행합니다.
2. `dist` **내부의 파일과 assets 폴더**를 ZIP으로 압축합니다. ZIP 최상위에 `index.html`이 있어야 합니다.
3. Cloudflare 프로젝트에서 Create deployment → Production을 선택하고 업로드합니다.
4. 공개 주소에서 화면과 편집기, 다운로드를 확인합니다.

`.deploy/rireki-easy.zip`은 최근 배포용 빌드 압축 파일입니다. 소스나 환경변수 파일을 포함하지 않습니다. Git 자동 배포는 연결하지 않았습니다.

## UI 템플릿 최초 배포 — 통합 전 (2026-11-20)

- 공개 주소: https://rireki-easy.pages.dev/templates/resume-builder/
- 배포 파일: `.deploy/rireki-easy-template.zip` (기존 앱과 템플릿을 포함한 전체 빌드)
- Cloudflare Pages Production 직접 업로드 성공 및 공개 페이지의 실시간 입력 반영 확인
- 템플릿 소스: `public/templates/resume-builder/`
- 확인 화면: `docs/screenshots/resume-builder-deployed.jpg`

이 항목은 통합 전의 별도 HTML/CSS/JavaScript 시안 배포 기록입니다. 현재는 아래 통합 서비스 배포로 대체했고, 해당 주소도 메인 React 편집기로 연결합니다. `.deploy/rireki-easy.zip`은 이전 배포 파일로 보관합니다.

## 인증 상태

비회원 작성·브라우저 저장·문서 다운로드와 선택적 Supabase 인증을 제공합니다. Google 제공자를 활성화하고 Google 앱을 프로덕션으로 게시했습니다. 이메일은 Resend의 검증된 `rireki.jpease.org`에서 발송합니다.

새 환경에서 빌드할 때는 [인증 설정](auth-setup.md)에 따라 `.env.local`을 설정하고 **다시 빌드한 dist를 재배포**합니다. 직접 업로드는 이미 빌드한 파일을 제공하므로 대시보드 환경변수만 수정해도 기존 파일에 반영되지 않습니다.

Supabase Site URL: `https://rireki-easy.pages.dev`

허용할 Redirect URL:

- `https://rireki-easy.pages.dev/#builder`
- `https://rireki-easy.pages.dev/#reset-password`
- `https://rireki-easy.pages.dev/reset-password`

Google OAuth의 승인된 JavaScript 출처에는 `https://rireki-easy.pages.dev`를 추가합니다. Callback URL은 Supabase 프로젝트가 제공하는 주소를 사용합니다.

## 통합 서비스 배포 (2026-11-20)

- 메인: https://rireki-easy.pages.dev/
- 통합 편집기: https://rireki-easy.pages.dev/#builder
- 호환 주소: https://rireki-easy.pages.dev/templates/resume-builder/ → /#builder
- 배포 파일: `.deploy/rireki-unified.zip` (dist 내부 파일 17개, 비밀키·소스 제외)
- 이전 운영 배포: `0e1a996d-dee7-41e8-aadc-462b4a898175` (Cloudflare에서 롤백 가능)
- 메인·편집기에 시안의 디자인 적용, 하나의 브랜드·로그인·저장·다운로드 흐름으로 통합
- 기존 시안 초안 자동/선택 가져오기 및 읽기 전 복원, 원본 키 보존
- 검증: 36개 테스트 통과, 빌드 성공, 모바일/데스크톱과 PDF·Word 다운로드 확인

클라우드·AI·유료 결제 서버는 [연결 안내](workspace-setup.md)에 따라 별도 활성화가 필요합니다. 이번 정적 배포만으로 유료 API 요청이나 결제가 시작되지는 않습니다.

운영 주소에서 호환 경로 → `/#builder` 이동과 두 초안 선택 안내를 확인했습니다. 최종 스타일 자산은 `assets/index-DoZZSURr.css`이며, 확인 화면은 `docs/screenshots/unified-production.jpg`, 모바일 검증 화면은 `docs/screenshots/unified-mobile.jpg`입니다.

## 정적 랜딩과 편집기 분리 (다국어 운영 배포에 포함)

`pnpm build`는 검색용 `dist/index.html`, 편집기 `dist/app/index.html`, 복구 화면 `dist/reset-password/index.html`을 함께 생성합니다. 메인 랜딩의 본문과 서식 선택 링크는 JavaScript 없이도 동작하며, 기존 `/#builder`·인증 콜백은 `/app/`로 연결합니다. 배포 ZIP에는 반드시 dist 전체를 포함합니다.

일본식 履歴書와 職務経歴書는 무료 서식입니다. 새 서식의 클라우드 저장을 활성화하려면 `supabase/migrations/202611200002_document_templates.sql`을 적용합니다. 기존 마이그레이션은 다시 실행하지 않습니다.

## 일본어·한국어·영어 운영 배포 (2026-11-20)

- GitHub: `https://github.com/jheoninte/rireki`, `master`에 소스 푸시 완료
- 배포 소스 커밋: `340c4568a42e62c2abdefc9356dc0246d2fa8494`
- Cloudflare Pages Production: `https://e6ca86a8.rireki-easy.pages.dev/`
- 일본어: `https://rireki-easy.pages.dev/`
- 한국어 바로 이력서: `https://rireki-easy.pages.dev/ko/`
- 영어 Folio. / SwiftResume: `https://rireki-easy.pages.dev/en/`
- 편집기: 각각 `/app/`, `/ko/app/`, `/en/app/`
- 배포 ZIP: `.deploy/rireki-multilingual.zip`, dist 전체 34개 파일
- 식별 정보: 공개 `/deployment-info.json`의 `sourceCommit`으로 Git 소스와 배포본 일치 확인
- 검증: 배포 전 104개 테스트 통과, 빌드 성공. 운영 6개 홈·편집기 경로 응답, 영어 템플릿 18개, 일본어 원본 Word·영문 폰트 제공 확인. 운영 사이트 모바일 화면과 실제 PDF·Word 다운로드 및 PDF 텍스트 추출 확인
- 모바일 운영 확인 화면: `docs/screenshots/multilingual-production-mobile.jpg`

기존 Pages 프로젝트는 직접 업로드 방식이므로 Git 자동 배포 연결은 변경하지 않았습니다. 소스를 GitHub에 먼저 동기화하고 동일 소스의 빌드를 운영에 업로드했습니다. 비밀키·로컬 환경변수·소스 폴더는 배포 ZIP에 포함하지 않았습니다.

이번 작업은 프론트엔드 공개 배포입니다. Supabase 마이그레이션·Edge Function 배포 및 한국어·영어 인증 복귀 URL 추가는 실행하지 않았습니다. 비회원 작성·브라우저 저장·파일 다운로드는 운영에서 확인했습니다.

## 공개 베타 보완 배포 (2026-11-20)

- 최종 배포 소스: `47679f6030f3e48f249b98066cbbd86cf31803d0` (`/deployment-info.json` 확인).
- ZIP: `.deploy/rireki-launch-ready-final.zip`, 40개 파일. 기존 3개 언어 주소에 배포 완료.
- 언어별 hreflang·공유 이미지·favicon·실제 HTTP 404 추가, 외부 폰트 요청 제거, UI 글자 대비와 로고 접근성 수정.
- 전체 21개 테스트 파일/104개 테스트 통과, 빌드 성공, 운영 SEO 검증 스크립트 통과.
- 운영 Supabase 마이그레이션 001–006 적용, 사용자 승인 후 Data API 활성화. 한국어·영어 인증 복귀 URL 추가 및 Google 실제 로그인 복귀 확인. 영어 가상 예제로 최초 저장·2초 자동 저장·클라우드 복원 확인.
- SQL에서 3개 언어 저장·수정 충돌·계정 격리 검증 후 롤백. 운영 API에서도 익명 조회는 빈 배열, 익명 저장은 HTTP 401 확인.
- `VITE_CLOUD_ENABLED=true`로 빌드. 다음 배포에도 이 환경 설정을 유지해야 합니다. AI·결제는 계속 비활성입니다.
- Search Console 소유권 인증 및 사이트맵 제출 완료. Google의 사이트맵 읽기 실패와 색인 요청 일일 할당량 제한이 있어 검색 반영은 미완료입니다. 직접 조회와 Googlebot User-Agent 요청은 정상 XML/HTTP 200입니다.
- 390×844 뷰포트에서 3개 언어 홈의 가로 넘침 없음. 실제 iPhone/Android 테스트는 별도 필요합니다.
- 검증 화면: `docs/screenshots/launch-{japanese,korean,english}-mobile.jpg`, `launch-cloud-saved.jpg`.
- 최종 운영 모바일 Lighthouse: 일본어 성능 100, 한국어 100, 영어 99. 접근성·Best Practices·SEO는 세 언어 모두 100. 실사용자 Core Web Vitals나 검색 순위 보장은 아닙니다.

상세 검증 범위와 남은 운영 점검은 `docs/launch-readiness.md`에 기록했습니다. 위 내용은 이전 배포에서 보류했던 DB·인증 설정의 최신 상태입니다.

## 추가 검색 서비스 등록 (2026-11-20)

배포 소스 `a2c2e996a39e6ca9e9727ca057148483de829474`, ZIP `.deploy/rireki-search-registration.zip`(44개 파일). 네이버·Bing·Yandex 소유권 확인 파일과 Bing 메타 태그, IndexNow 소유권 파일을 반영했습니다. 기존 클라우드 활성화 설정을 유지했습니다.

네이버·Bing 소유권 인증 및 사이트맵 제출 완료, Bing에는 3개 언어 홈 URL도 개별 제출했습니다. 다음은 한국어 바로 이력서 등록 신청 접수 완료/심사 대기입니다. Yandex는 소유권 인증을 완료했으나 서비스 장애로 사이트맵 도구가 읽기 전용이어서 추가 제출이 불가능합니다. IndexNow는 3개 홈 URL을 HTTP 202로 접수했으며 키 검증 대기 상태입니다. 각 서비스의 실제 수집·색인은 아직 보장되지 않습니다. 상세 상태와 이후 제출 방법은 `docs/search-registration.md`를 참고하세요.
