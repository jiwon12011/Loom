import { createClient } from "@supabase/supabase-js";

// env 값에 섞인 줄바꿈/공백/따옴표를 제거한다. (대시보드에 붙여넣을 때 끝에 \n이 들어가면
// fetch 헤더가 깨져 "Failed to execute 'fetch' on 'Window': Invalid value"가 난다)
const clean = (v: string | undefined) =>
  v?.trim().replace(/^['"]|['"]$/g, "") || undefined;

const supabaseUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase 환경변수가 없습니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정하세요 (.env.example 참고)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
