# Loom - 초기 세팅 가이드

## 1. Supabase 프로젝트 생성

### 1.1 계정 생성
1. https://supabase.com 접속
2. GitHub 계정으로 가입
3. New Project 생성
4. 프로젝트 이름: `loom-production`
5. 리전: Northeast Asia (Tokyo) - 한국 사용자 기준 가장 빠름
6. 비밀번호 설정 (DB 접속용)

### 1.2 필요한 정보 메모
- Project URL: `https://xxxxx.supabase.co`
- Anon Key: `eyJhbGciOi...` (클라이언트용)
- Service Role Key: `eyJhbGciOi...` (서버용, 절대 클라이언트에 노출 금지)

### 1.3 DB 스키마 적용
1. SQL Editor 열기
2. `03-database-schema.sql` 파일 내용 붙여넣기
3. Run 실행

### 1.4 Storage 설정
1. Storage 탭 이동
2. New Bucket: `item-images`
3. Public: OFF
4. Allowed MIME: `image/jpeg, image/png, image/webp, image/heic`
5. Max file size: 10MB

### 1.5 Auth 설정
1. Authentication 탭 이동
2. Providers:
   - Email: ON (Confirm email: OFF for MVP)
   - Apple: ON (Apple Developer 설정 필요)

---

## 2. OpenAI API 설정

### 2.1 API 키 발급
1. https://platform.openai.com 접속
2. API Keys 메뉴
3. Create new secret key
4. 이름: `loom-production`
5. 키 안전하게 저장

### 2.2 Usage Limit 설정
1. Settings > Billing > Usage limits
2. Hard limit: $50/month (초기)
3. Soft limit: $30/month (알림용)

---

## 3. iOS 프로젝트 생성

### 3.1 Xcode 프로젝트
1. Xcode > New Project
2. iOS > App
3. Product Name: `Loom`
4. Organization Identifier: `com.yourname.loom`
5. Interface: SwiftUI
6. Language: Swift
7. Minimum Deployment: iOS 16.0

### 3.2 Swift Package 추가
```
File > Add Package Dependencies
```

추가할 패키지:
- `https://github.com/supabase/supabase-swift` (2.0+)
- `https://github.com/onevcat/Kingfisher` (7.0+)

### 3.3 환경변수 설정
Xcode > Scheme > Edit Scheme > Run > Environment Variables:
```
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_KEY = eyJhbGciOi...
```

또는 xcconfig 파일 사용 (추천):
```
// Config/Debug.xcconfig
SUPABASE_URL = https:$(/)$(/)xxxxx.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOi...
```

### 3.4 Info.plist 설정
```xml
<!-- Apple Sign In -->
<key>com.apple.developer.applesignin</key>
<array>
    <string>Default</string>
</array>

<!-- Photo Library -->
<key>NSPhotoLibraryUsageDescription</key>
<string>이미지를 저장하기 위해 사진 라이브러리 접근이 필요합니다.</string>

<!-- Camera (옵션) -->
<key>NSCameraUsageDescription</key>
<string>이미지를 촬영하기 위해 카메라 접근이 필요합니다.</string>
```

---

## 4. Edge Functions 배포

### 4.1 Supabase CLI 설치
```bash
npm install -g supabase
```

### 4.2 프로젝트 초기화
```bash
supabase init
supabase login
supabase link --project-ref your-project-ref
```

### 4.3 함수 생성
```bash
supabase functions new ai-process
supabase functions new search
supabase functions new admin-stats
```

### 4.4 환경변수 설정
```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 4.5 배포
```bash
supabase functions deploy ai-process
supabase functions deploy search
supabase functions deploy admin-stats
```

---

## 5. 관리자 페이지 세팅

### 5.1 Next.js 프로젝트 생성
```bash
npx create-next-app@latest loom-admin --typescript --tailwind --app
cd loom-admin
```

### 5.2 의존성 설치
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install recharts
npx shadcn-ui@latest init
```

### 5.3 환경변수
```
// .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 5.4 Vercel 배포
```bash
npm install -g vercel
vercel
```

---

## 6. Apple Developer 설정

### 6.1 계정 등록
1. https://developer.apple.com 접속
2. 연 $99 결제
3. 승인 대기 (1~2일)

### 6.2 App ID 생성
1. Certificates, Identifiers & Profiles
2. Identifiers > App ID 생성
3. Bundle ID: `com.yourname.loom`
4. Capabilities:
   - Sign In with Apple: ON
   - Push Notifications: ON

### 6.3 Apple Sign In 설정
1. Keys > Create a Key
2. Sign In with Apple: ON
3. Key ID 메모
4. `.p8` 파일 다운로드
5. Supabase Auth > Apple 설정에 입력

---

## 7. 도메인 & 랜딩페이지

### 7.1 도메인 등록
- 추천: Namecheap, GoDaddy, 가비아
- 도메인 예시: `getloom.app`, `useloom.co`

### 7.2 랜딩페이지 배포
```bash
# Vercel로 정적 배포
cd landing-page
vercel
```

### 7.3 DNS 설정
- A Record: Vercel IP
- 또는 CNAME: cname.vercel-dns.com

---

## 8. 체크리스트

### 개발 시작 전 필수
- [ ] Supabase 프로젝트 생성
- [ ] DB 스키마 적용
- [ ] OpenAI API 키 발급
- [ ] Xcode 프로젝트 생성
- [ ] Swift Package 추가
- [ ] 환경변수 설정

### 배포 전 필수
- [ ] Apple Developer 계정
- [ ] App ID & Capabilities 설정
- [ ] Edge Functions 배포
- [ ] Storage 버킷 & RLS 설정
- [ ] 관리자 페이지 배포
- [ ] 도메인 연결
- [ ] 개인정보처리방침 페이지
- [ ] 이용약관 페이지
