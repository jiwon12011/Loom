"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PUBLIC_PATHS = ["/onboarding", "/login", "/signup"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !isPublic) {
        router.replace("/onboarding");
      } else {
        setChecked(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session && !isPublic) {
        router.replace("/onboarding");
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname]);

  if (!checked && !PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return <div className="min-h-screen bg-white" />;
  }

  return <>{children}</>;
}
