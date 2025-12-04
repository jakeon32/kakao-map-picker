# 개발 노트 (Development Notes)

## 프로젝트 개요

카카오맵과 구글맵 API를 통합한 주소 검색 및 좌표 픽킹 웹 애플리케이션

## 최근 작업 내역

### 2024 - 구글맵 통합 및 UI 개선

#### 1. 구글맵 통합 (Google Maps Integration)
- **구현 내용**:
  - 카카오맵과 구글맵을 탭으로 전환하는 듀얼 맵 시스템 구현
  - 각 지도 독립적 초기화로 한쪽 API 키가 없어도 다른 지도 사용 가능
  - 지도 간 위치 자동 동기화
  - Google Places API를 활용한 장소명 검색 지원

- **주요 파일**:
  - `api/google-key.js`: 구글 API 키 제공 서버리스 함수
  - `app.js`: 듀얼 맵 시스템 로직
  - `.env.example`: GOOGLE_MAPS_API_KEY 환경변수 추가

- **기술적 구현**:
  ```javascript
  // 독립적 초기화 패턴
  let availableMaps = { kakao: false, google: false };

  // 각 맵 초기화를 try-catch로 독립 처리
  try {
    await loadKakaoApiKey();
    await loadKakaoMapScript();
    initKakaoMap();
    availableMaps.kakao = true;
  } catch (error) {
    disableMapTab('kakao');
  }

  // 조건부 동기화
  if (availableMaps.google && googleMap) {
    updateGoogleMapPosition(lat, lng);
  }
  ```

#### 2. 지도 탭 UI 개선
- **변경 사항**:
  - 초기 디자인: 그라디언트 배경, 복잡한 애니메이션
  - 최종 디자인: 미니멀 언더라인 기반 탭
  - 텍스트 크기: 0.9375rem → 1.0625rem
  - 언더라인 두께: 3px → 4px
  - 탭과 지도 사이 간격 추가 (margin-bottom)

- **스타일 코드**:
  ```css
  .map-tab {
    flex: 1;
    padding: 1rem 1.5rem 1.25rem;
    background: transparent;
    border: none;
    border-bottom: 4px solid transparent;
    color: var(--color-text-muted);
    font-size: 1.0625rem;
    font-weight: 600;
  }

  .map-tab.active {
    color: var(--color-accent);
    border-bottom-color: var(--color-accent);
  }
  ```

#### 3. 검색 입력창 스타일 개선
- **구현 내용**:
  - 검색박스 테두리 강화 (1px → 2px)
  - inset shadow로 깊이감 표현
  - focus 시 gradient 테두리 효과 (::before pseudo-element)
  - 4px outline glow 효과
  - input field에 subtle 배경색 및 hover/focus 인터랙션
  - 라이트/다크 모드 완벽 지원

- **주요 효과**:
  ```css
  .search-box::before {
    /* Gradient border effect */
    background: linear-gradient(135deg,
      rgba(100, 255, 218, 0.2),
      rgba(0, 212, 255, 0.1));
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
  }

  .search-box:focus-within::before {
    opacity: 1;
  }

  .search-box:focus-within {
    box-shadow:
      var(--shadow-glow),
      inset 0 1px 2px rgba(255, 255, 255, 0.15),
      0 0 0 4px rgba(100, 255, 218, 0.1);
    transform: translateY(-2px);
  }
  ```

## 현재 프로젝트 구조

```
kamap/
├── index.html          # 메인 HTML (듀얼 맵 탭 구조)
├── app.js             # 카카오맵 & 구글맵 통합 로직
├── style.css          # 반응형 스타일 (다크/라이트 모드)
├── api/
│   ├── kakao-key.js   # 카카오 API 키 서버리스 함수
│   └── google-key.js  # 구글 API 키 서버리스 함수
├── vercel.json        # Vercel 배포 설정
├── package.json       # 프로젝트 메타데이터
├── .env.example       # 환경변수 템플릿
├── .gitignore         # Git 제외 파일 목록
├── README.md          # 프로젝트 문서
└── DEVNOTES.md        # 개발 노트 (이 파일)
```

## 주요 기능

### 1. 듀얼 맵 시스템
- ✅ 카카오맵 ↔ 구글맵 탭 전환
- ✅ 독립적 API 초기화 (한쪽 실패해도 다른 쪽 동작)
- ✅ 지도 간 위치 자동 동기화
- ✅ 사용 불가능한 맵 탭 자동 비활성화

### 2. 검색 기능
- ✅ 장소명 검색 (카카오: Places API, 구글: Places API)
- ✅ 주소 검색 (카카오: Geocoder, 구글: Geocoding API)
- ✅ Fallback 로직 (장소명 → 주소 순으로 검색)
- ✅ Enter 키 지원

### 3. 지도 상호작용
- ✅ 지도 클릭으로 위치 선택
- ✅ 마커 표시 및 업데이트
- ✅ 역지오코딩 (좌표 → 주소)
- ✅ 위도/경도 정보 실시간 표시

### 4. 클립보드 복사
- ✅ 주소 복사
- ✅ 위도 복사
- ✅ 경도 복사
- ✅ 좌표 (위도, 경도) 복사
- ✅ 복사 성공 토스트 알림

