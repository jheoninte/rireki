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

## UI 템플릿 배포 (2026-11-20)

- 공개 주소: https://rireki-easy.pages.dev/templates/resume-builder/
- 배포 파일: `.deploy/rireki-easy-template.zip` (기존 앱과 템플릿을 포함한 전체 빌드)
- Cloudflare Pages Production 직접 업로드 성공 및 공개 페이지의 실시간 입력 반영 확인
- 템플릿 소스: `public/templates/resume-builder/`
- 확인 화면: `docs/screenshots/resume-builder-deployed.jpg`

기존 메인 페이지와 별도로 접근하는 HTML/CSS/JavaScript 템플릿입니다. 이 배포에서는 기존 React 편집기에 디자인을 이식하지 않았습니다. `.deploy/rireki-easy.zip`은 이전 배포 파일로 보관합니다.

## 인증 상태

비회원 작성·브라우저 저장·문서 다운로드와 선택적 Supabase 인증을 제공합니다. Google 제공자를 활성화하고 Google 앱을 프로덕션으로 게시했습니다. 이메일은 Resend의 검증된 `rireki.jpease.org`에서 발송합니다.

새 환경에서 빌드할 때는 [인증 설정](auth-setup.md)에 따라 `.env.local`을 설정하고 **다시 빌드한 dist를 재배포**합니다. 직접 업로드는 이미 빌드한 파일을 제공하므로 대시보드 환경변수만 수정해도 기존 파일에 반영되지 않습니다.

Supabase Site URL: `https://rireki-easy.pages.dev`

허용할 Redirect URL:

- `https://rireki-easy.pages.dev/#builder`
- `https://rireki-easy.pages.dev/#reset-password`
- `https://rireki-easy.pages.dev/reset-password`

Google OAuth의 승인된 JavaScript 출처에는 `https://rireki-easy.pages.dev`를 추가합니다. Callback URL은 Supabase 프로젝트가 제공하는 주소를 사용합니다.
