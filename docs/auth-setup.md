# 이메일 가입·Google 로그인 연결

## 2026-11-20 연결 진행 상태

- Supabase 프로젝트 `qccbcnoslaglgyrlaalo` 생성 완료 (도쿄).
- 운영 Site URL과 `#builder`, `#reset-password` 복귀 주소 저장 완료.
- Email 제공자 활성 및 이메일 확인 필수 상태를 공개 Auth settings API로 확인.
- 로컬 `.env.local`에 프로젝트 URL과 publishable key 연결 완료. 이 파일은 Git에서 제외.
- Google Cloud `rireki-easy`의 `Rireki Easy Web` OAuth 클라이언트 생성 완료.
- Google 승인 원본: `https://rireki-easy.pages.dev`
- Google 콜백: `https://qccbcnoslaglgyrlaalo.supabase.co/auth/v1/callback`
- 앱 재시작 후 같은 Google 클라이언트에 대체 비밀키를 발급해 Supabase에 저장했고 Google 제공자 활성화를 확인했습니다. 이전 비밀키는 앱에서 사용하지 않습니다.
- Google 앱을 프로덕션으로 게시하고 홈페이지·개인정보처리방침 URL을 등록했습니다.
- Resend 무료 계정의 도쿄 리전에 `rireki.jpease.org` 발신 도메인을 등록하고 DNS 검증 완료 상태를 확인했습니다.
- `rireki-supabase-smtp` 키는 해당 도메인의 Sending access로 한정하여 Supabase SMTP에만 저장했습니다. 서버: `smtp.resend.com`, TLS 포트: `465`, 사용자: `resend`, 발신자: `rireki. <no-reply@rireki.jpease.org>`.
- 실제 공개 사이트에서 Google 로그인 → 편집기 복귀, 새로고침 세션 유지, 로그아웃을 확인했습니다.
- 실제 공개 사이트의 재설정 요청이 Resend에서 Delivered로 확인됐고 이메일 링크에서 새 비밀번호 입력 화면까지 정상 연결됐습니다.
- 새 환경변수를 포함한 빌드와 개인정보처리방침 페이지를 Cloudflare Pages에 배포했습니다.
- 비밀번호 복구는 `/reset-password` 전용 페이지를 사용합니다. Supabase Reset password 메일 본문에 `supabase/templates/recovery.html`을 적용하고 제목은 `パスワードの再設定 | rireki.`로 설정합니다. 이메일의 `token_hash`를 `verifyOtp(type: recovery)`로 검증하므로 요청한 브라우저와 다른 브라우저에서도 새 링크를 열 수 있습니다. 토큰은 한 번만 사용 가능하며 검증 직전에 주소 표시줄에서 제거합니다. 만료·사용된 링크는 전용 화면에서 재발송을 안내합니다.

비밀키는 Supabase Google 제공자·SMTP 설정에만 저장하고 소스코드·문서·프런트엔드에 넣지 않습니다. Google 비밀키는 재조회할 수 없으므로 분실한 경우 Google 콘솔의 비밀키 순환 절차를 따릅니다.

Supabase 기본 발송 대신 사용자 지정 Resend SMTP를 사용합니다. 이메일 확인은 활성 상태를 유지합니다. 무료 플랜 발송량과 Supabase 인증 메일 속도 제한을 운영 시 확인하세요.

화면과 Supabase 인증 호출은 구현되어 있습니다. 새 프로젝트의 URL·공개 키와 Google OAuth 설정을 연결하면 실제 인증이 활성화됩니다. 이 저장소에는 임의의 프로젝트나 가짜 로그인을 넣지 않았습니다.

## 1. 새 Supabase 프로젝트

