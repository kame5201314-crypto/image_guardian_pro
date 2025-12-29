import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { ScanLauncher } from "@/components/scan-engine/scan-launcher";
import { ScanList } from "@/components/scan-engine/scan-list";
import { getScans } from "@/app/actions/scan-actions";
import { getAssets } from "@/app/actions/asset-actions";

export default async function ScanPage() {
  const [scansResult, assetsResult] = await Promise.all([
    getScans(),
    getAssets(),
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="掃描引擎"
        description="全網監控，偵測潛在侵權行為"
        action={<ScanLauncher assets={assetsResult.data || []} />}
      />

      {scansResult.error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{scansResult.error}</p>
          <p className="text-sm text-neutral-500 mt-2">
            請確認 Supabase 已正確設定並建立資料表
          </p>
        </div>
      ) : (
        <ScanList scans={scansResult.data || []} />
      )}
    </PageContainer>
  );
}
