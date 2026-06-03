"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PUBLIC_PATHS = ["/onboarding", "/login", "/signup", "/reset-password", "/admin"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

    if (isPublic) {
      setReady(true);
      return;
    }

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session) {
          setReady(true);
        } else {
          router.replace("/onboarding");
        }
      })
      .catch(() => {
        router.replace("/onboarding");
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session && !isPublic) {
        router.replace("/onboarding");
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname]);

  if (!ready) return <div className="min-h-screen bg-surface" />;

  return <>{children}</>;
}
