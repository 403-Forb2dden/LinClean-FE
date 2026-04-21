# LinClean 프로젝트 컨벤션

본 문서는 LinClean 프로젝트의 Git / 코드 / 네이밍 컨벤션을 정리한 공식 가이드입니다.
모든 기여자와 AI 어시스턴트는 이 규칙을 준수해야 합니다.

---

## 1. Git 브랜치 전략 (Git Flow)

### 메인 브랜치

| 브랜치 | 역할 |
|---|---|
| `main` | 최종 배포 가능한 상태를 관리하는 브랜치 |
| `develop` | 배포 이전 개발용 코드를 통합 관리하는 브랜치 |

### feature 브랜치

새로운 기능 개발 및 버그 수정이 필요할 때마다 `develop`에서 분기하여 관리한다.

1. `develop` 브랜치에서 새로운 기능에 대한 feature 브랜치를 분기한다.
2. 새로운 기능에 대한 작업을 수행한다.
3. 작업이 끝나면 `develop` 브랜치로 PR을 통해 병합(merge)한다.
4. 더 이상 필요하지 않은 `feature` 브랜치는 삭제한다.
5. 작업 중인 `feature` 브랜치는 수시로 원격 저장소에 push 한다.

### 개발 흐름

1. Issue 생성 후, Issue에 맞는 브랜치를 생성한다.
2. 해당 브랜치로 checkout 후 기능 이름의 branch에서 개발을 진행한다.
3. 개발이 끝나면 `develop`에 PR을 통해 Merge 한다. (한 명 이상 리뷰어가 승인 시 Merge 가능)
4. 배포 조건이 충족되면 `develop` → `main`으로 팀장이 Merge 후 배포를 진행한다.

---

## 2. 브랜치 및 커밋 네이밍 타입

| 타입 | 설명 |
|---|---|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |
| `style` | 코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우 |
| `refactor` | 코드 리팩토링 |
| `design` | UI/UX 변경 (CSS, 디자인 변경, 이미지 추가 등) |
| `comment` | 필요한 주석 추가 및 변경 |
| `remove` | 파일 삭제 |
| `rename` | 파일 경로 변경 혹은 파일 이름 변경 |
| `test` | 테스트 코드 추가/수정 |
| `chore` | 빌드 업무 수정, 패키지 매니저 수정 |

---

## 3. 브랜치 / 커밋 네이밍 규칙

### 브랜치 네이밍

형식: `타입/#이슈번호/간단설명`

- `feat`는 `feature`가 아니라 **`feat`** 로 작성한다. (단, 문서 설명상 예시로 `feature/#이슈번호/간단설명` 형태가 등장할 수 있음)
- 나머지 타입은 커밋 컨벤션과 동일하게 적용한다.

예시:
- 로그인 기능 개발: `feat/#20/login`
- 로그인 기능 수정: `fix/#21/login`
- 로그인 리팩토링: `refactor/#30/login`

> 이슈번호는 issue 생성 시 자동 생성되는 번호를 기재한다.

### 커밋 메시지

형식: `<타입>: <설명>`

예시:
- 로그인 기능 API 연동 완료: `feat: 로그인 기능개발 완료`
- 로그인 버그 수정: `fix: 로그인시 팝업 오류 해결`

---

## 4. 코드 네이밍 컨벤션

| 대상 | 규칙 | 예시 |
|---|---|---|
| 폴더명 / 파일명 | `kebab-case` | `payment-complete-view.tsx` |
| 타입 / 인터페이스 | `PascalCase` | `User`, `OrderItem`, `TipInfoProps` |
| 함수 / 변수명 | `camelCase` | `user`, `orderItem`, `emotionDtos` |
| 훅 파일명 | `use-*.ts` | `use-fcm.ts` |
| 훅 함수명 | `useXxx()` | `useFcm()` |
| 환경 파일 | `.env` | `.env`, `.env.local` |

### 예시

**인터페이스 (PascalCase)**
```ts
export interface TipInfoProps {
  title: React.ReactNode;
  text?: React.ReactNode;
  className?: string;
}
```

**변수 / 함수 (camelCase)**
```ts
const emotionDtos = useMemo<EmotionDTO[]>(() => {
  const arr = entryData?.emotions as unknown;
  if (!Array.isArray(arr)) return [];
  // ...
}, [entryData?.emotions]);
```

**훅 (useXxx)**
```ts
export default function useFcm({
  vapidKey,
  swPath = '/firebase-messaging-sw.js',
  autoRequest = false,
}: UseFcmOptions) {
  // ...
}
```

---

## 5. Issue 템플릿

```markdown
---
name: 'Issue: Feature request'
about: '해당 이슈 템플릿을 활용하여 이슈를 작성해 주세요.'
title: ''
labels: ''
assignees: ''
---

## 📝 기능 설명

<!-- 어떤 기능을 추가하거나 개선하고 싶은지 설명해주세요. -->

## 📋 구현할 Task

- [ ]
- [ ]
- [ ]

## 📎 추가 내용 (선택)

<!-- 스크린샷, 참고 링크, 기타 관련 정보가 있다면 추가해주세요. -->
```

---

## 6. Pull Request 템플릿

```markdown
<!---- 'Closes #' 뒤에 완료한 이슈 번호를 작성해 주세요. ex) Closes #4 !-->

Closes #

<!---- 해당 PR에 대한 설명을 작성해 주세요. !-->

## 🎯 개요

## 💡 해결한 이슈 목록

- [ ] 새로운 기능 추가
- [ ] 버그 수정
- [ ] CSS 등 사용자 UI 디자인 변경
- [ ] 코드에 영향을 주지 않는 변경사항 (오타 수정, 탭 사이즈 변경, 변수명 변경)
- [ ] 코드 리팩토링
- [ ] 주석 추가 및 수정
- [ ] 문서 수정
- [ ] 테스트 추가, 테스트 리팩토링
- [ ] 빌드 부분 혹은 패키지 매니저 수정
- [ ] 파일 혹은 폴더명 수정
- [ ] 파일 혹은 폴더 삭제

## ✅ 체크 사항

<!---- PR이 다음 요구 사항을 충족하는지 확인하세요. !-->

- [ ] 커밋/코딩 컨벤션에 맞게 작성
- [ ] 변경 사항에 대한 테스트

<!---- UI 작업의 경우 변경된 이미지나 비디오를 첨부해 주세요. !-->

## 📷 Screenshots or Video

<!---- 없는 경우 삭제 부탁드립니다~! !-->
```

---

## 7. PR / Merge 규칙

- PR은 반드시 `develop` 브랜치를 대상으로 생성한다.
- **한 명 이상의 리뷰어 승인**을 받아야 Merge 가능하다.
- `develop` → `main` 병합 및 배포는 **팀장**이 담당한다.
- Merge 완료된 `feature` 브랜치는 삭제한다.

---

## 8. 작업 체크리스트 (커밋 전 확인)

- [ ] 브랜치명이 `타입/#이슈번호/간단설명` 형식에 맞는가?
- [ ] 커밋 메시지가 `<타입>: <설명>` 형식에 맞는가?
- [ ] 파일명이 `kebab-case`로 작성되었는가?
- [ ] 타입/인터페이스는 `PascalCase`인가?
- [ ] 함수/변수는 `camelCase`인가?
- [ ] 훅 파일은 `use-*.ts`, 함수는 `useXxx()`인가?
- [ ] 이슈 번호가 PR 본문에 연결(`Closes #`)되어 있는가?
