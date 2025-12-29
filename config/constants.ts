/**
 * Image Guardian Pro - System Configuration
 * 系統配置中心：所有可調參數集中管理
 */

export const CONFIG = {
  // 🎯 相似度閾值（0-100）- 設定較低以捕捉更多潛在侵權
  SIMILARITY_THRESHOLD: 50,

  // 🌐 支援的掃描平台（台灣主要電商 + Google）
  SCAN_PLATFORMS: [
    { id: 'shopee', name: '蝦皮購物', enabled: true },
    { id: 'momo', name: 'momo購物網', enabled: true },
    { id: 'ruten', name: '露天拍賣', enabled: true },
    { id: 'google', name: 'Google 圖片', enabled: true },
  ] as const,

  // ⏰ 自動掃描排程（Cron 表達式）
  AUTO_SCAN_CRON: '0 3 * * *', // 每日凌晨 3 點

  // 🏢 預設租戶 ID（多租戶架構）
  DEFAULT_ORG_ID: 'admin',

  // 📁 檔案上傳限制
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],

  // 📊 分頁設定
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,

  // 🗄️ Storage Bucket 名稱
  STORAGE_BUCKETS: {
    ASSETS: 'assets',
    EVIDENCE: 'evidence',
  } as const,

  // 📝 存證類型
  EVIDENCE_TYPES: [
    { id: 'screenshot', name: '網頁截圖' },
    { id: 'webpage_archive', name: '網頁存檔' },
    { id: 'hash_certificate', name: '雜湊憑證' },
  ] as const,

  // 🚦 狀態定義
  SCAN_STATUS: {
    PENDING: 'pending',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
  } as const,

  MATCH_STATUS: {
    DETECTED: 'detected',
    REPORTED: 'reported',
    RESOLVED: 'resolved',
    IGNORED: 'ignored',
  } as const,
} as const;

// 型別匯出
export type ScanPlatform = typeof CONFIG.SCAN_PLATFORMS[number]['id'];
export type EvidenceType = typeof CONFIG.EVIDENCE_TYPES[number]['id'];
export type ScanStatus = typeof CONFIG.SCAN_STATUS[keyof typeof CONFIG.SCAN_STATUS];
export type MatchStatus = typeof CONFIG.MATCH_STATUS[keyof typeof CONFIG.MATCH_STATUS];
