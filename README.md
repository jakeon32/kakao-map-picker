# 카카오맵 주소 검색 및 좌표 픽킹 웹사이트

카카오맵 API를 활용하여 주소 검색, 지도 클릭으로 위치 선택, 좌표 정보 확인 및 클립보드 복사 기능을 제공하는 웹 애플리케이션입니다.

## 주요 기능

- **주소 검색**: 주소를 입력하여 해당 위치를 지도에서 찾기
- **지도 픽킹**: 지도를 클릭하여 정확한 위치 선택
- **좌표 표시**: 선택된 위치의 위도/경도 정보 실시간 표시
- **클립보드 복사**: 주소, 위도, 경도, 좌표를 한 번의 클릭으로 복사
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원

## 기술 스택

- **프론트엔드**: HTML5, CSS3, JavaScript (Vanilla)
- **API**: 카카오맵 JavaScript API
- **배포**: Vercel (Serverless Functions)

## 프로젝트 구조

```
kamap/
├── index.html          # 메인 HTML 페이지
├── app.js             # 카카오맵 연동 및 기능 구현
├── style.css          # 스타일링
├── api/
│   └── kakao-key.js   # API 키 제공 서버리스 함수
├── vercel.json        # Vercel 배포 설정
├── package.json       # 프로젝트 정보
├── .env.example       # 환경변수 예시
└── README.md          # 프로젝트 문서
```

## 설치 및 실행 방법

### 1. 카카오 개발자 계정 준비

1. [카카오 개발자 사이트](https://developers.kakao.com/)에 접속
2. 로그인 후 '내 애플리케이션' 메뉴로 이동
3. '애플리케이션 추가하기' 클릭
4. 앱 이름 입력 후 생성
5. '앱 키' 탭에서 **JavaScript 키** 복사

### 2. 플랫폼 등록 (중요!)

1. 애플리케이션 설정 페이지에서 '플랫폼' 메뉴 선택
2. 'Web 플랫폼 등록' 클릭
3. 사이트 도메인 등록:
   - 로컬 개발: `http://localhost:3000`
   - Vercel 배포: `https://your-app-name.vercel.app`

### 3. 로컬 개발 환경 설정

```bash
# Vercel CLI 설치 (전역)
npm install -g vercel

# 프로젝트 폴더로 이동
cd kamap

# 환경변수 설정 (.env.example 참고)
# .env 파일을 생성하고 카카오 API 키 입력
echo "KAKAO_API_KEY=your_kakao_javascript_api_key_here" > .env

# 로컬 개발 서버 실행
vercel dev
```

브라우저에서 `http://localhost:3000` 접속

### 4. Vercel 배포

```bash
# Vercel 로그인
vercel login

# 프로젝트 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 5. Vercel 환경변수 설정

배포 후 반드시 환경변수를 설정해야 합니다:

#### 방법 1: Vercel 웹 대시보드

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 배포한 프로젝트 선택
3. 'Settings' 탭 클릭
4. 'Environment Variables' 메뉴 선택
5. 새 환경변수 추가:
   - **Name**: `KAKAO_API_KEY`
   - **Value**: 복사한 카카오 JavaScript 키
   - **Environment**: Production, Preview, Development 모두 선택
6. 'Save' 클릭
7. 프로젝트 재배포 (Deployments 탭에서 최신 배포를 Redeploy)

#### 방법 2: Vercel CLI

```bash
# 환경변수 추가
vercel env add KAKAO_API_KEY

# 값 입력 후 환경 선택 (Production, Preview, Development)
# 재배포
vercel --prod
```

## 사용 방법

1. **주소 검색**
   - 검색창에 주소 입력 (예: "서울시 강남구 테헤란로")
   - '검색' 버튼 클릭 또는 Enter 키 입력
   - 해당 위치로 지도 이동 및 마커 표시

2. **지도 클릭**
   - 지도의 원하는 위치를 클릭
   - 자동으로 마커가 생성되고 주소와 좌표 정보 표시

3. **정보 복사**
   - 각 정보 옆의 📋 버튼 클릭
   - 클립보드에 자동 복사
   - 복사 성공 시 알림 메시지 표시

## 보안 고려사항

- API 키는 절대 코드에 직접 포함하지 않습니다
- 환경변수를 통해 서버리스 함수에서만 키를 제공
- `.env` 파일은 `.gitignore`에 포함되어 Git에 커밋되지 않음
- Vercel 환경변수는 암호화되어 안전하게 저장됨

## 트러블슈팅

### 지도가 표시되지 않는 경우

1. 카카오 API 키가 올바른지 확인
2. 카카오 개발자 사이트에서 플랫폼 도메인이 등록되었는지 확인
3. 브라우저 콘솔에서 에러 메시지 확인
4. Vercel 환경변수가 올바르게 설정되었는지 확인

### API 키 오류가 발생하는 경우

```
Error: API key not configured
```

- Vercel 대시보드에서 환경변수 설정 확인
- 환경변수 이름이 정확히 `KAKAO_API_KEY`인지 확인
- 프로젝트 재배포 필요

### CORS 오류가 발생하는 경우

- 카카오 개발자 사이트에서 현재 도메인이 플랫폼에 등록되었는지 확인
- `http://` vs `https://` 프로토콜 일치 여부 확인

## 라이선스

MIT License

## 참고 자료

- [카카오맵 API 문서](https://apis.map.kakao.com/web/)
- [Vercel 문서](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
