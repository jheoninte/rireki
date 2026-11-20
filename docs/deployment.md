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

## 정적 랜딩과 편집기 분리 (로컬 구현, 배포 대기)

`pnpm build`는 검색용 `dist/index.html`, 편집기 `dist/app/index.html`, 복구 화면 `dist/reset-password/index.html`을 함께 생성합니다. 메인 랜딩의 본문과 서식 선택 링크는 JavaScript 없이도 동작하며, 기존 `/#builder`·인증 콜백은 `/app/`로 연결합니다. 배포 ZIP에는 반드시 dist 전체를 포함합니다.

일본식 履歴書와 職務経歴書는 무료 서식입니다. 새 서식의 클라우드 저장을 활성화하려면 `supabase/migrations/202611200002_document_templates.sql`을 적용합니다. 기존 마이그레이션은 다시 실행하지 않습니다.
