-- =====================================================
-- Image Guardian Pro - Schema V2: 侵權案件與存證系統
-- 請在 Supabase Dashboard > SQL Editor 中執行此腳本
-- =====================================================

-- =====================================================
-- 1. 侵權案件主表 (Infringements)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.infringements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id TEXT NOT NULL DEFAULT 'admin',

    -- 關聯
    asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
    match_id UUID REFERENCES public.scan_matches(id) ON DELETE SET NULL,

    -- 案件資訊
    case_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',

    -- 侵權來源
    infringing_url TEXT NOT NULL,
    infringing_platform TEXT NOT NULL,
    infringing_seller TEXT,
    infringing_title TEXT,

    -- 截圖存證
    screenshot_url TEXT,
    screenshot_path TEXT,
    screenshot_hash TEXT,
    screenshot_taken_at TIMESTAMPTZ,

    -- Nano Banana AI 鑑定
    ai_similarity_score DECIMAL(5, 2),
    ai_confidence_score DECIMAL(5, 2),
    ai_assessment_report JSONB DEFAULT '{}',
    ai_conclusion TEXT,
    ai_assessed_at TIMESTAMPTZ,

    -- 檢舉記錄
    reported_at TIMESTAMPTZ,
    reported_method TEXT,
    reported_reference TEXT,
    report_email_content TEXT,

    -- 時間戳記
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_infringements_org_id ON public.infringements(org_id);
CREATE INDEX IF NOT EXISTS idx_infringements_status ON public.infringements(status);
CREATE INDEX IF NOT EXISTS idx_infringements_priority ON public.infringements(priority);
CREATE INDEX IF NOT EXISTS idx_infringements_asset_id ON public.infringements(asset_id);
CREATE INDEX IF NOT EXISTS idx_infringements_platform ON public.infringements(infringing_platform);
CREATE INDEX IF NOT EXISTS idx_infringements_created_at ON public.infringements(created_at DESC);

-- RLS 政策
ALTER TABLE public.infringements ENABLE ROW LEVEL SECURITY;

-- 開發階段寬鬆政策
CREATE POLICY "Allow all infringements for now" ON public.infringements
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 2. 系統日誌表 (System Logs)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id TEXT DEFAULT 'system',
    level TEXT NOT NULL,
    source TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    stack_trace TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON public.system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_source ON public.system_logs(source);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at DESC);

-- RLS 政策
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all logs for now" ON public.system_logs
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 3. 案件編號序列與生成函數
-- =====================================================
CREATE SEQUENCE IF NOT EXISTS infringement_case_seq START 1;

CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    seq_num INTEGER;
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');
    seq_num := nextval('infringement_case_seq');
    RETURN 'IGP-' || year_part || '-' || LPAD(seq_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. 自動更新 updated_at 觸發器
-- =====================================================
CREATE TRIGGER infringements_updated_at
    BEFORE UPDATE ON public.infringements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- 5. 狀態統計視圖
-- =====================================================
CREATE OR REPLACE VIEW public.infringement_stats AS
SELECT
    org_id,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'evidenced') as evidenced_count,
    COUNT(*) FILTER (WHERE status = 'reported') as reported_count,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
    COUNT(*) FILTER (WHERE status = 'dismissed') as dismissed_count,
    COUNT(*) as total_count
FROM public.infringements
GROUP BY org_id;

-- =====================================================
-- 6. 記錄系統日誌的函數
-- =====================================================
CREATE OR REPLACE FUNCTION log_system_event(
    p_level TEXT,
    p_source TEXT,
    p_message TEXT,
    p_metadata JSONB DEFAULT '{}',
    p_org_id TEXT DEFAULT 'system'
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.system_logs (org_id, level, source, message, metadata)
    VALUES (p_org_id, p_level, p_source, p_message, p_metadata)
    RETURNING id INTO log_id;

    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 完成提示
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'Schema V2 已成功建立！';
    RAISE NOTICE '- infringements 表：侵權案件管理';
    RAISE NOTICE '- system_logs 表：系統日誌記錄';
    RAISE NOTICE '- generate_case_number()：案件編號生成';
    RAISE NOTICE '- log_system_event()：日誌記錄函數';
END $$;
