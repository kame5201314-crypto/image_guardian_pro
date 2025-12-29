import Link from "next/link";
import { getAssets } from "@/app/actions/asset-actions";
import { getScans } from "@/app/actions/scan-actions";
import { getInfringementStats } from "@/app/actions/infringement-actions";
import { FolderOpen, Radar, Shield, Scale, ArrowRight, Sparkles, Eye, FileCheck } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI 驅動的智慧防護
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                守護您的
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  {" "}視覺資產
                </span>
              </h1>

              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Image Guardian Pro 運用先進的 AI 技術，全天候監控網路上的圖片侵權行為，
                自動蒐集證據並生成法律文件，讓您專注於創作。
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/assets"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5"
                >
                  開始使用
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/scan"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 rounded-xl font-medium border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  <Radar className="w-4 h-4" />
                  發起掃描
                </Link>
              </div>
            </div>

            {/* Right - Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Link href="/assets" className="group">
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FolderOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{assetCount}</div>
                  <div className="text-sm text-slate-500">受保護資產</div>
                </div>
              </Link>

              <Link href="/scan" className="group">
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Eye className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{scanCount}</div>
                  <div className="text-sm text-slate-500">掃描次數</div>
                </div>
              </Link>

              <Link href="/scan" className="group">
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Radar className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{matchCount}</div>
                  <div className="text-sm text-slate-500">偵測結果</div>
                </div>
              </Link>

              <Link href="/infringements" className="group">
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-rose-200 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6 text-rose-600" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{pendingCases}</div>
                  <div className="text-sm text-slate-500">待處理案件</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">強大功能</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              從上傳到維權，一站式解決您的圖片保護需求
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <Link href="/assets" className="group">
              <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 hover:shadow-lg hover:shadow-blue-100 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <FolderOpen className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">資產管理</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  上傳並管理您的原創圖片，建立完整的數位資產清單，支援批量操作。
                </p>
              </div>
            </Link>

            {/* Feature 2 */}
            <Link href="/scan" className="group">
              <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100 hover:shadow-lg hover:shadow-emerald-100 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Radar className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">智慧掃描</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  AI 驅動的全網掃描，覆蓋蝦皮、momo、露天、Google 等主要平台。
                </p>
              </div>
            </Link>

            {/* Feature 3 */}
            <Link href="/infringements" className="group">
              <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/50 border border-violet-100 hover:shadow-lg hover:shadow-violet-100 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-violet-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">維權中心</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  AI 鑑定報告、一鍵截圖存證、自動生成檢舉信，全方位守護權益。
                </p>
              </div>
            </Link>

            {/* Feature 4 */}
            <Link href="/evidence" className="group">
              <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-100 hover:shadow-lg hover:shadow-amber-100 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <FileCheck className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">法律存證</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  SHA-256 雜湊認證、時間戳記水印、完整證據鏈，法院採信有保障。
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            準備好保護您的創作了嗎？
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            立即上傳您的第一張圖片，讓 Image Guardian Pro 為您守護每一份創意。
          </p>
          <Link
            href="/assets"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            立即開始
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-700" />
            <span className="font-semibold text-slate-700">Image Guardian Pro</span>
          </div>
          <p className="text-sm text-slate-500">
            Powered by Gemini AI · Version 1.0
          </p>
        </div>
      </footer>
    </div>
  );
}
