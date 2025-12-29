import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { AssetUploader } from "@/components/asset-vault/asset-uploader";
import { AssetGrid } from "@/components/asset-vault/asset-grid";
import { getAssets } from "@/app/actions/asset-actions";

export default async function AssetsPage() {
  const { data: assets, error } = await getAssets();

  return (
    <PageContainer>
      <PageHeader
        title="資產庫"
        description="管理您的原創圖片資產，開始智慧財產保護"
        action={<AssetUploader />}
      />

      {error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <p className="text-sm text-neutral-500 mt-2">
            請確認 Supabase 已正確設定並建立資料表
          </p>
        </div>
      ) : (
        <AssetGrid assets={assets || []} />
      )}
    </PageContainer>
  );
}
