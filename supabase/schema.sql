-- =====================================================
-- Image Guardian Pro - Supabase Schema
-- 請在 Supabase Dashboard > SQL Editor 中執行此腳本
-- =====================================================

-- 啟用 UUID 擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. 資產表 (Assets)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id TEXT NOT NULL DEFAULT 'admin',
    name TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_hash TEXT,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_assets_org_id ON public.assets(org_id);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON public.assets(created_at DESC);

-- RLS 政策
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for now" ON public.assets
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 2. 掃描表 (Scans)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id TEXT NOT NULL DEFAULT 'admin',
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    platforms TEXT[] DEFAULT '{}',
    match_count INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_scans_org_id ON public.scans(org_id);
CREATE INDEX IF NOT EXISTS idx_scans_asset_id ON public.scans(asset_id);
CREATE INDEX IF NOT EXISTS idx_scans_status ON public.scans(status);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON public.scans(created_at DESC);

-- RLS 政策
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for now" ON public.scans
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 3. 掃描匹配表 (Scan Matches)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.scan_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id TEXT NOT NULL DEFAULT 'admin',
    scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    source_url TEXT NOT NULL,
    source_platform TEXT NOT NULL,
    thumbnail_url TEXT,
    similarity_score DECIMAL(5, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'detected',
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_scan_matches_org_id ON public.scan_matches(org_id);
CREATE INDEX IF NOT EXISTS idx_scan_matches_scan_id ON public.scan_matches(scan_id);
CREATE INDEX IF NOT EXISTS idx_scan_matches_asset_id ON public.scan_matches(asset_id);
CREATE INDEX IF NOT EXISTS idx_scan_matches_status ON public.scan_matches(status);

-- RLS 政策
ALTER TABLE public.scan_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for now" ON public.scan_matches
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 4. 存證表 (Evidence)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id TEXT NOT NULL DEFAULT 'admin',
    match_id UUID REFERENCES public.scan_matches(id) ON DELETE SET NULL,
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    evidence_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT,
    file_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_evidence_org_id ON public.evidence(org_id);
CREATE INDEX IF NOT EXISTS idx_evidence_asset_id ON public.evidence(asset_id);
CREATE INDEX IF NOT EXISTS idx_evidence_match_id ON public.evidence(match_id);
CREATE INDEX IF NOT EXISTS idx_evidence_created_at ON public.evidence(created_at DESC);

-- RLS 政策
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for now" ON public.evidence
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 5. 輔助函數
-- =====================================================

-- 更新匹配計數
CREATE OR REPLACE FUNCTION increment_match_count(scan_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.scans
    SET match_count = match_count + 1
    WHERE id = scan_id;
END;
$$ LANGUAGE plpgsql;

-- 自動更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 觸發器
CREATE TRIGGER assets_updated_at
    BEFORE UPDATE ON public.assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER evidence_updated_at
    BEFORE UPDATE ON public.evidence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- 6. Storage Buckets (需在 Dashboard 手動建立)
-- =====================================================
-- 請在 Supabase Dashboard > Storage 中建立以下 Buckets：
-- 1. assets (Public)
-- 2. evidence (Public)
--
-- 並設定 Policy 允許上傳和讀取
