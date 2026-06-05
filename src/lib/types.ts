// 앱 전역 도메인 타입의 단일 소스. (DB items/item_images/collections 스키마 기준)

export type Item = {
  id: string;
  original_content: string;
  content_type: string;
  category: string | null;
  summary: string | null;
  created_at: string;
  copy_count: number;
  tags: string[];
  last_used_at?: string | null;
};

export type ItemImage = {
  id: string;
  image_url: string;
  display_order: number;
  ocr_text?: string | null;
};

export type Collection = {
  id: string;
  name: string;
  description?: string | null;
  item_count: number;
};
