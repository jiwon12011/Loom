"use client";

import { useEffect } from "react";
import { PROFILE_ICON_STORAGE_KEY, PROFILE_THEME_EVENT, getProfileTheme } from "@/lib/profile-icons";

const applyTheme = (iconId: string | null) => {
  const theme = getProfileTheme(iconId);
  document.documentElement.style.setProperty("--profile-accent", theme.accent);
  document.documentElement.style.setProperty("--profile-soft", theme.soft);
  document.documentElement.style.setProperty("--profile-glow", theme.glow);
  document.documentElement.style.setProperty("--profile-on-accent", theme.onAccent);
};

export default function ProfileThemeSync() {
  useEffect(() => {
    applyTheme(localStorage.getItem(PROFILE_ICON_STORAGE_KEY));

    const syncTheme = () => applyTheme(localStorage.getItem(PROFILE_ICON_STORAGE_KEY));
    window.addEventListener("storage", syncTheme);
    window.addEventListener(PROFILE_THEME_EVENT, syncTheme);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener(PROFILE_THEME_EVENT, syncTheme);
    };
  }, []);

  return null;
}
