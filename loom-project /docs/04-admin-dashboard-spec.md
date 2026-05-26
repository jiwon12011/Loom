# Loom 관리자 대시보드 스펙

## 기술 스택
- **프레임워크**: Next.js 14 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **차트**: Recharts
- **인증**: Supabase Auth (관리자 전용)
- **배포**: Vercel

---

## 페이지 구성

### 1. 대시보드 (메인)
```
/admin/dashboard
```

#### 상단 카드 (4개)
| 카드 | 내용 |
|------|------|
| 총 사용자 | 전체 가입자 수 + 오늘 신규 |
| 활성 사용자 (DAU) | 오늘 접속한 사용자 수 |
| 총 아이템 | 전체 저장된 아이템 수 |
| 총 검색 수 | 오늘 검색 횟수 |

#### 차트 영역
- **가입자 추이** (7일/30일/90일 선택)
- **일별 저장 수** (막대 차트)
- **카테고리 분포** (파이 차트)
- **시간대별 활동** (히트맵)

---

### 2. 사용자 관리
```
/admin/users
```

#### 사용자 목록 테이블
| 컬럼 | 설명 |
|------|------|
| 이메일 | 가입 이메일 |
| 가입일 | 가입 날짜 |
| 마지막 접속 | 최근 활동 |
| 저장 수 | 총 아이템 수 |
| 검색 수 | 총 검색 횟수 |
| 플랜 | 무료/유료 |
| 상태 | 활성/정지 |

#### 필터/검색
- 이메일 검색
- 플랜별 필터
- 가입일 범위
- 정렬 (가입일, 저장 수, 활동일)

---

### 3. 통계/분석
```
/admin/analytics
```

#### 리텐션 분석
- Day 1 / Day 7 / Day 30 리텐션
- 코호트 분석 테이블

#### 기능 사용 빈도
- 저장 vs 검색 vs 복사 비율
- 이미지 vs 텍스트 저장 비율
- 컬렉션 사용률

#### 검색어 분석
- 인기 검색어 Top 20
- 검색 결과 없는 쿼리 Top 10
- 일별 검색량 추이

#### 태그/카테고리 분석
- 인기 태그 워드클라우드
- 카테고리별 아이템 수
- AI 처리 성공률

---

### 4. 홍보/마케팅
```
/admin/marketing
```

#### 푸시 알림
- 전체 발송
- 세그먼트별 발송 (무료 사용자, 유료 사용자, 비활성 사용자)
- 발송 이력
- 예약 발송

#### 공지사항 관리
- 공지 작성/수정/삭제
- 인앱 팝업 설정
- 표시 기간 설정

#### 배너 관리
- 인앱 배너 이미지 업로드
- 링크 설정
- 노출 조건 설정

#### 프로모션
- 프로모션 코드 생성
- 사용 현황 추적
- 만료일 설정

#### UTM 추적
- 유입 채널별 가입자 수
- 채널별 전환율
- 채널별 리텐션

#### 리퍼럴
- 리퍼럴 코드 현황
- 초대 성공 수
- 보상 지급 내역

---

### 5. 수익 관리
```
/admin/revenue
```

#### 구독 현황
- 무료/유료 비율 (도넛 차트)
- 월간 구독 수 추이
- 이탈률 (Churn Rate)

#### 매출
- MRR (Monthly Recurring Revenue)
- 월별 매출 추이
- ARPU (Average Revenue Per User)

#### 용량 관리
- 사용자별 저장 용량
- 전체 스토리지 사용량
- 무료 사용자 제한 현황

---

### 6. 설정
```
/admin/settings
```

- 관리자 계정 관리
- AI 처리 설정 (모델, 프롬프트)
- 무료 플랜 제한 설정
- 카테고리 기본값 관리
- 앱 공지 설정

---

## 관리자 인증

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.redirect('/admin/login')
  }
  
  // 관리자 권한 확인
  const { data: profile } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', session.user.id)
    .single()
  
  if (!profile || profile.role !== 'admin') {
    return NextResponse.redirect('/admin/unauthorized')
  }
}
```

---

## API 엔드포인트 (Edge Functions)

| 엔드포인트 | 설명 |
|-----------|------|
| GET /admin/stats/overview | 대시보드 요약 |
| GET /admin/stats/users | 사용자 통계 |
| GET /admin/stats/items | 아이템 통계 |
| GET /admin/stats/searches | 검색 통계 |
| GET /admin/stats/retention | 리텐션 데이터 |
| GET /admin/users | 사용자 목록 |
| POST /admin/push | 푸시 알림 발송 |
| CRUD /admin/notices | 공지사항 관리 |
| CRUD /admin/banners | 배너 관리 |
| CRUD /admin/promos | 프로모션 코드 |
