"use client";

import { useState } from "react";
import { Radar, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createScan } from "@/app/actions/scan-actions";
import { CONFIG } from "@/config/constants";
import type { Asset } from "@/types/database";

interface ScanLauncherProps {
  assets: Asset[];
}

export function ScanLauncher({ assets }: ScanLauncherProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    CONFIG.SCAN_PLATFORMS.filter((p) => p.enabled).map((p) => p.id)
  );
  const [error, setError] = useState<string | null>(null);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedAsset || selectedPlatforms.length === 0) {
      setError("請選擇資產和至少一個掃描平台");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createScan(selectedAsset, selectedPlatforms);
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setSelectedAsset(null);
      }
    } catch {
      setError("發起掃描失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Radar className="h-4 w-4 mr-2" />
          發起掃描
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>發起全網掃描</DialogTitle>
          <DialogDescription>
            選擇要掃描的資產和目標平台
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Asset Selection */}
          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-2">
              選擇資產
            </label>
            {assets.length === 0 ? (
              <p className="text-sm text-neutral-500 bg-neutral-50 p-4 rounded-xl text-center">
                尚無資產，請先上傳原圖
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                {assets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setSelectedAsset(asset.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedAsset === asset.id
                        ? "border-neutral-900 ring-2 ring-neutral-900/20"
                        : "border-transparent hover:border-neutral-200"
                    }`}
                  >
                    <img
                      src={asset.file_url}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                    {selectedAsset === asset.id && (
                      <div className="absolute inset-0 bg-neutral-900/40 flex items-center justify-center">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Platform Selection */}
          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-2">
              掃描平台
            </label>
            <div className="flex flex-wrap gap-2">
              {CONFIG.SCAN_PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => togglePlatform(platform.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedPlatforms.includes(platform.id)
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {platform.name}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !selectedAsset || selectedPlatforms.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                掃描中...
              </>
            ) : (
              "開始掃描"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
