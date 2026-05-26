# Loom - 전체 제작 설명서

## 1. 프로젝트 개요

### 앱 이름: Loom
### 핵심 컨셉
사용자가 저장한 텍스트, 이미지, 캡쳐, 프롬프트, 아이디어를 AI가 자동으로 태그/카테고리화하고,
나중에 자연어 검색으로 다시 찾게 해주는 **개인 아카이브 앱**.

### 핵심 행동 흐름
```
저장 → AI 자동 정리 → 자연어 검색 → 복사/재사용
```

---

## 2. 기술 스택 결정

### iOS 앱 (프론트엔드)
| 항목 | 기술 | 이유 |
|------|------|------|
| UI 프레임워크 | SwiftUI | Apple 공식, 선언형 UI, 빠른 개발 |
| 최소 지원 버전 | iOS 16+ | SwiftUI 안정성 확보 |
| 패키지 관리 | Swift Package Manager | Xcode 기본 내장 |
| 네트워크 | Supabase Swift SDK | 공식 SDK, Auth/DB/Storage 통합 |
| 이미지 처리 | Kingfisher | 캐싱, 비동기 로딩 |
| OCR | Apple Vision Framework | 무료, 온디바이스, 한국어 지원 |

### 백엔드 (Supabase)
| 항목 | 기술 | 이유 |
|------|------|------|
| 인증 | Supabase Auth | 이메일/Apple 로그인 기본 지원 |
| 데이터베이스 | PostgreSQL + pgvector | 벡터 검색 네이티브 지원 |
| 파일 저장소 | Supabase Storage | S3 호환, CDN 제공 |
| 서버리스 함수 | Supabase Edge Functions (Deno) | AI 처리, 웹훅 |
| 실시간 | Supabase Realtime | 필요 시 실시간 동기화 |

### AI/ML
| 항목 | 기술 | 이유 |
|------|------|------|
| 텍스트 분석 | OpenAI GPT-4o-mini | 비용 효율적, 한국어 우수 |
| Embedding | OpenAI text-embedding-3-small | 저렴, 1536차원, 성능 우수 |
| OCR | Apple Vision (온디바이스) | 무료, 빠름 |

### 관리자 페이지
| 항목 | 기술 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 14 (App Router) | React 기반, SSR, 빠른 개발 |
| UI 라이브러리 | shadcn/ui + Tailwind CSS | 깔끔한 대시보드 UI |
| 차트 | Recharts | React 네이티브 차트 |
| 배포 | Vercel | Next.js 최적화 배포 |

---

## 3. 예상 운영비

### 월간 비용 (사용자 1,000명 기준)

| 항목 | 서비스 | 월 비용 | 비고 |
|------|--------|---------|------|
| 백엔드/DB | Supabase Pro | $25 | 8GB DB, 250GB 대역폭 |
| 파일 저장소 | Supabase Storage | $0~5 | 1GB 무료, 이후 $0.021/GB |
| AI 제목/태그 | OpenAI GPT-4o-mini | $15~30 | 저장 건당 ~$0.001 |
| Embedding | OpenAI Embedding | $5~10 | 1M 토큰당 $0.02 |
| 관리자 페이지 | Vercel Pro | $20 | 또는 무료 플랜 가능 |
| 도메인 | 도메인 등록 | $1~2 | .com 기준 연 $12 |
| Apple 개발자 | Apple Developer | $8.3 | 연 $99 |
| **합계** | | **$75~95/월** | |

### 사용자 규모별 비용 예측

| 사용자 수 | 월 예상 비용 | 비고 |
|-----------|-------------|------|
| 100명 | $35~50 | Supabase Free + 최소 AI |
| 1,000명 | $75~95 | 위 표 기준 |
| 5,000명 | $150~250 | DB 확장, AI 비용 증가 |
| 10,000명 | $300~500 | Pro 플랜 업그레이드 필요 |
| 50,000명 | $1,000~2,000 | 전용 인프라 고려 |

