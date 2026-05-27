import type { StaticImageData } from "next/image";
import folderBlue from "../../img/folder_blue.png";
import folderDarkgrey from "../../img/folder_darkgrey.png";
import folderGreen from "../../img/folder_green.png";
import folderGrey from "../../img/folder_grey.png";
import folderPink from "../../img/folder_pink.png";
import folderPurple from "../../img/folder_purple.png";
import folderPurplepink from "../../img/folder_purplepink.png";
import folderYellow from "../../img/folder_yellow.png";

export const FOLDERS: { id: string; label: string; image: StaticImageData }[] = [
  { id: "yellow", label: "옐로우", image: folderYellow },
  { id: "blue", label: "블루", image: folderBlue },
  { id: "green", label: "그린", image: folderGreen },
  { id: "purple", label: "퍼플", image: folderPurple },
  { id: "pink", label: "핑크", image: folderPink },
  { id: "purplepink", label: "라벤더", image: folderPurplepink },
  { id: "grey", label: "그레이", image: folderGrey },
  { id: "darkgrey", label: "다크 그레이", image: folderDarkgrey },
];

export const getFolderByDescription = (description: string | null | undefined, fallbackIndex = 0) => {
  const folderId = description?.startsWith("folder:") ? description.replace("folder:", "") : null;
  return FOLDERS.find((folder) => folder.id === folderId) ?? FOLDERS[fallbackIndex % FOLDERS.length];
};
