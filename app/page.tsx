import Link from "next/link";
import { getAssets } from "@/app/actions/asset-actions";
import { getScans } from "@/app/actions/scan-actions";
import { getInfringementStats } from "@/app/actions/infringement-actions";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import {
  FolderOpen,
  Radar,
  Shield,
  Scale,
  ArrowRight,
  TrendingUp,
  ImageIcon,
  AlertTriangle,
  CheckCircle,
  Sparkles,
} from "lucide-react";

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
  const resolvedCases = infringementStats.resolved || 0;

  return (
    <div className="min-h-screen">
      <DashboardHeader title="儀表板" />

      <div className="p-6 lg:p-8 space-y-6">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1d1d1f] to-[#424245] p-6 lg:p-8">
          <div className="relative z-10">
            <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">
              歡迎使用 Image Guardian Pro
            </h2>
            <p className="text-white/60 text-sm lg:text-base max-w-xl">
              使用 AI 技術保護您的視覺資產，全天候監控網路侵權行為
            </p>
            <Link
              href="/assets"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-white text-[#1d1d1f] rounded-xl text-sm font-medium hover:bg-neutral-100 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              開始上傳
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-48 h-48 lg:w-64 lg:h-64">
            <div className="absolute top-4 right-4 w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-white/5 flex items-center justify-center">
              <Shield className="w-12 h-12 lg:w-16 lg:h-16 text-white/20" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/assets" className="group">
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:shadow-lg hover:border-neutral-300 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-neutral-500">受保護資產</span>
                <div className="w-9 h-9 rounded-xl bg-[#0071e3]/10 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-[#0071e3]" />
                </div>
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-[#1d1d1f]">{assetCount}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                持續增長中
              </p>
            </div>
          </Link>

          <Link href="/scan" className="group">
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:shadow-lg hover:border-neutral-300 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-neutral-500">掃描次數</span>
                <div className="w-9 h-9 rounded-xl bg-[#34c759]/10 flex items-center justify-center">
                  <Radar className="w-4 h-4 text-[#34c759]" />
                </div>
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-[#1d1d1f]">{scanCount}</p>
              <p className="text-xs text-neutral-500 mt-1">
                偵測到 {matchCount} 個結果
              </p>
            </div>
          </Link>

          <Link href="/infringements" className="group">
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:shadow-lg hover:border-neutral-300 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-neutral-500">待處理案件</span>
                <div className="w-9 h-9 rounded-xl bg-[#ff9500]/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-[#ff9500]" />
                </div>
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-[#1d1d1f]">{pendingCases}</p>
              <p className="text-xs text-neutral-500 mt-1">
                需要您的關注
              </p>
            </div>
          </Link>

          <Link href="/infringements" className="group">
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:shadow-lg hover:border-neutral-300 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-neutral-500">已解決</span>
                <div className="w-9 h-9 rounded-xl bg-[#34c759]/10 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-[#34c759]" />
                </div>
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-[#1d1d1f]">{resolvedCases}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                維權成功
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/assets" className="group">
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:shadow-lg hover:border-[#0071e3] transition-all duration-200">
              <div className="w-11 h-11 rounded-xl bg-[#0071e3]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FolderOpen className="w-5 h-5 text-[#0071e3]" />
              </div>
              <h3 className="font-semibold text-[#1d1d1f] mb-1">資產管理</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                上傳並管理原創圖片
              </p>
            </div>
          </Link>

          <Link href="/scan" className="group">
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:shadow-lg hover:border-[#34c759] transition-all duration-200">
              <div className="w-11 h-11 rounded-xl bg-[#34c759]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Radar className="w-5 h-5 text-[#34c759]" />
              </div>
              <h3 className="font-semibold text-[#1d1d1f] mb-1">智慧掃描</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                AI 驅動全網掃描
              </p>
            </div>
          </Link>

          <Link href="/infringements" className="group">
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:shadow-lg hover:border-[#7c3aed] transition-all duration-200">
              <div className="w-11 h-11 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5 text-[#7c3aed]" />
              </div>
              <h3 className="font-semibold text-[#1d1d1f] mb-1">維權中心</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                一鍵截圖存證檢舉
              </p>
            </div>
          </Link>

          <Link href="/evidence" className="group">
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 hover:shadow-lg hover:border-[#ff9500] transition-all duration-200">
              <div className="w-11 h-11 rounded-xl bg-[#ff9500]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Scale className="w-5 h-5 text-[#ff9500]" />
              </div>
              <h3 className="font-semibold text-[#1d1d1f] mb-1">法律存證</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                SHA-256 雜湊認證
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
