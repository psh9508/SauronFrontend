# SauronFrontend

사우론 테마의 로그인 페이지를 위한 프론트엔드 프로젝트입니다.

## 특징

- 화면 중앙 정렬 로그인 UI
- 용암이 흐르는 듯한 배경 애니메이션
- 움직이고 깜빡이는 `<사우론의 눈>` 오브젝트
- 아이디 / 비밀번호 입력 필드
- 강한 대비의 다크 판타지 버튼 스타일

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 기본 Vite 주소를 열면 로그인 화면을 볼 수 있습니다.

## 빌드

```bash
npm run build
npm run preview
```

## 코드 품질 도구

프로젝트에는 아래 도구가 설치되어 있습니다.

- ESLint: JavaScript/React 코드 규칙 검사
- Stylelint: CSS 규칙 검사
- Prettier: 포맷 통일
- Husky + lint-staged: 커밋 전 변경 파일만 자동 검사/수정

### 자주 쓰는 명령어

```bash
npm run lint
npm run lint:fix
npm run stylelint
npm run stylelint:fix
npm run format
npm run format:check
npm run check
npm run check:all
```

- `check`: 린트 + 스타일린트(기본 품질 게이트)
- `check:all`: `check` + Prettier 검사

## VS Code 추천 환경

- `.vscode/extensions.json`에 권장 확장 목록이 포함되어 있습니다.
- `.vscode/settings.json`에 저장 시 자동 포맷/자동 수정 설정이 포함되어 있습니다.

## 코덱스를 프론트엔드에 더 잘 쓰는 팁

- 작업 요청을 컴포넌트 단위로 쪼개기
  - 예: "로그인 모달 접근성만 먼저 개선"처럼 범위를 작게 지정
- 완료 조건을 명시하기
  - 예: "키보드 탭 이동 가능, lint warning 0" 같은 측정 가능한 기준 제시
- 디자인 제약을 함께 주기
  - 예: "오렌지/블랙 톤 유지, 모바일 360px에서 깨지지 않게"
- API 계약을 먼저 주기
  - 요청/응답 JSON 예시를 먼저 제공하면 UI/상태 코드 정확도가 크게 올라감
- 수정 전후 검증을 같이 요구하기
  - 예: "수정 후 `npm run check` 실행 결과까지 알려줘"
- 리팩터링은 안전 장치와 함께 요청하기
  - 예: "기능 변경 없이 중복만 제거, 파일 분리는 최대 2개"
- 접근성 개선은 단계적으로 요청하기
  - 1차: 시맨틱 태그
  - 2차: 키보드 포커스
  - 3차: ARIA 라벨

## 주요 파일

- `src/App.jsx`: 로그인 화면 구조
- `src/styles.css`: 용암 배경, 사우론의 눈, 로그인 UI 애니메이션 스타일
- `src/main.jsx`: 앱 진입점
