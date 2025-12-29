# Image Guardian Pro

AI 驅動的智慧財產保護與侵權偵測系統。

## 功能特色

- **資產庫 (Asset Vault)** - 上傳、管理您的原創圖片資產
- **掃描引擎 (Scan Engine)** - 全網偵測潛在侵權行為
- **維權存證中心 (Evidence Vault)** - 建立法律效力的存證紀錄

## 技術棧

- **前端**: Next.js 15 (App Router) + React 19
- **樣式**: Tailwind CSS 4 + shadcn/ui
- **後端**: Supabase (PostgreSQL + Storage + Auth)
- **部署**: Vercel

## 快速開始

### 1. 安裝依賴

```bash
cd image_guardian_pro
npm install
```

### 2. 設定 Supabase

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard) 建立新專案
2. 在 SQL Editor 中執行 `supabase/schema.sql`
3. 在 Storage 中建立 `assets` 和 `evidence` buckets（設為 Public）

### 3. 設定環境變數

複製 `.env.example` 為 `.env.local` 並填入 Supabase 金鑰：

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看。

## 專案結構

```
image_guardian_pro/
├── app/                    # Next.js App Router
│   ├── assets/            # 資產庫頁面
│   ├── scan/              # 掃描引擎頁面
│   ├── evidence/          # 維權存證頁面
│   └── actions/           # Server Actions
├── components/            # React 組件
│   ├── ui/               # 基礎 UI 組件
│   ├── layout/           # 佈局組件
│   ├── asset-vault/      # 資產庫組件
│   ├── scan-engine/      # 掃描引擎組件
│   └── evidence-vault/   # 存證中心組件
├── config/               # 系統配置
├── lib/                  # 工具函式與 Supabase 客戶端
├── types/                # TypeScript 型別定義
└── supabase/             # Supabase SQL 腳本
```

## 部署至 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push 至 GitHub
2. 連結 Vercel
3. 設定環境變數
4. 部署完成

## License

MIT
