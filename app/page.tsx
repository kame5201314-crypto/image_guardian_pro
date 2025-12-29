import Link from "next/link";
import { getAssets } from "@/app/actions/asset-actions";
import { getScans } from "@/app/actions/scan-actions";
import { getInfringementStats } from "@/app/actions/infringement-actions";
import { FolderOpen, Radar, Shield, Scale, ArrowRight, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [assetsResult, scansResult, infringementStats] = await Promise.all([
    getAssets(),
    getScans(),
    getInfringementStats(),
  ]);

  const assetCount = assetsResult.data?.length || 0;
  const scanCount = scansResult.data?.length || 0;
  const matchCount = scansResult.data?.reduce((sum, s) => sum + (s.match_count || 0), 0) || 0;
  const pendingCases = infringementStats.pending || 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#f5f5f7]">
        {/* Background gradient orbs */}
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-blue-100 to-purple-100 opacity-60 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-green-100 to-blue-100 opacity-40 blur-3xl animate-pulse-slow delay-200" />

        <div className="relative max-w-[980px] mx-auto px-4 lg:px-0 py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-[#86868b] text-xs font-medium mb-8 shadow-sm animate-fade-in-up">
              <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
              AI-Powered Protection
            </div>

            {/* Main headline */}
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-[#1d1d1f] leading-[1.05] mb-6 animate-fade-in-up delay-100">
              守護您的
              <br />
              <span className="bg-gradient-to-r from-[#0071e3] to-[#7c3aed] bg-clip-text text-transparent">
                視覺資產
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-[#86868b] leading-relaxed mb-10 max-w-2xl mx-auto animate-fade-in-up delay-200">
              Image Guardian Pro 運用先進的 AI 技術，
              <br className="hidden sm:block" />
              全天候監控網路上的圖片侵權行為，自動蒐集證據。
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up delay-300">
              <Link
                href="/assets"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#1d1d1f] text-white rounded-full font-medium text-base hover:bg-[#424245] transition-all duration-200 active:scale-[0.97]"
              >
                開始使用
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-sm text-[#1d1d1f] rounded-full font-medium text-base border border-[#d2d2d7] hover:bg-white transition-all duration-200"
              >
                了解更多
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white border-y border-black/[0.04]">
        <div className="max-w-[980px] mx-auto px-4 lg:px-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <Link href="/assets" className="group text-center">
              <div className="text-5xl lg:text-6xl font-bold text-[#1d1d1f] mb-2 transition-transform duration-300 group-hover:scale-105">
                {assetCount}
              </div>
              <div className="text-sm text-[#86868b] font-medium">受保護資產</div>
            </Link>

            <Link href="/scan" className="group text-center">
              <div className="text-5xl lg:text-6xl font-bold text-[#1d1d1f] mb-2 transition-transform duration-300 group-hover:scale-105">
                {scanCount}
              </div>
              <div className="text-sm text-[#86868b] font-medium">掃描次數</div>
            </Link>

            <Link href="/scan" className="group text-center">
              <div className="text-5xl lg:text-6xl font-bold text-[#1d1d1f] mb-2 transition-transform duration-300 group-hover:scale-105">
                {matchCount}
              </div>
              <div className="text-sm text-[#86868b] font-medium">偵測結果</div>
            </Link>

            <Link href="/infringements" className="group text-center">
              <div className="text-5xl lg:text-6xl font-bold text-[#1d1d1f] mb-2 transition-transform duration-300 group-hover:scale-105">
                {pendingCases}
              </div>
              <div className="text-sm text-[#86868b] font-medium">待處理案件</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32 bg-[#f5f5f7]">
        <div className="max-w-[980px] mx-auto px-4 lg:px-0">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#1d1d1f] mb-4">
              強大功能
            </h2>
            <p className="text-xl text-[#86868b] max-w-xl mx-auto">
              從上傳到維權，一站式解決您的圖片保護需求
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Feature 1 - Asset Management */}
            <Link href="/assets" className="group">
              <div className="h-full p-10 rounded-3xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)] transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-[#0071e3]/10 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
                  <FolderOpen className="w-7 h-7 text-[#0071e3]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-3">資產管理</h3>
                <p className="text-[#86868b] leading-relaxed">
                  上傳並管理您的原創圖片，建立完整的數位資產清單，支援批量操作。
                </p>
              </div>
            </Link>

            {/* Feature 2 - Scan Engine */}
            <Link href="/scan" className="group">
              <div className="h-full p-10 rounded-3xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)] transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-[#34c759]/10 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
                  <Radar className="w-7 h-7 text-[#34c759]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-3">智慧掃描</h3>
                <p className="text-[#86868b] leading-relaxed">
                  AI 驅動的全網掃描，覆蓋蝦皮、momo、露天、Google 等主要平台。
                </p>
              </div>
            </Link>

            {/* Feature 3 - Rights Center */}
            <Link href="/infringements" className="group">
              <div className="h-full p-10 rounded-3xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)] transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-[#7c3aed]/10 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
                  <Shield className="w-7 h-7 text-[#7c3aed]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-3">維權中心</h3>
                <p className="text-[#86868b] leading-relaxed">
                  AI 鑑定報告、一鍵截圖存證、自動生成檢舉信，全方位守護權益。
                </p>
              </div>
            </Link>

            {/* Feature 4 - Evidence Vault */}
            <Link href="/evidence" className="group">
              <div className="h-full p-10 rounded-3xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)] transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-[#ff9500]/10 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110">
                  <Scale className="w-7 h-7 text-[#ff9500]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-3">法律存證</h3>
                <p className="text-[#86868b] leading-relaxed">
                  SHA-256 雜湊認證、時間戳記水印、完整證據鏈，法院採信有保障。
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-[#1d1d1f]">
        <div className="max-w-[980px] mx-auto px-4 lg:px-0 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            準備好保護您的創作了嗎？
          </h2>
          <p className="text-xl text-white/50 mb-10 max-w-xl mx-auto">
            立即上傳您的第一張圖片，讓 Image Guardian Pro 為您守護每一份創意。
          </p>
          <Link
            href="/assets"
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-[#1d1d1f] rounded-full font-semibold text-lg hover:bg-[#f5f5f7] transition-all duration-200 active:scale-[0.97]"
          >
            立即開始
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#f5f5f7] border-t border-black/[0.04]">
        <div className="max-w-[980px] mx-auto px-4 lg:px-0 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#86868b]" />
            <span className="text-sm font-medium text-[#86868b]">Image Guardian Pro</span>
          </div>
          <p className="text-xs text-[#86868b]">
            Powered by Gemini AI
          </p>
        </div>
      </footer>
    </div>
  );
}
