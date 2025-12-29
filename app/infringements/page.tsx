import { Suspense } from "react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { InfringementList } from "@/components/infringements/infringement-list";
import { InfringementStats } from "@/components/infringements/infringement-stats";
import { InfringementFilters } from "@/components/infringements/infringement-filters";
import { getInfringements, getInfringementStats } from "@/app/actions/infringement-actions";

export const dynamic = "force-dynamic";

export default async function InfringementsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; platform?: string }>;
}) {
  const params = await searchParams;
  const [{ data: infringements }, stats] = await Promise.all([
    getInfringements({
      status: params.status,
      priority: params.priority,
      platform: params.platform,
    }),
    getInfringementStats(),
  ]);

  return (
    <PageContainer title="維權中心">
      <PageHeader
        title="維權中心"
        description="追蹤侵權案件、執行存證、生成檢舉信"
      />

      <div className="space-y-6">
        {/* 統計卡片 */}
        <Suspense fallback={<div className="h-24 bg-white animate-pulse rounded-2xl" />}>
          <InfringementStats stats={stats} />
        </Suspense>

        {/* 篩選工具列 */}
        <InfringementFilters
          currentStatus={params.status}
          currentPriority={params.priority}
          currentPlatform={params.platform}
        />

        {/* 案件清單 */}
        <Suspense fallback={<div className="h-96 bg-white animate-pulse rounded-2xl" />}>
          <InfringementList infringements={infringements || []} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
