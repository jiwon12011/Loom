-- Loom Database Schema (정본)
-- PostgreSQL (Supabase) + Storage
--
-- 이 파일은 실제 앱(src/)이 사용하는 테이블/컬럼/RLS와 일치하도록 정리된 정본입니다.
-- 현재 검색은 임베딩이 아니라 /api/search 의 LLM(Groq) 랭킹을 사용합니다.
-- pgvector 기반 벡터 검색(item_chunks)은 향후 확장용으로 맨 아래에 분리해 두었습니다.

-- ============================================
-- USERS (Supabase Auth가 관리)
-- ============================================
-- auth.users 테이블은 Supabase Auth가 자동 생성/관리합니다.

-- ============================================
-- ITEMS (핵심 아이템 테이블)
-- ============================================
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    original_content TEXT NOT NULL,
    summary TEXT,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    -- 앱은 text / image / link / mixed(텍스트+참고이미지) 4종을 사용합니다.
    content_type TEXT NOT NULL DEFAULT 'text'
        CHECK (content_type IN ('text', 'image', 'link', 'mixed')),
    copy_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    ai_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_created_at ON items(created_at DESC);
CREATE INDEX idx_items_copy_count ON items(copy_count DESC);
CREATE INDEX idx_items_tags ON items USING GIN(tags);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own items"
ON items FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ITEM_IMAGES (이미지 첨부 / 참고 이미지)
-- ============================================
CREATE TABLE item_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    ocr_text TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_images_item_id ON item_images(item_id);
CREATE INDEX idx_images_user_id ON item_images(user_id);

ALTER TABLE item_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own images"
ON item_images FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- COLLECTIONS (컬렉션)
-- ============================================
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    -- 폴더 색상은 description에 'folder:<color>' 형태로 저장됩니다 (src/lib/folders.ts).
    description TEXT,
    item_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_collections_user_id ON collections(user_id);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own collections"
ON collections FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- COLLECTION_ITEMS (컬렉션-아이템 연결)
-- ============================================
CREATE TABLE collection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(collection_id, item_id)
);

CREATE INDEX idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX idx_collection_items_item ON collection_items(item_id);

ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

-- INSERT/SELECT/DELETE 모두 컬렉션 소유자만 가능하도록 USING + WITH CHECK 둘 다 지정합니다.
CREATE POLICY "Users can manage own collection items"
ON collection_items FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM collections
        WHERE collections.id = collection_items.collection_id
        AND collections.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM collections
        WHERE collections.id = collection_items.collection_id
        AND collections.user_id = auth.uid()
    )
);

-- ============================================
-- NOTIFICATIONS (알림) - src/lib/notifications.ts
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL
        CHECK (type IN ('ai_complete', 'category_suggest', 'popular_item', 'storage_info')),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own notifications"
ON notifications FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- USER_CATEGORIES (사용자 커스텀 카테고리) - src/lib/categories.ts
-- ============================================
-- 기본 카테고리(카피/문구, 디자인 등)는 앱 코드 상수이며, 이 테이블엔 사용자가 추가한 것만 저장됩니다.
CREATE TABLE user_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE INDEX idx_user_categories_user_id ON user_categories(user_id);

ALTER TABLE user_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own categories"
ON user_categories FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================
-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER collections_updated_at
    BEFORE UPDATE ON collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- 컬렉션 아이템 수 자동 동기화 (앱은 화면에서 직접 count 하기도 하지만, 비정규화 값도 유지)
CREATE OR REPLACE FUNCTION update_collection_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE collections SET item_count = item_count + 1
        WHERE id = NEW.collection_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE collections SET item_count = GREATEST(item_count - 1, 0)
        WHERE id = OLD.collection_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER collection_items_count
    AFTER INSERT OR DELETE ON collection_items
    FOR EACH ROW
    EXECUTE FUNCTION update_collection_count();

-- ============================================
-- STORAGE BUCKET 설정
-- ============================================
-- 앱은 'images' 버킷을 사용합니다 (src/app/save/image/page.tsx, src/app/save/page.tsx).
-- 객체 경로 규칙: <user_id>/<...>.<ext>  → 첫 번째 폴더 세그먼트가 소유자 user_id 입니다.
--
-- Supabase Dashboard 또는 아래 SQL로 버킷 생성:
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: 본인 폴더(user_id)에만 업로드/수정/삭제 가능. 읽기는 public 버킷이라 공개 URL로 접근.
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- (향후) 벡터 검색용 - 현재 앱 흐름에서는 사용하지 않음
-- ============================================
-- 임베딩 기반 검색을 도입할 때 사용하세요. 현재 검색은 /api/search 의 LLM 랭킹입니다.
--
-- CREATE EXTENSION IF NOT EXISTS vector;
--
-- CREATE TABLE item_chunks (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
--     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--     chunk_text TEXT NOT NULL,
--     chunk_index INTEGER NOT NULL,
--     embedding vector(1536),
--     created_at TIMESTAMPTZ DEFAULT NOW()
-- );
-- ALTER TABLE item_chunks ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can access own chunks" ON item_chunks FOR ALL
--   USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
