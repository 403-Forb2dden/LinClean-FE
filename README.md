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

아래 구조는 `dev` 브랜치에 머지된 기능 PR(#15-#20)의 파일별 역할 설명을 기준으로 정리했습니다.

```text
LinClean/
├── app/                                      # expo-router 파일 기반 라우팅 루트
│   ├── _layout.tsx                           # 앱 루트 레이아웃, 전역 ThemeProvider, GestureHandlerRootView, Stack 설정
│   ├── index.tsx                             # 앱 최초 진입 시 로그인 화면으로 리다이렉트
│   ├── modal.tsx                             # 루트 Stack에서 push되는 공통 모달 화면
│   ├── (auth)/                               # 인증 전용 라우트 그룹
│   │   ├── _layout.tsx                       # 인증 화면 Stack 레이아웃
│   │   └── login.tsx                         # 카카오 로그인 화면 UI, OAuth 연동 전 임시 홈 진입 처리
│   └── (tabs)/                               # 하단 탭 네비게이션 라우트 그룹
│       ├── _layout.tsx                       # 커스텀 하단 탭바 연결, 저장 링크 Provider 범위 설정
│       ├── (home)/                           # 홈, 스캔, 저장 링크, 설정 관련 화면 Stack
│       │   ├── _layout.tsx                   # 홈 탭 내부 Stack 레이아웃
│       │   ├── index.tsx                     # 홈 메인 화면
│       │   ├── add-link.tsx                  # URL 입력 및 추가 화면
│       │   ├── scanning.tsx                  # URL 분석 진행 화면
│       │   ├── scan-result.tsx               # 안전 결과 화면 및 외부 URL 열기 처리
│       │   ├── scan-result-caution.tsx       # 주의 결과 화면 및 외부 URL 열기 처리
│       │   ├── scan-result-block.tsx         # 차단 결과 화면
│       │   ├── saved-links.tsx               # 저장 링크 목록, 필터, 북마크, 삭제 화면
│       │   ├── settings.tsx                  # 설정 메인 화면
│       │   ├── notices.tsx                   # 공지사항 목록 화면
│       │   ├── how-to-use.tsx                # 서비스 이용방법 안내 화면
│       │   ├── terms.tsx                     # 서비스 이용약관 화면
│       │   └── privacy.tsx                   # 개인정보 처리방침 화면
│       ├── (folder)/                         # 폴더 관리 화면 Stack
│       │   ├── _layout.tsx                   # 폴더 Stack 레이아웃, Folders/SavedLinks Provider 연결
│       │   ├── index.tsx                     # 폴더 목록 화면
│       │   ├── [id].tsx                      # 폴더 상세 및 폴더 내 링크 관리 화면
│       │   ├── folder-name.tsx               # 새 폴더 이름 입력 화면
│       │   ├── folder-url-select.tsx         # 폴더에 담을 저장 링크 선택 화면
│       │   └── folder-add-url.tsx            # 폴더 생성 후 URL 추가 흐름 화면
│       └── (explore)/                        # 개발/확인용 숨김 라우트 그룹
│           ├── _layout.tsx                   # explore Stack 레이아웃
│           └── index.tsx                     # 임시 확인용 화면
│
├── components/                               # 재사용 가능한 UI 컴포넌트
│   ├── themed-text.tsx                       # 라이트/다크 테마에 반응하는 텍스트 컴포넌트
│   ├── themed-view.tsx                       # 라이트/다크 테마에 반응하는 View 컴포넌트
│   ├── haptic-tab.tsx                        # 탭 터치 시 햅틱 피드백을 주는 래퍼
│   ├── hello-wave.tsx                        # 웨이브 애니메이션 데모 컴포넌트
│   ├── parallax-scroll-view.tsx              # 헤더 이미지 패럴럭스 스크롤뷰
│   ├── external-link.tsx                     # 외부 링크를 인앱 브라우저로 여는 링크
│   └── ui/                                   # 앱 공통 UI 프리미티브
│       ├── button.tsx                        # 앱 전반에서 사용하는 기본 버튼
│       ├── action-icon-button.tsx            # 아이콘 기반 액션 버튼
│       ├── app-icon.tsx                      # 앱 내부에서 재사용하는 아이콘 래퍼
│       ├── scan-button.tsx                   # URL 스캔 진입용 원형 버튼
│       ├── card-link.tsx                     # 저장 링크 카드
│       ├── swipeable-card-link.tsx           # 스와이프 액션을 지원하는 저장 링크 카드
│       ├── folder-card.tsx                   # 폴더 목록 카드
│       ├── folder-icon.tsx                   # 폴더 활성/비활성 이미지 아이콘
│       ├── add-folder-button.tsx             # 폴더 추가 버튼
│       ├── folder-context-menu.tsx           # 링크/폴더 더보기 메뉴
│       ├── filter-chip.tsx                   # 저장 링크 필터 칩
│       ├── bookmark-chip.tsx                 # 북마크 상태 칩
│       ├── bottom-tab-bar.tsx                # 홈/링크 추가/폴더용 커스텀 하단 탭바
│       ├── result-status-icon.tsx            # 스캔 결과 상태 아이콘
│       ├── check-icon.tsx                    # 체크 상태 아이콘
│       ├── kakao-icon.tsx                    # 카카오 브랜드 아이콘
│       ├── section-header.tsx                # 섹션 제목 컴포넌트
│       ├── toast.tsx                         # 피드백 메시지 UI
│       ├── collapsible.tsx                   # 접기/펼치기 가능한 섹션 컴포넌트
│       ├── icon-symbol.tsx                   # Android/Web 아이콘 이름 매핑
│       └── icon-symbol.ios.tsx               # iOS SF Symbols 아이콘 구현
│
├── context/                                  # 백엔드 연동 전 mock 상태 관리
│   ├── saved-links-context.tsx               # 저장 링크 mock 데이터, CRUD, 북마크, 폴더 지정/해제 상태 관리
│   └── folders-context.tsx                   # 폴더 mock 데이터, 생성/수정/삭제 상태 관리
│
├── constants/                                # 앱 전역 상수
│   └── theme.ts                              # 브랜드 컬러, 카카오 컬러, 폰트, 타이포그래피 토큰
│
├── hooks/                                    # 커스텀 React 훅
│   ├── use-color-scheme.ts                   # 네이티브 시스템 컬러 스킴 감지
│   ├── use-color-scheme.web.ts               # 웹 전용 컬러 스킴 훅
│   └── use-theme-color.ts                    # 현재 테마에 맞는 색상 값을 반환하는 헬퍼
│
├── assets/                                   # 정적 에셋
│   ├── images/                               # 앱 아이콘, 스플래시, 로그인/폴더 이미지 리소스
│   │   ├── icon.png                          # iOS/기본 앱 아이콘
│   │   ├── favicon.png                       # 웹 파비콘
│   │   ├── splash-icon.png                   # 스플래시 스크린 이미지
│   │   ├── android-icon-*.png                # Android 적응형 아이콘
│   │   ├── ic_kakao.png                      # 카카오 로그인 버튼 아이콘
│   │   ├── login_wordmark.png                # 로그인 화면 LinClean 워드마크
│   │   ├── folder_active.png                 # 활성 폴더 탭/카드 아이콘
│   │   ├── folder_unactive.png               # 비활성 폴더 탭/카드 아이콘
│   │   └── react-logo*.png                   # Expo 템플릿 데모 이미지
│   └── animations/
│       └── scanning.json                     # 스캔 진행 화면 애니메이션 에셋
│
├── scripts/
│   └── reset-project.js                      # 예제 코드를 app-example/로 옮기고 빈 app/ 생성
│
├── app.json                                  # Expo 설정
├── eas.json                                  # EAS Build 프로파일
├── package.json                              # 의존성 및 npm 스크립트
├── package-lock.json                         # npm 의존성 잠금 파일
├── tsconfig.json                             # TypeScript 컴파일러 설정
├── eslint.config.js                          # ESLint 설정
├── expo-env.d.ts                             # Expo 타입 선언
└── README.md
```

### 라우팅 구조 요약

- **루트 Stack** (`app/_layout.tsx`): `(tabs)` 그룹과 `modal` 화면을 등록합니다.
- **인증 Stack** (`app/(auth)`): `/login` 진입 화면을 담당합니다.
- **탭 Stack** (`app/(tabs)`): 홈 화면을 중심으로 커스텀 하단 탭바를 렌더링하고, explore 라우트는 개발 확인용으로 숨깁니다.
- **홈 Stack** (`app/(tabs)/(home)`): 홈, URL 추가, 스캔 진행/결과, 저장 링크, 설정/문서형 화면을 관리합니다.
- **폴더 Stack** (`app/(tabs)/(folder)`): 폴더 목록, 상세, 폴더 생성, 저장 링크 선택 흐름을 관리합니다.

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

## 참고 자료

- [Expo 공식 문서](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
