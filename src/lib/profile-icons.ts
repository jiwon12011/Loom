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
  { id: "personal_1", label: "프로필 1", image: personal1, theme: { accent: "#46A7F2", soft: "#E9F4FF", glow: "rgba(70, 167, 242, 0.26)" } },
  { id: "personal_2", label: "프로필 2", image: personal2, theme: { accent: "#55CFC8", soft: "#EAFBFA", glow: "rgba(85, 207, 200, 0.26)" } },
  { id: "personal_3", label: "프로필 3", image: personal3, theme: { accent: "#77C88D", soft: "#EEF9F0", glow: "rgba(119, 200, 141, 0.25)" } },
  { id: "personal_4", label: "프로필 4", image: personal4, theme: { accent: "#F1998A", soft: "#FFF0ED", glow: "rgba(241, 153, 138, 0.25)" } },
  { id: "personal_5", label: "프로필 5", image: personal5, theme: { accent: "#9B86CF", soft: "#F1EDFB", glow: "rgba(155, 134, 207, 0.26)" } },
  { id: "personal_6", label: "프로필 6", image: personal6, theme: { accent: "#E5B957", soft: "#FFF7E4", glow: "rgba(229, 185, 87, 0.25)" } },
  { id: "personal_7", label: "프로필 7", image: personal7, theme: { accent: "#EC8DB2", soft: "#FFF0F6", glow: "rgba(236, 141, 178, 0.25)" } },
  { id: "personal_8", label: "프로필 8", image: personal8, theme: { accent: "#8EBB9E", soft: "#F0F8F3", glow: "rgba(142, 187, 158, 0.25)" } },
  { id: "personal_9", label: "프로필 9", image: personal9, theme: { accent: "#EEA15D", soft: "#FFF2E7", glow: "rgba(238, 161, 93, 0.25)" } },
  { id: "personal_10", label: "프로필 10", image: personal10, theme: { accent: "#7B92DD", soft: "#EEF2FF", glow: "rgba(123, 146, 221, 0.26)" } },
  { id: "personal_11", label: "프로필 11", image: personal11, theme: { accent: "#A3A0AD", soft: "#F3F1F6", glow: "rgba(163, 160, 173, 0.25)" } },
  { id: "personal_12", label: "프로필 12", image: personal12, theme: { accent: "#6FA8C9", soft: "#EAF5FA", glow: "rgba(111, 168, 201, 0.26)" } },
];

export const getProfileIcon = (id: string | null | undefined) =>
  PROFILE_ICONS.find((icon) => icon.id === id) ?? PROFILE_ICONS[0];

export const getProfileTheme = (id: string | null | undefined) => getProfileIcon(id).theme;
