"use client";

import { useState } from "react";
import { Scale, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createEvidence } from "@/app/actions/evidence-actions";
import { CONFIG } from "@/config/constants";
import type { Asset } from "@/types/database";

interface EvidenceCreatorProps {
  assets: Asset[];
}

export function EvidenceCreator({ assets }: EvidenceCreatorProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await createEvidence(formData);

      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
      }
    } catch {
      setError("建立存證失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Scale className="h-4 w-4 mr-2" />
          建立存證
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>建立維權存證</DialogTitle>
          <DialogDescription>
            建立法律效力的存證紀錄
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Asset Selection */}
          <div>
            <label className="text-sm font-medium text-neutral-700">
              關聯資產
            </label>
            <select
              name="asset_id"
              required
              className="mt-1 w-full h-10 rounded-xl border border-neutral-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
            >
              <option value="">選擇資產...</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name}
                </option>
              ))}
            </select>
          </div>

          {/* Evidence Type */}
          <div>
            <label className="text-sm font-medium text-neutral-700">
              存證類型
            </label>
            <select
              name="evidence_type"
              required
              className="mt-1 w-full h-10 rounded-xl border border-neutral-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
            >
              {CONFIG.EVIDENCE_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-neutral-700">
              存證標題
            </label>
            <Input
              name="title"
              placeholder="輸入存證標題"
              className="mt-1"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-neutral-700">
              詳細描述
            </label>
            <Textarea
              name="description"
              placeholder="輸入詳細描述..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="text-sm font-medium text-neutral-700">
              附件（選填）
            </label>
            <Input
              type="file"
              name="file"
              accept="image/*,.pdf"
              className="mt-1"
            />
            <p className="text-xs text-neutral-400 mt-1">
              支援圖片和 PDF 檔案
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  建立中...
                </>
              ) : (
                "確認建立"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
