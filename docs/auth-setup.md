# 이메일 가입·Google 로그인 연결

## 2026-11-20 연결 진행 상태

- Supabase 프로젝트 `qccbcnoslaglgyrlaalo` 생성 완료 (도쿄).
- 운영 Site URL과 `#builder`, `#reset-password` 복귀 주소 저장 완료.
- Email 제공자 활성 및 이메일 확인 필수 상태를 공개 Auth settings API로 확인.
- 로컬 `.env.local`에 프로젝트 URL과 publishable key 연결 완료. 이 파일은 Git에서 제외.
- Google Cloud `rireki-easy`의 `Rireki Easy Web` OAuth 클라이언트 생성 완료.
- Google 승인 원본: `https://rireki-easy.pages.dev`
- Google 콜백: `https://qccbcnoslaglgyrlaalo.supabase.co/auth/v1/callback`
- **미완료:** Google Client Secret의 Supabase 저장·제공자 활성화, Google 앱 프로덕션 게시 여부 확인, 새 환경변수 반영 배포, 실제 인증 왕복 검증.
- 브라우저 연결 중단으로 위 미완료 단계에서 멈췄으며, 현재 공개 사이트가 인증 활성화되었다고 간주하면 안 됩니다.

Google 클라이언트 생성 결과 대화상자의 비밀키를 저장하기 전 닫지 마세요. 비밀키는 Supabase Google 제공자에만 저장하고 소스코드·문서·프런트엔드에 넣지 않습니다. 대화상자가 이미 닫혔다면 기존 비밀키를 재조회할 수 있는 것으로 가정하지 말고 Google 콘솔의 비밀키 관리 절차를 따릅니다.

Supabase 기본 이메일 발송은 운영 SMTP를 대체하지 않습니다. 실제 회원가입 공개 전에 기본 발송의 수신자 제한·발송 한도를 확인하고 운영 SMTP를 연결해야 합니다. 이메일 확인을 끄는 방식으로 우회하지 않습니다.

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

이메일 가입 → 이메일 확인 → 로그인 흐름을 지원합니다. 비밀번호 찾기에서는 재설정 메일을 발송하며, 링크를 열면 새 비밀번호를 입력할 수 있습니다. PKCE를 사용하므로 확인·재설정 링크는 요청한 브라우저에서 여는 것을 권장합니다.

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

실제 Supabase·Google 프로젝트 자격 증명은 제공되지 않았으므로 운영 제공자에 대한 가입·메일 발송·OAuth 왕복은 실행하지 않았습니다. 인증 API 경계는 모킹 테스트로 검증하며, 프로젝트 연결 후 다음 항목을 실제 계정으로 확인합니다.

- 신규 이메일 가입과 이메일 확인, 잘못된 비밀번호 안내
- 재방문 세션 복원과 로그아웃
- Google 동의 화면 및 편집기 복귀
- 비밀번호 재설정 링크와 새 비밀번호 로그인
- 가입 전 작성한 이력서가 같은 브라우저에서 유지되는지
