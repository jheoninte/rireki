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

`.deploy/rireki-easy.zip`은 최초 배포에 사용한 빌드 압축 파일입니다. 소스나 환경변수 파일을 포함하지 않습니다. Git 자동 배포는 연결하지 않았습니다.

## 인증 상태

비회원 작성·브라우저 저장·문서 다운로드를 제공합니다. Supabase 프로젝트 URL과 공개 키가 아직 없어 실제 가입·로그인은 비활성화되어 있습니다.

인증을 활성화하려면 [인증 설정](auth-setup.md)에 따라 `.env.local`을 설정하고 **다시 빌드한 dist를 재배포**합니다. 직접 업로드는 이미 빌드한 파일을 제공하므로 대시보드 환경변수만 수정해도 기존 파일에 반영되지 않습니다.

Supabase Site URL: `https://rireki-easy.pages.dev`

허용할 Redirect URL:

- `https://rireki-easy.pages.dev/#builder`
- `https://rireki-easy.pages.dev/#reset-password`

Google OAuth의 승인된 JavaScript 출처에는 `https://rireki-easy.pages.dev`를 추가합니다. Callback URL은 Supabase 프로젝트가 제공하는 주소를 사용합니다.
