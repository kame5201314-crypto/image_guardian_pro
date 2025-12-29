import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { EvidenceCreator } from "@/components/evidence-vault/evidence-creator";
import { EvidenceTable } from "@/components/evidence-vault/evidence-table";
import { getEvidences } from "@/app/actions/evidence-actions";
import { getAssets } from "@/app/actions/asset-actions";

export default async function EvidencePage() {
  const [evidencesResult, assetsResult] = await Promise.all([
    getEvidences(),
    getAssets(),
  ]);

  return (
    <PageContainer title="存證庫">
      <PageHeader
        title="維權存證中心"
        description="建立法律效力的存證紀錄，保障您的智慧財產權"
        action={<EvidenceCreator assets={assetsResult.data || []} />}
      />

      {evidencesResult.error ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200">
          <p className="text-red-500">{evidencesResult.error}</p>
          <p className="text-sm text-neutral-500 mt-2">
            請確認 Supabase 已正確設定並建立資料表
          </p>
        </div>
      ) : (
        <EvidenceTable evidences={evidencesResult.data || []} />
      )}
    </PageContainer>
  );
}