### 비용 절감 전략
1. **Embedding 캐싱**: 동일 검색어 재계산 방지
2. **AI 배치 처리**: 저장 직후가 아닌 큐 기반 처리
3. **이미지 압축**: 업로드 전 클라이언트에서 리사이즈
4. **CDN 활용**: 이미지 캐싱으로 대역폭 절감

---

## 4. 수정하기 쉬운 구조 설계

### 아키텍처 원칙

#### 1) 레이어드 아키텍처 (iOS)
```
┌─────────────────────────────┐
│         View Layer           │  SwiftUI Views
├─────────────────────────────┤
│       ViewModel Layer        │  @Observable classes
├─────────────────────────────┤
│       Service Layer          │  비즈니스 로직
├─────────────────────────────┤
│      Repository Layer        │  데이터 접근 추상화
├─────────────────────────────┤
│       Network Layer          │  Supabase SDK 래핑
└─────────────────────────────┘
```

#### 2) 모듈 분리
```
Loom/
├── Core/           # 공통 유틸, 익스텐션
├── Auth/           # 인증 관련
├── Items/          # 아이템 저장/조회
├── Search/         # 검색 기능
├── Collections/    # 컬렉션 관리
├── AI/             # AI 처리 로직
├── Settings/       # 설정
└── Shared/         # 공유 UI 컴포넌트
```

#### 3) 프로토콜 기반 설계
```swift
// 이렇게 하면 나중에 Supabase를 Firebase로 바꿔도 쉬움
protocol ItemRepository {
    func save(item: Item) async throws -> Item
    func fetch(id: String) async throws -> Item
    func search(query: String) async throws -> [SearchResult]
    func delete(id: String) async throws
}

// 실제 구현
class SupabaseItemRepository: ItemRepository { ... }
// 테스트용
class MockItemRepository: ItemRepository { ... }
```

#### 4) 환경 설정 분리
```swift
enum AppConfig {
    static let supabaseURL = ProcessInfo.processInfo.environment["SUPABASE_URL"] ?? ""
    static let supabaseKey = ProcessInfo.processInfo.environment["SUPABASE_KEY"] ?? ""
    static let openAIKey = ProcessInfo.processInfo.environment["OPENAI_KEY"] ?? ""
}
```

### 백엔드 수정 용이성

#### Edge Functions 구조
```
supabase/functions/
├── ai-process/        # AI 제목/태그/카테고리 생성
├── generate-embedding/ # Embedding 생성
├── search/            # 벡터 검색
└── shared/            # 공통 유틸
```

각 함수가 독립적이므로 하나를 수정해도 다른 기능에 영향 없음.

---

## 5. 서버 연결 방법

### Supabase 연결 구조

```
iOS App ──→ Supabase Auth (인증)
         ──→ Supabase Database (PostgreSQL)
         ──→ Supabase Storage (이미지)
         ──→ Supabase Edge Functions (AI 처리)
                    │
                    ▼
              OpenAI API (GPT, Embedding)
```

### 연결 설정 (Swift)

```swift
import Supabase

let supabase = SupabaseClient(
    supabaseURL: URL(string: "https://your-project.supabase.co")!,
    supabaseKey: "your-anon-key"
)
```

### RLS (Row Level Security) 설정
```sql
-- 사용자 본인의 데이터만 접근 가능
CREATE POLICY "Users can only access own items"
ON items FOR ALL
USING (auth.uid() = user_id);
```

### API 호출 흐름

#### 저장 흐름
```
1. iOS → Supabase Auth (토큰 확인)
2. iOS → Supabase Storage (이미지 업로드)
3. iOS → Supabase DB (item 저장)
4. iOS → Edge Function (AI 처리 트리거)
5. Edge Function → OpenAI (제목/태그 생성)
6. Edge Function → OpenAI (Embedding 생성)
7. Edge Function → Supabase DB (결과 저장)
```

#### 검색 흐름
```
1. iOS → Edge Function (검색어 전달)
2. Edge Function → OpenAI (검색어 Embedding)
3. Edge Function → pgvector (유사도 검색)
4. Edge Function → iOS (결과 반환)
```

