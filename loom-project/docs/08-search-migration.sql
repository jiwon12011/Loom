-- Loom 검색 마이그레이션: 서버측 전체검색 (200개 천장 제거)
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요. 멱등(여러 번 실행해도 안전)합니다.
--
-- 설계 메모:
--  - 한국어는 Postgres 기본 FTS config(영어 stemming)와 잘 안 맞으므로 pg_trgm(트라이그램)으로
--    부분 문자열/유사도 매칭을 한다. 짧은 메모·한국어에 실측상 더 잘 맞고 ILIKE 가속도 된다.
--  - original_content/summary/category/tags 를 합친 search_text 생성컬럼에 GIN 트라이그램 인덱스.
--  - search_items() RPC는 SECURITY INVOKER(기본)라 items의 RLS(user_id = auth.uid())가 그대로 적용된다.

-- 1) 트라이그램 확장
create extension if not exists pg_trgm;

-- 2) 검색 대상 텍스트를 합친 생성 컬럼
alter table items
  add column if not exists search_text text
  generated always as (
    coalesce(original_content, '') || ' ' ||
    coalesce(summary, '')          || ' ' ||
    coalesce(category, '')         || ' ' ||
    coalesce(array_to_string(tags, ' '), '')
  ) stored;

-- 3) 트라이그램 GIN 인덱스 (ILIKE / similarity 가속)
create index if not exists items_search_trgm
  on items using gin (search_text gin_trgm_ops);

-- 4) 검색 RPC: 현재 로그인 사용자의 모든 항목에서 검색·랭킹해 반환
--    p_query: 검색어, p_limit: 최대 후보 수(클라가 LLM 재랭킹할 상위 N)
create or replace function search_items(p_query text, p_limit int default 50)
returns setof items
language sql
stable
as $$
  select *
  from items
  where user_id = auth.uid()
    and p_query is not null
    and length(btrim(p_query)) > 0
    and (
      search_text ilike '%' || p_query || '%'
      or search_text % p_query                 -- 트라이그램 유사도(오타/부분 허용)
    )
  order by
    (search_text ilike '%' || p_query || '%') desc,  -- 정확 부분일치 우선
    similarity(search_text, p_query) desc,           -- 그다음 유사도
    copy_count desc,                                 -- 자주 쓴 것 우선
    created_at desc
  limit greatest(p_limit, 1);
$$;
