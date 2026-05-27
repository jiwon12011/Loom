import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://rjavqpzenkxirwxbpory.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqYXZxcHplbmt4aXJ3eGJwb3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3OTYzOTUsImV4cCI6MjA5NTM3MjM5NX0.gRVlwi2ealHEkQyyaEgy5H34RVlt1rfN1BsyWnrvZZY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