---

## 6. 관리자 페이지 기능

### 대시보드
- 총 사용자 수, 일일 활성 사용자 (DAU)
- 총 저장 아이템 수, 일일 저장 수
- 검색 횟수, 복사 횟수
- 신규 가입자 추이 그래프

### 사용자 관리
- 사용자 목록 (가입일, 저장 수, 마지막 활동)
- 사용자 상세 (통계만, 내용은 볼 수 없음)
- 계정 정지/삭제

### 통계/분석
- 인기 카테고리 분포
- 인기 태그 워드클라우드
- 시간대별 사용 패턴
- 리텐션 차트 (Day 1, 7, 30)
- 검색어 트렌드
- 기능별 사용 빈도

### 홍보/마케팅 기능
- 푸시 알림 발송 (전체/세그먼트)
- 공지사항 관리
- 인앱 배너 관리
- 프로모션 코드 생성
- 리퍼럴 코드 추적
- UTM 파라미터 추적 대시보드

### 수익 관리
- 구독 현황 (무료/유료 비율)
- 월간 매출 (MRR)
- 이탈률 (Churn Rate)
- 사용자별 저장 용량

---

## 7. 개발 일정 (1인 개발 기준)

| 단계 | 기간 | 내용 |
|------|------|------|
| 1단계 | 1주 | 프로젝트 세팅, 탭 구조, 네비게이션 |
| 2단계 | 1주 | 인증 (회원가입/로그인/로그아웃) |
| 3단계 | 2주 | 텍스트 저장/조회/수정/삭제 |
| 4단계 | 1주 | 이미지 저장 + Storage 연동 |
| 5단계 | 1주 | OCR (Apple Vision) |
| 6단계 | 2주 | AI 처리 (제목/태그/카테고리) |
| 7단계 | 2주 | Chunk 분리 + Embedding + 검색 |
| 8단계 | 1주 | 복사 UX + 홈 화면 |
| 9단계 | 1주 | 컬렉션 기능 |
| 10단계 | 1주 | 설정 + 다크모드 |
| 11단계 | 1주 | 관리자 페이지 |
| 12단계 | 1주 | 테스트 + 버그 수정 + 앱스토어 제출 |
| **합계** | **15주 (약 4개월)** | |

---

## 8. 앱스토어 출시 체크리스트

- [ ] Apple Developer 계정 등록 ($99/년)
- [ ] App Store Connect 앱 등록
- [ ] 앱 아이콘 (1024x1024)
- [ ] 스크린샷 (6.7", 6.5", 5.5")
- [ ] 앱 설명 (한국어/영어)
- [ ] 개인정보 처리방침 URL
- [ ] 이용약관 URL
- [ ] 앱 심사 가이드라인 준수 확인
- [ ] TestFlight 베타 테스트
- [ ] 앱 심사 제출

---

## 9. 홍보 전략

### 사전 마케팅
1. 랜딩페이지로 이메일 수집
2. 인스타그램/트위터 티저 콘텐츠
3. 디자이너/마케터 커뮤니티 공유

### 출시 마케팅
1. Product Hunt 런칭
2. 디스콰이엇 공유
3. 블로그 포스트 (개발기)
4. 인스타그램 릴스 (사용법 데모)

### 지속 마케팅
1. SEO 블로그 콘텐츠
2. 사용자 후기 수집/공유
3. 레퍼럴 프로그램
4. 인앱 공유 기능

---

## 10. 보안 고려사항

1. **RLS 필수**: 모든 테이블에 Row Level Security 적용
2. **API Key 관리**: 환경변수로 관리, 코드에 하드코딩 금지
3. **이미지 접근 제어**: Signed URL 사용
4. **입력 검증**: 클라이언트 + 서버 양쪽에서 검증
5. **레이트 리밋**: Edge Function에 요청 제한 설정
6. **데이터 암호화**: Supabase 기본 암호화 + 전송 시 TLS
