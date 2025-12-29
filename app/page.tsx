import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Radar, Scale, AlertTriangle } from "lucide-react";
import Link from "next/link";

const stats = [
  {
    title: "資產總數",
    value: "0",
    description: "已上傳原圖",
    icon: FolderOpen,
    href: "/assets",
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "掃描次數",
    value: "0",
    description: "全網監控",
    icon: Radar,
    href: "/scan",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "侵權偵測",
    value: "0",
    description: "待處理案件",
    icon: AlertTriangle,
    href: "/scan",
    color: "bg-amber-50 text-amber-600",
  },
  {
    title: "存證紀錄",
    value: "0",
    description: "法律保障",
    icon: Scale,
    href: "/evidence",
    color: "bg-purple-50 text-purple-600",
  },
];

export default function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="戰情總覽"
        description="Image Guardian Pro - 您的智慧財產守護者"
      />

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-500">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-lg p-2 ${stat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-4">快速操作</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/assets">
            <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg group">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-xl bg-neutral-100 p-3 group-hover:bg-neutral-900 transition-colors">
                  <FolderOpen className="h-6 w-6 text-neutral-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-medium">上傳原創圖片</h3>
                  <p className="text-sm text-neutral-500">建立您的數位資產庫</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/scan">
            <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg group">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-xl bg-neutral-100 p-3 group-hover:bg-neutral-900 transition-colors">
                  <Radar className="h-6 w-6 text-neutral-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-medium">發起全網掃描</h3>
                  <p className="text-sm text-neutral-500">偵測潛在侵權行為</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/evidence">
            <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg group">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-xl bg-neutral-100 p-3 group-hover:bg-neutral-900 transition-colors">
                  <Scale className="h-6 w-6 text-neutral-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-medium">建立維權存證</h3>
                  <p className="text-sm text-neutral-500">法律保障一鍵完成</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* System Info */}
      <div className="mt-12 text-center text-sm text-neutral-400">
        <p>Image Guardian Pro v0.1.0</p>
        <p className="mt-1">請先在 Supabase 建立資料表後，填入 .env.local 環境變數</p>
      </div>
    </PageContainer>
  );
}
