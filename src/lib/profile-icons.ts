import type { StaticImageData } from "next/image";
import personal1 from "../../img/personal_1.png";
import personal2 from "../../img/personal_2.png";
import personal3 from "../../img/personal_3.png";
import personal4 from "../../img/personal_4.png";
import personal5 from "../../img/personal_5.png";
import personal6 from "../../img/personal_6.png";
import personal7 from "../../img/personal_7.png";
import personal8 from "../../img/personal_8.png";
import personal9 from "../../img/personal_9.png";
import personal10 from "../../img/personal_10.png";
import personal11 from "../../img/personal_11.png";
import personal12 from "../../img/personal_12.png";

export const PROFILE_ICON_STORAGE_KEY = "loom-profile-icon";

export type ProfileTheme = {
  accent: string;
  soft: string;
  glow: string;
};

export const PROFILE_THEME_EVENT = "loom-profile-theme-change";

export const PROFILE_ICONS: { id: string; label: string; image: StaticImageData; theme: ProfileTheme }[] = [
  { id: "personal_1", label: "프로필 1", image: personal1, theme: { accent: "#D96FA1", soft: "#D96FA1", glow: "rgba(217, 111, 161, 0.30)" } },
  { id: "personal_2", label: "프로필 2", image: personal2, theme: { accent: "#F14248", soft: "#F14248", glow: "rgba(241, 66, 72, 0.30)" } },
  { id: "personal_3", label: "프로필 3", image: personal3, theme: { accent: "#DF8F64", soft: "#DF8F64", glow: "rgba(223, 143, 100, 0.30)" } },
  { id: "personal_4", label: "프로필 4", image: personal4, theme: { accent: "#64D4D3", soft: "#64D4D3", glow: "rgba(100, 212, 211, 0.30)" } },
  { id: "personal_5", label: "프로필 5", image: personal5, theme: { accent: "#44A0DC", soft: "#44A0DC", glow: "rgba(68, 160, 220, 0.30)" } },
  { id: "personal_6", label: "프로필 6", image: personal6, theme: { accent: "#3C6397", soft: "#3C6397", glow: "rgba(60, 99, 151, 0.30)" } },
  { id: "personal_7", label: "프로필 7", image: personal7, theme: { accent: "#8D69CD", soft: "#8D69CD", glow: "rgba(141, 105, 205, 0.30)" } },
  { id: "personal_8", label: "프로필 8", image: personal8, theme: { accent: "#DF40B1", soft: "#DF40B1", glow: "rgba(223, 64, 177, 0.30)" } },
  { id: "personal_9", label: "프로필 9", image: personal9, theme: { accent: "#E2CB68", soft: "#E2CB68", glow: "rgba(226, 203, 104, 0.30)" } },
  { id: "personal_10", label: "프로필 10", image: personal10, theme: { accent: "#98E075", soft: "#98E075", glow: "rgba(152, 224, 117, 0.30)" } },
  { id: "personal_11", label: "프로필 11", image: personal11, theme: { accent: "#D02E5E", soft: "#D02E5E", glow: "rgba(208, 46, 94, 0.30)" } },
  { id: "personal_12", label: "프로필 12", image: personal12, theme: { accent: "#303038", soft: "#303038", glow: "rgba(48, 48, 56, 0.30)" } },
];

export const DEFAULT_PROFILE_ICON_ID = "personal_7";

export const getProfileIcon = (id: string | null | undefined) =>
  PROFILE_ICONS.find((icon) => icon.id === id) ??
  PROFILE_ICONS.find((icon) => icon.id === DEFAULT_PROFILE_ICON_ID) ??
  PROFILE_ICONS[0];

export const getProfileTheme = (id: string | null | undefined) => getProfileIcon(id).theme;
