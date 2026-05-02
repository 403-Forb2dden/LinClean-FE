# LinClean

Expo 기반의 React Native 모바일 애플리케이션 프로젝트입니다. Expo Router의 파일 기반 라우팅과 네이티브 UI 패턴을 활용합니다.

---

## 기술 스택

### 코어 런타임
| 분류 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | [Expo SDK](https://docs.expo.dev/) | `~54.0.33` |
| 라이브러리 | [React Native](https://reactnative.dev/) | `0.81.5` |
| 라이브러리 | [React](https://react.dev/) | `19.1.0` |
| 언어 | [TypeScript](https://www.typescriptlang.org/) | `~5.9.2` |
| 아키텍처 | New Architecture (Fabric + TurboModules) | enabled |
| 컴파일러 | React Compiler | enabled (experimental) |

### 네비게이션 / 라우팅
- **expo-router** `~6.0.23` — 파일 기반 라우팅
- **@react-navigation/native** `^7.1.8`
- **@react-navigation/bottom-tabs** `^7.4.0`
- **@react-navigation/elements** `^2.6.3`
- **typedRoutes** 실험 기능 활성화

### UI / UX
- **react-native-reanimated** `~4.1.1` — 네이티브 애니메이션
- **react-native-gesture-handler** `~2.28.0` — 제스처 처리
- **react-native-screens** `~4.16.0` — 네이티브 화면 최적화
- **react-native-safe-area-context** `~5.6.0` — Safe Area 대응
- **expo-haptics** — 햅틱 피드백
- **expo-image** — 고성능 이미지
- **expo-symbols** — iOS SF Symbols
- **@expo/vector-icons** — 크로스 플랫폼 아이콘

### 시스템 통합
- **expo-dev-client** — 커스텀 개발 클라이언트
- **expo-splash-screen** — 스플래시 화면
- **expo-status-bar** — 상태바 제어
- **expo-system-ui** — 시스템 UI 제어
- **expo-font** — 커스텀 폰트 로드
- **expo-constants**, **expo-linking**, **expo-web-browser**

### 빌드 / 배포
- **EAS Build** (`eas.json` 구성, projectId: `9f3fa2dd-b6df-4b43-ae10-02abc4235e6a`)
- **Android 패키지**: `com.dkdododo.LinClean`
- **스킴**: `linclean`
- **웹 출력**: `static`

### 개발 도구
- **ESLint 9** + **eslint-config-expo**
- Android Emulator 연동 확인 완료

---

## 디렉토리 구조

```text
LinClean/
├── app/                              # expo-router 파일 기반 라우팅 루트. 이 디렉토리의 파일 경로가 곧 앱의 화면 경로가 됨
│   ├── _layout.tsx                   # 앱 전역 루트 레이아웃 (테마 Provider, Stack 설정, 모달 등록)
│   ├── modal.tsx                     # 루트 Stack에서 push되는 공통 모달 화면
│   └── (tabs)/                       # 그룹 라우트 — URL에 노출되지 않음. 하단 탭 전용 네임스페이스
│       ├── _layout.tsx               # 하단 탭 바 구성 (Tabs 네비게이터, 아이콘/라벨 지정)
│       ├── (home)/                   # 홈 탭 전용 그룹 라우트 (독립된 Stack)
│       │   ├── _layout.tsx           # 홈 탭 내부 Stack 레이아웃 (탭 내 push 네비게이션 지원)
│       │   └── index.tsx             # 홈 탭 첫 화면
│       └── (explore)/                # 탐색 탭 전용 그룹 라우트 (독립된 Stack)
│           ├── _layout.tsx           # 탐색 탭 내부 Stack 레이아웃
│           └── index.tsx             # 탐색 탭 첫 화면
│
├── components/                       # 재사용 가능한 UI 컴포넌트
│   ├── themed-text.tsx               # 라이트/다크 테마에 반응하는 텍스트 컴포넌트
│   ├── themed-view.tsx               # 라이트/다크 테마에 반응하는 View 컴포넌트
│   ├── haptic-tab.tsx                # 탭 터치 시 햅틱 피드백을 주는 래퍼
│   ├── hello-wave.tsx                # 웨이브 애니메이션 데모 컴포넌트 (reanimated 사용)
│   ├── parallax-scroll-view.tsx      # 헤더 이미지가 패럴럭스로 동작하는 스크롤뷰 (iOS 권장)
│   ├── external-link.tsx             # 외부 링크를 인앱 브라우저(expo-web-browser)로 여는 링크
│   └── ui/                           # 저수준 UI 프리미티브
│       ├── collapsible.tsx           # 접기/펼치기 가능한 섹션 컴포넌트
│       ├── icon-symbol.tsx           # 크로스 플랫폼 아이콘 (기본 구현, Android/Web용)
│       └── icon-symbol.ios.tsx       # iOS 전용 SF Symbols 구현 (플랫폼 확장자 자동 해석)
│
├── constants/                        # 앱 전역 상수 정의
│   └── theme.ts                      # 컬러 팔레트 + 폰트 패밀리 정의 (라이트/다크 대응)
│
├── hooks/                            # 커스텀 React 훅
│   ├── use-color-scheme.ts           # 시스템 컬러 스킴(라이트/다크) 감지 — 네이티브 기본 구현
│   ├── use-color-scheme.web.ts       # 웹 전용 컬러 스킴 훅 (하이드레이션 이슈 대응)
│   └── use-theme-color.ts            # 현재 테마에 맞는 색상 값을 반환하는 헬퍼
│
├── assets/                           # 정적 에셋
│   └── images/                       # 아이콘, 스플래시, 로고 등 이미지 리소스
│       ├── icon.png                  # iOS/기본 앱 아이콘
│       ├── favicon.png               # 웹 파비콘
│       ├── splash-icon.png           # 스플래시 스크린 이미지
│       ├── android-icon-*.png        # Android 적응형 아이콘 (foreground/background/monochrome)
│       └── react-logo*.png           # 데모용 로고 이미지
│
├── scripts/                          # 프로젝트 유틸리티 스크립트
│   └── reset-project.js              # 예제 코드를 app-example/로 옮기고 빈 app/ 생성 (신규 프로젝트 초기화용)
│
├── app.json                          # Expo 설정 (앱 이름, 아이콘, 플러그인, 권한, 플랫폼별 설정)
├── eas.json                          # EAS Build 프로파일 (development / preview / production)
├── package.json                      # 의존성 및 npm 스크립트
├── tsconfig.json                     # TypeScript 컴파일러 설정
├── eslint.config.js                  # ESLint 설정 (expo 프리셋)
├── expo-env.d.ts                     # Expo 타입 선언
├── STRUCTURE_CHANGES.txt             # 2026-04-21 구조 변경 이력 (building-native-ui SKILL 적용 내역)
└── README.md
```

### 라우팅 구조 요약

- **루트 Stack** (`app/_layout.tsx`) → `(tabs)` 그룹 + `modal` 화면
- **하단 탭** (`app/(tabs)/_layout.tsx`) → `(home)` / `(explore)` 두 탭
- **각 탭 내부**는 독립된 Stack을 가지며, 탭 전용 하위 화면을 `(home)/detail/[id].tsx` 같은 형태로 추가 가능

> 상세한 구조 개편 배경은 [STRUCTURE_CHANGES.txt](./STRUCTURE_CHANGES.txt)를 참고하세요.

---

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 빌드 실행

Expo Go가 아닌 **커스텀 개발 클라이언트**(`expo-dev-client`)를 사용합니다. 네이티브 모듈이 포함되어 있으므로 최초 1회는 EAS 빌드가 필요합니다.

```bash
# 최초 1회 또는 네이티브 변경 시
eas build --profile development --platform android
eas build:run -p android      # 빌드된 APK를 에뮬레이터/디바이스에 설치
```

---

## 일상적인 개발 빌드 실행

네이티브 모듈 변경이 없다면 아래 두 단계만으로 개발이 가능합니다.

```bash
# 1. 디바이스/에뮬레이터의 앱 실행 (아이콘 탭 또는 adb 명령)
adb shell monkey -p com.dkdododo.LinClean -c android.intent.category.LAUNCHER 1

# 2. Metro 서버 시작
npx expo start --dev-client
```

### 언제 `eas build:run`을 다시 해야 하나?

다음 상황에서는 **반드시** 네이티브 빌드를 새로 해야 합니다.

| 상황 | 예시 |
|------|------|
| `package.json`에 네이티브 모듈 추가 | `react-native-reanimated`, `expo-camera` 등 |
| `app.json`의 네이티브 관련 값 변경 | `plugins`, `permissions`, `android.package`, `scheme` 등 |
| Expo SDK 버전 업그레이드 | `expo`, `react-native` 메이저/마이너 변경 |

순수 JS/TS 코드 변경은 Metro가 핫 리로드로 반영하므로 재빌드가 필요하지 않습니다.

---

## npm 스크립트

| 스크립트 | 설명 |
|----------|------|
| `npm start` | Expo 개발 서버 시작 |
| `npm run android` | Android 에뮬레이터/디바이스에서 실행 |
| `npm run ios` | iOS 시뮬레이터에서 실행 |
| `npm run web` | 웹 모드로 실행 |
| `npm run lint` | ESLint 실행 |
| `npm run reset-project` | 예제 코드를 `app-example/`로 이동, 빈 `app/` 생성 |

---

## 백엔드 연동 현황

> 현재 모든 데이터는 React Context Mock 상태입니다. 백엔드 완성 후 아래 지점을 교체하세요.

### 기존 TODO 마커 (코드에 주석 있음)

| 파일 | 내용 | API |
|------|------|-----|
| `app/(auth)/login.tsx` | 카카오 OAuth 구현 | `POST /api/v1/auth/kakao/login` |
| `app/(tabs)/(home)/scanning.tsx` | 분석 요청 + 폴링 | `POST /analyses` → `GET /analyses/{id}` |
| `app/(tabs)/(home)/scan-result.tsx` | 링크 저장 | `POST /api/v1/saved-links` |
| `app/(tabs)/(home)/scan-result-caution.tsx` | 링크 저장 | `POST /api/v1/saved-links` |
| `app/(tabs)/(home)/notices.tsx` | 공지사항 목록 | `GET /api/v1/notices` |
| `app/(tabs)/(home)/settings.tsx` | 로그아웃 토큰 삭제 | `POST /api/v1/auth/logout` |
| `context/saved-links-context.tsx` | 링크 CRUD 전체 | `GET/POST/PATCH/DELETE /api/v1/saved-links` |
| `context/folders-context.tsx` | 폴더 CRUD 전체 | `GET/POST/PATCH/DELETE /api/v1/categories` |
| `app/(tabs)/(folder)/[id].tsx` | 북마크 토글, 폴더 제외 | `PATCH /saved-links/{id}/bookmark`, `PATCH /saved-links/{id}` |
| `app/(tabs)/(folder)/folder-url-select.tsx` | 폴더 생성 | `POST /api/v1/categories` |

### 추가로 필요한 TODO (마커 누락)

#### 🔴 기능 미구현

| 파일 | 위치 | 내용 | API |
|------|------|------|-----|
| `settings.tsx` | `<SettingRow label="회원탈퇴">` | `onPress` 자체 없음 | `DELETE /api/v1/members/me` |
| `settings.tsx` | `handleLogout` | `POST /auth/logout` refreshToken 무효화 호출 없음 | `POST /api/v1/auth/logout` |
| `notices.tsx` | 공지 항목 `onPress` | 공지 상세 진입 없음 | `GET /api/v1/notices/{id}` |
| `notices.tsx`, `saved-links.tsx` | 목록 하단 | cursor 기반 페이지네이션 미구현 | cursor 쿼리 파라미터 |
| `(home)/index.tsx` | 보안 등급별 현황 | placeholder만 존재 | 보류 항목 (디자인 확정 후) |
| `(folder)/index.tsx` | `linkCount` 계산 | 클라이언트에서 filter로 계산 중 → 서버 응답값 사용해야 함 | `GET /api/v1/categories` 응답의 `linkCount` |
| `folder-name.tsx` | `handleNext` | 폴더명 중복 409 처리 없음 | `CATEGORY_DUPLICATE_NAME` 에러 처리 |

#### 🟡 인프라 부재 (구조 자체 없음)

| 항목 | 내용 |
|------|------|
| **초기 데이터 로드** | Context Provider 마운트 시 `GET /saved-links`, `GET /categories` 호출하는 `useEffect` 없음 |
| **AuthContext** | accessToken/refreshToken 저장 (SecureStore) + 401 시 자동 갱신(`POST /auth/refresh`) 로직 부재 |
| **앱 부팅 인증 체크** | `app/_layout.tsx`에서 토큰 유무 → 미인증 시 `/login` redirect 없음 |
| **API 클라이언트** | `lib/api.ts` 없음. 공통 인터셉터 필요: `Authorization` 헤더 자동 부착, 401 → refresh, 에러 응답(`code/message/errors`) 파싱 |

#### 🟢 마커 일관성

`saved-links-context.tsx` 라인 151, 160, 165 주석이 `// 실제 구현 시 ...` 형태 → `// TODO:` 프리픽스로 통일하면 `grep "TODO:"` 일괄 추적 가능

### 연동 권장 순서

1. **AuthContext + API 클라이언트** — 토큰 관리 기반 구축
2. **로그인** (`login.tsx`) — 카카오 OAuth
3. **Context 교체** (`folders-context`, `saved-links-context`) — 초기 로드 + CRUD
4. **scanning.tsx** — 분석 요청/폴링
5. **scan-result** — 저장
6. **회원탈퇴 / 로그아웃** — 계정 관련
7. **notices.tsx** — 공지 목록 + 상세

---

## 참고 자료

- [Expo 공식 문서](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
