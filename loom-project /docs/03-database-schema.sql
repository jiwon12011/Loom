-- Loom Database Schema
-- PostgreSQL + pgvector

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- USERS (Supabase Auth가 관리)
-- ============================================
-- users 테이블은 Supabase Auth가 자동 생성
-- auth.users 테이블 참조

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
    content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'mixed')),
    copy_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    ai_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_created_at ON items(created_at DESC);
CREATE INDEX idx_items_copy_count ON items(copy_count DESC);
CREATE INDEX idx_items_tags ON items USING GIN(tags);

-- RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own items"
ON items FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ITEM_CHUNKS (검색용 청크)
-- ============================================
CREATE TABLE item_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_chunks_item_id ON item_chunks(item_id);
CREATE INDEX idx_chunks_user_id ON item_chunks(user_id);
CREATE INDEX idx_chunks_embedding ON item_chunks
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- RLS
ALTER TABLE item_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own chunks"
ON item_chunks FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ITEM_IMAGES (이미지 첨부)
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

-- 인덱스
CREATE INDEX idx_images_item_id ON item_images(item_id);
CREATE INDEX idx_images_user_id ON item_images(user_id);

-- RLS
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
    description TEXT,
    item_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_collections_user_id ON collections(user_id);

-- RLS
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

-- 인덱스
CREATE INDEX idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX idx_collection_items_item ON collection_items(item_id);

-- RLS
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own collection items"
ON collection_items FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM collections
        WHERE collections.id = collection_items.collection_id
        AND collections.user_id = auth.uid()
    )
);

-- ============================================
-- ADMIN_STATS (관리자 통계)
-- ============================================
CREATE TABLE admin_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_signups INTEGER DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    new_items INTEGER DEFAULT 0,
    total_searches INTEGER DEFAULT 0,
    total_copies INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- 벡터 유사도 검색 함수
CREATE OR REPLACE FUNCTION search_chunks(
    query_embedding vector(1536),
    match_user_id UUID,
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 20
)
RETURNS TABLE (
    chunk_id UUID,
    item_id UUID,
    chunk_text TEXT,
    chunk_index INTEGER,
    similarity FLOAT,
    item_title TEXT,
    item_category TEXT,
    item_tags TEXT[],
    item_created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ic.id AS chunk_id,
        ic.item_id,
        ic.chunk_text,
        ic.chunk_index,
        1 - (ic.embedding <=> query_embedding) AS similarity,
        i.title AS item_title,
        i.category AS item_category,
        i.tags AS item_tags,
        i.created_at AS item_created_at
    FROM item_chunks ic
    JOIN items i ON i.id = ic.item_id
    WHERE ic.user_id = match_user_id
    AND 1 - (ic.embedding <=> query_embedding) > match_threshold
    ORDER BY ic.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 아이템 저장 시 updated_at 자동 업데이트
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

-- 컬렉션 아이템 수 자동 업데이트
CREATE OR REPLACE FUNCTION update_collection_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE collections SET item_count = item_count + 1
        WHERE id = NEW.collection_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE collections SET item_count = item_count - 1
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
-- Supabase Dashboard에서 설정:
-- Bucket: 'item-images'
-- Public: false
-- Allowed MIME: image/jpeg, image/png, image/webp, image/heic
-- Max file size: 10MB

-- Storage RLS
-- CREATE POLICY "Users can upload own images"
-- ON storage.objects FOR INSERT
-- WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view own images"
-- ON storage.objects FOR SELECT
-- USING (auth.uid()::text = (storage.foldername(name))[1]);
