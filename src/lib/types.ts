export interface Item {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  content_type: "text" | "image" | "mixed";
  image_url?: string;
  created_at: string;
  copy_count: number;
}

export interface Collection {
  id: string;
  name: string;
  color: string;
  item_count: number;
}

export interface SearchResult {
  id: string;
  item_id: string;
  chunk_text: string;
  similarity: number;
  item: Item;
}

export type TabType = "home" | "search" | "add" | "collections" | "settings";
export type ContentFilter = "all" | "text" | "image" | "link";
export type Category =
  | "디자인"
  | "카피/문구"
  | "아이디어"
  | "개발"
  | "AI/프롬프트"
  | "기타";
