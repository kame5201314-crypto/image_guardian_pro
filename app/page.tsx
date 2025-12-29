import Link from "next/link";
import { getAssets } from "@/app/actions/asset-actions";
import { getScans } from "@/app/actions/scan-actions";
import { getInfringementStats } from "@/app/actions/infringement-actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // 取得真實數據
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
    <div className="min-h-[80vh] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="text-center max-w-3xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-700 shadow-2xl">
              <span className="text-4xl">🛡️</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-neutral-900 mb-6">
            Image Guardian
            <span className="block text-neutral-400 text-3xl md:text-4xl font-normal mt-2">
              Pro
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-neutral-500 mb-12 max-w-xl mx-auto leading-relaxed">
            AI 智慧圖片守護系統。
            <br />
            保護您的視覺資產，追蹤侵權，維護權益。
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/assets"
              className="inline-flex items-center justify-center px-8 py-4 bg-neutral-900 text-white rounded-full text-lg font-medium hover:bg-neutral-800 transition-all hover:scale-105 shadow-lg"
            >
              開始使用
            </Link>
            <Link
              href="/scan"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-neutral-900 rounded-full text-lg font-medium border border-neutral-200 hover:border-neutral-400 transition-all hover:scale-105"
            >
              發起掃描
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-neutral-100 bg-neutral-50/50">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <Link href="/assets" className="group text-center">
              <div className="text-4xl md:text-5xl font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                {assetCount}
              </div>
              <div className="text-sm text-neutral-500 mt-2">受保護資產</div>
            </Link>

            <Link href="/scan" className="group text-center">
              <div className="text-4xl md:text-5xl font-semibold text-neutral-900 group-hover:text-emerald-600 transition-colors">
                {scanCount}
              </div>
              <div className="text-sm text-neutral-500 mt-2">掃描次數</div>
            </Link>

            <Link href="/scan" className="group text-center">
              <div className="text-4xl md:text-5xl font-semibold text-neutral-900 group-hover:text-amber-600 transition-colors">
                {matchCount}
              </div>
              <div className="text-sm text-neutral-500 mt-2">偵測結果</div>
            </Link>

            <Link href="/infringements" className="group text-center">
              <div className="text-4xl md:text-5xl font-semibold text-neutral-900 group-hover:text-red-600 transition-colors">
                {pendingCases}
              </div>
              <div className="text-sm text-neutral-500 mt-2">待處理案件</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-neutral-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-semibold text-center text-neutral-900 mb-16">
            核心功能
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Link href="/assets" className="group">
              <div className="p-8 rounded-3xl bg-white border border-neutral-100 hover:border-neutral-200 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📁</span>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  資產庫
                </h3>
                <p className="text-neutral-500 leading-relaxed">
                  上傳並管理您的原創圖片，建立完整的數位資產清單。
                </p>
              </div>
            </Link>

            {/* Feature 2 */}
            <Link href="/scan" className="group">
              <div className="p-8 rounded-3xl bg-white border border-neutral-100 hover:border-neutral-200 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  智慧掃描
                </h3>
                <p className="text-neutral-500 leading-relaxed">
                  AI 驅動的全網掃描，偵測蝦皮、momo、露天等平台的侵權圖片。
                </p>
              </div>
            </Link>

            {/* Feature 3 */}
            <Link href="/infringements" className="group">
              <div className="p-8 rounded-3xl bg-white border border-neutral-100 hover:border-neutral-200 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">⚖️</span>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  維權中心
                </h3>
                <p className="text-neutral-500 leading-relaxed">
                  一鍵存證、AI 鑑定報告、自動生成檢舉信，守護您的權益。
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-8">
        <div className="text-center text-sm text-neutral-400">
          <p>Image Guardian Pro v1.0</p>
          <p className="mt-1">Powered by Gemini AI</p>
        </div>
      </footer>
    </div>
  );
}
