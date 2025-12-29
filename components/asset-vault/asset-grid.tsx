"use client";

import { AssetCard } from "./asset-card";
import { FolderOpen } from "lucide-react";
import type { Asset } from "@/types/database";

interface AssetGridProps {
  assets: Asset[];
}

export function AssetGrid({ assets }: AssetGridProps) {
  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-2xl bg-neutral-100 p-6 mb-4">
          <FolderOpen className="h-12 w-12 text-neutral-400" />
        </div>
        <h3 className="text-lg font-medium text-neutral-900">尚無資產</h3>
        <p className="text-sm text-neutral-500 mt-1">
          上傳您的第一張原創圖片開始保護
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
}
