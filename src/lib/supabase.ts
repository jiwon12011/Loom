import { createClient } from "@supabase/supabase-js";

// env 값에 섞인 공백/줄바꿈/따옴표를 모두 제거한다. URL·JWT(anon 키)에는 공백이 존재할 수 없으므로
// 안전하며, 대시보드 붙여넣기 때 키 "중간"에 낀 줄바꿈까지 제거해 원래 값으로 복원한다.
// (헤더 값에 줄바꿈이 들어가면 "Failed to execute 'fetch' on 'Window': Invalid value"가 난다)
const clean = (v: string | undefined) =>
  v?.replace(/\s+/g, "").replace(/^['"]|['"]$/g, "") || undefined;

const supabaseUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase 환경변수가 없습니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정하세요 (.env.example 참고)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