### 5. UI/UX
- ✅ 다크/라이트 모드 자동 전환
- ✅ 반응형 디자인 (모바일, 태블릿, 데스크톱)
- ✅ Glassmorphism 디자인
- ✅ 부드러운 애니메이션 효과
- ✅ 접근성 고려 (prefers-reduced-motion)

### 6. 보안
- ✅ API 키 서버리스 함수로 보호
- ✅ 환경변수 사용
- ✅ CORS 설정

## 기술 스택

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom properties, Flexbox, Grid, Media queries
- **JavaScript (Vanilla)**: ES6+, Async/Await, Fetch API

### APIs
- **Kakao Maps JavaScript API**
  - Maps API
  - Places API
  - Geocoder
- **Google Maps JavaScript API**
  - Maps JavaScript API
  - Places API
  - Geocoding API

### Deployment
- **Vercel**
  - Serverless Functions
  - Environment Variables
  - Automatic HTTPS

## 환경 설정

### 필수 환경변수
```bash
KAKAO_API_KEY=your_kakao_javascript_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 로컬 개발
```bash
# Vercel CLI로 로컬 서버 실행
vercel dev

# 브라우저에서 접속
http://localhost:3000
```

### 프로덕션 배포
```bash
# 환경변수 설정 후
vercel --prod
```

## 알려진 이슈 및 제한사항

### 1. API 의존성
- 카카오맵 또는 구글맵 API 키가 없으면 해당 지도 사용 불가
- 최소 하나의 API 키는 필수

### 2. 브라우저 호환성
- IE 11 미지원 (ES6+ 문법 사용)
- 모던 브라우저 권장 (Chrome, Firefox, Safari, Edge)

### 3. 지도 제한사항
- 구글맵 무료 할당량: 월 $200 크레딧 (대부분 충분)
- 카카오맵: 플랫폼 도메인 등록 필요

## 향후 개선 계획

### 우선순위 높음
- [ ] 검색 기록 저장 (LocalStorage)
- [ ] 즐겨찾기 기능
- [ ] 거리 측정 도구

### 우선순위 중간
- [ ] 경로 탐색 기능
- [ ] 다중 마커 지원
- [ ] 마커 라벨 커스터마이징

### 우선순위 낮음
- [ ] 지도 스타일 커스터마이징
- [ ] KML/GPX 파일 import/export
- [ ] 오프라인 지도 캐싱

## 성능 최적화

### 현재 적용된 최적화
- ✅ API 스크립트 지연 로딩
- ✅ 이미지 없음 (SVG 아이콘 사용)
- ✅ CSS 변수로 재사용성 향상
- ✅ 애니메이션 최적화 (transform, opacity만 사용)

### 추가 고려사항
- Debounce 검색 입력
- 지도 타일 캐싱
- Service Worker 활용

## 디자인 시스템

### 색상 팔레트 (다크 모드)
```css
--color-primary: #0a192f;        /* Deep Navy */
--color-secondary: #112240;      /* Navy */
--color-accent: #64ffda;         /* Cyan/Teal */
--color-accent-secondary: #00d4ff; /* Bright Cyan */
--color-text: #e6f1ff;           /* Light Blue-White */
--color-text-muted: #8892b0;     /* Muted Blue-Gray */
```

### 색상 팔레트 (라이트 모드)
```css
--color-primary: #f8fafc;        /* Light Gray */
--color-secondary: #f1f5f9;      /* Lighter Gray */
--color-accent: #0ea5e9;         /* Sky Blue */
--color-accent-secondary: #06b6d4; /* Cyan */
--color-text: #0f172a;           /* Dark Slate */
--color-text-muted: #64748b;     /* Slate Gray */
```

### 간격 시스템
```css
--spacing-xs: 0.5rem;   /* 8px */
--spacing-sm: 1rem;     /* 16px */
--spacing-md: 1.5rem;   /* 24px */
--spacing-lg: 2rem;     /* 32px */
--spacing-xl: 3rem;     /* 48px */
```

## 트러블슈팅 가이드

### 지도가 표시되지 않는 경우
1. 브라우저 콘솔에서 에러 확인
2. API 키 설정 확인 (Vercel 환경변수)
3. 도메인 등록 확인 (카카오 개발자 사이트, Google Cloud Console)
4. 네트워크 탭에서 API 요청 실패 확인

### CORS 에러
- 카카오: 플랫폼 도메인 등록 확인
- 구글: HTTP 리퍼러 설정 확인

### 지도 간 동기화 안됨
- 양쪽 지도가 모두 초기화되었는지 확인
- availableMaps 객체 상태 확인
- 콘솔 에러 메시지 확인

## 커밋 히스토리 주요 마일스톤

```
12371bc - Improve: 검색 입력창 스타일 개선
148a56d - Improve: 지도 높이를 뷰포트 기반 반응형으로 변경
d3243ee - Fix: 지도가 영역에 제대로 표시되지 않는 문제 수정
(구글맵 통합 관련 커밋들)
(초기 프로젝트 설정)
```

## 참고 자료

### API 문서
- [Kakao Maps API](https://apis.map.kakao.com/web/)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Google Places API](https://developers.google.com/maps/documentation/places/web-service)

### 배포 플랫폼
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)

### 디자인 참고
- Glassmorphism UI Trend
- Dark/Light Mode Best Practices
- Accessible Color Contrast (WCAG 2.1)

---

**마지막 업데이트**: 2024
**작성자**: Claude Code
**프로젝트 버전**: 1.0.0
