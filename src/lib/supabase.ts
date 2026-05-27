import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://rjavqpzenkxirwxbpory.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqYXZxcHplbmt4aXJ3eGJwb3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3OTYzOTUsImV4cCI6MjA5NTM3MjM5NX0.gRVlwi2ealHEkQyyaEgy5H34RVlt1rfN1BsyWnrvZZY"
);
