"use client";

import { useEffect } from "react";
import { getStoredTheme, applyTheme } from "@/lib/theme";

export default function ThemeSync() {
  useEffect(() => {
    applyTheme(getStoredTheme());

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      if (getStoredTheme() === "system") applyTheme("system");
    };
    mq.addEventListener("change", handleSystemChange);
    return () => mq.removeEventListener("change", handleSystemChange);
  }, []);

  return null;
}