1. 본인 계정으로 [Supabase](https://supabase.com/dashboard)에서 새 프로젝트를 생성합니다.
2. 프로젝트의 URL과 **publishable key**를 확인합니다. 구형 프로젝트의 `anon` 공개 키도 같은 환경변수에 사용할 수 있습니다.
3. 루트의 `.env.example`을 `.env.local`로 복사하고 값을 입력합니다.

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
```

`service_role` 키나 Google Client Secret은 프런트엔드 환경변수에 넣지 않습니다. `.env.local`은 Git에서 제외됩니다.

환경변수를 수정한 뒤 개발 서버를 다시 시작합니다. 배포 환경에도 두 환경변수를 추가한 뒤 다시 빌드해야 합니다.

## 2. 이메일·비밀번호

Supabase Authentication에서 Email 제공자를 활성화하고 이메일 확인을 켭니다. 운영 시에는 발신 도메인과 SMTP를 설정하고 발송 제한을 확인합니다. 비밀번호 최소 길이는 앱과 동일하게 8자 이상으로 설정합니다.

Authentication의 URL 설정:

| 설정         | 개발 예시                               |
| ------------ | --------------------------------------- |
| Site URL     | `http://127.0.0.1:5173`                 |
| Redirect URL | `http://127.0.0.1:5173/#builder`        |
| Redirect URL | `http://127.0.0.1:5173/#reset-password` |

운영 도메인의 HTTPS 주소도 같은 방식으로 등록합니다. `localhost`로 접속할 경우 해당 호스트의 주소를 별도로 추가합니다. OAuth·이메일 링크의 복귀 주소는 현재 페이지의 `location.origin`을 사용합니다.

현재 공개 사이트의 Site URL은 `https://rireki-easy.pages.dev`입니다. Redirect URL에는 `https://rireki-easy.pages.dev/#builder`와 `https://rireki-easy.pages.dev/#reset-password`를 등록합니다. Cloudflare Pages 직접 업로드 방식이므로 키를 연결한 뒤 로컬에서 다시 빌드해 재배포합니다. [배포 안내](deployment.md)를 참고하세요.

추가로 `https://rireki-easy.pages.dev/reset-password`를 등록합니다. 기존 `#reset-password`는 이미 보낸 메일의 호환성을 위해 유지합니다. 새 환경에서는 위 복구 메일 템플릿도 반드시 적용합니다.

이메일 가입 → 이메일 확인 → 로그인 흐름을 지원합니다. OAuth·기본 가입 확인은 PKCE를 사용하므로 확인 링크는 요청한 브라우저에서 여는 것을 권장합니다. 비밀번호 복구는 별도 token-hash 템플릿을 사용합니다.

## 3. Google 로그인

1. [Google Cloud Console](https://console.cloud.google.com/)에서 OAuth 동의 화면을 설정합니다.
2. **웹 애플리케이션**용 OAuth Client ID를 생성합니다.
3. 승인된 JavaScript 출처에 서비스 도메인을 등록합니다. 개발 시에는 `http://127.0.0.1:5173`도 추가합니다.
4. 승인된 리디렉션 URI에는 Supabase Google 제공자 설정에 표시되는 Callback URL을 정확히 등록합니다.

   ```text
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```

5. Supabase Authentication의 Google 제공자에 Client ID와 Client Secret을 등록하고 활성화합니다. Client Secret은 Supabase에만 저장합니다.
6. 동의 화면이 테스트 상태이면 테스트 사용자를 등록합니다. 공개 서비스에서는 Google의 게시·검증 요건을 확인합니다.

앱은 `signInWithOAuth({ provider: 'google' })`를 호출하며, 인증 후 편집기로 돌아옵니다. Google 비밀번호를 앱에서 직접 입력받지 않습니다.

## 4. 구현·데이터 범위

- 이메일 회원가입, 확인 메일 안내, 비밀번호 로그인
- Google OAuth 리디렉션
- 로그인 세션 복원, 계정 이메일 표시, 로그아웃
- 비밀번호 재설정 메일, 새 비밀번호 저장
- 인증 제공자의 오류를 일본어로 표시
- 설정이 없으면 인증 버튼 비활성화 및 비회원 작성 제공

이력서 내용·사진은 계정 여부와 관계없이 현재 브라우저의 localStorage에만 저장됩니다. **회원가입은 클라우드 저장이나 기기 간 동기화를 제공하지 않습니다.** 이 문구는 가입 화면과 FAQ에도 표시됩니다. 인증용 이메일·비밀번호 및 세션은 Supabase Auth가 처리합니다. 별도 이력서 데이터베이스 테이블은 필요하지 않습니다.

향후 계정별 이력서 저장을 추가할 경우 `auth.uid()`에 기반한 Row Level Security 정책과 게스트 데이터 이전 동의를 별도로 설계해야 합니다.

## 검증 상태

인증 API 경계 테스트 8개, 복구 URL·전용 화면 회귀 테스트 9개(총 17개)와 프로덕션 빌드가 통과했습니다. 비밀번호 갱신 성공 시 로그인 세션을 유지하고 편집기로 이동하며, 닫을 수 있는 성공 안내를 표시합니다. 실패 시 갱신 화면과 오류를 유지합니다. 실제 검증 결과는 위 연결 진행 상태에 기록했습니다. 다음 항목은 추가 계정으로 확인할 수 있습니다.

- 신규 이메일 가입과 이메일 확인, 잘못된 비밀번호 안내
- 새 비밀번호 저장 후 이메일·비밀번호 로그인 (사용자가 비밀번호를 직접 설정해야 함)
- 가입 전 작성한 이력서가 같은 브라우저에서 유지되는지
