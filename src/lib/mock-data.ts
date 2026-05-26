import { Item, Collection } from "./types";

export const mockItems: Item[] = [
  {
    id: "1",
    title: "완벽하지 않아도, 매일 조금씩 나아가는 사람이 결국 해냅니다.",
    content:
      "완벽하지 않아도,\n매일 조금씩 나아가는\n사람이 결국 해냅니다.",
    category: "카피/문구",
    tags: ["동기부여", "성장", "마인드셋"],
    content_type: "text",
    created_at: "방금 전",
    copy_count: 12,
  },
  {
    id: "2",
    title: "어제보다 나은 오늘, 오늘보다 기대되는 내일.",
    content: "어제보다 나은 오늘,\n오늘보다 기대되는 내일.",
    category: "카피/문구",
    tags: ["동기부여", "일상"],
    content_type: "text",
    created_at: "2024.05.18",
    copy_count: 8,
  },
  {
    id: "3",
    title: "이 순간을 즐겨라, 지금이 네 인생의 가장 젊은 날이다.",
    content: "이 순간을 즐겨라,\n지금이 네 인생의\n가장 젊은 날이다.",
    category: "카피/문구",
    tags: ["영감", "인생"],
    content_type: "image",
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    created_at: "2024.05.18",
    copy_count: 15,
  },
  {
    id: "4",
    title: "디자인은 문제를 해결하는 데에서 시작된다.",
    content: "디자인은 문제를 해결하는 데에서 시작된다.",
    category: "디자인",
    tags: ["디자인", "철학"],
    content_type: "text",
    created_at: "2분 전",
    copy_count: 5,
  },
  {
    id: "5",
    title: "Focus on the process, not the result.",
    content: "Focus on the process,\nnot the result.",
    category: "카피/문구",
    tags: ["영어", "동기부여"],
    content_type: "image",
    image_url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop",
    created_at: "10분 전",
    copy_count: 22,
  },
  {
    id: "6",
    title: "디자인은 단지 예쁘게 만드는 것이 아니라, 의미를 전달하는 것이다.",
    content:
      "디자인은 단지 예쁘게 만드는 것이\n아니라, 의미를 전달하는 것이다.",
    category: "디자인",
    tags: ["디자인", "UX"],
    content_type: "text",
    created_at: "2024.05.16",
    copy_count: 3,
  },
  {
    id: "7",
    title: "좋은 브랜드는 제품을 팔지 않고, 기억을 남긴다.",
    content: "좋은 브랜드는 제품을 팔지 않고,\n기억을 남긴다.",
    category: "카피/문구",
    tags: ["브랜딩", "마케팅"],
    content_type: "text",
    created_at: "2024.05.12",
    copy_count: 18,
  },
];

export const mockCollections: Collection[] = [
  { id: "1", name: "마케팅 레퍼런스", color: "#D4BFA8", item_count: 84 },
  { id: "2", name: "디자인 영감", color: "#A99ABF", item_count: 128 },
  { id: "3", name: "AI 프롬프트", color: "#8BC6A8", item_count: 61 },
  { id: "4", name: "자린고비 프로젝트", color: "#8B7EA8", item_count: 32 },
  { id: "5", name: "아이디어", color: "#C4A87E", item_count: 57 },
  { id: "6", name: "휴지통", color: "#9E97A8", item_count: 12 },
];

export const categories = [
  { name: "디자인", count: 128 },
  { name: "카피/문구", count: 96 },
  { name: "아이디어", count: 72 },
  { name: "개발", count: 48 },
  { name: "AI/프롬프트", count: 81 },
  { name: "기타", count: 34 },
];
