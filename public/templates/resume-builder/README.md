# Unified editor compatibility entry

이 주소는 독립 앱이 아니라 메인 서비스의 /#builder 로 연결되는 호환 진입점입니다.

첫 번째 시안의 카드형 폼·파란색 UI·고정 미리보기·모바일 미리보기 전환은 src/components/Builder.jsx 및 src/unified.css로 이식했습니다. 로그인·클라우드·PDF/Word·결제 기능과 같은 React 편집기를 사용합니다.

기존 folio.resume-template.v1 데이터는 지우지 않습니다. 메인 초안이 없으면 자동 변환하고, 두 초안이 모두 있으면 선택해서 가져올 수 있습니다. 이식 로직은 src/lib/legacy-draft.js에 있습니다. 같은 도메인/브라우저의 localStorage를 읽으며, 다른 기기에서의 복원은 클라우드 기능 연결 후 로그인하여 사용합니다.
