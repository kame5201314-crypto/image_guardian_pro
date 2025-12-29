"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radar } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { CONFIG } from "@/config/constants";
import type { Scan, Asset } from "@/types/database";

interface ScanListProps {
  scans: (Scan & { assets: Pick<Asset, "id" | "name" | "file_url"> | null })[];
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline" }> = {
  [CONFIG.SCAN_STATUS.PENDING]: { label: "等待中", variant: "secondary" },
  [CONFIG.SCAN_STATUS.RUNNING]: { label: "掃描中", variant: "warning" },
  [CONFIG.SCAN_STATUS.COMPLETED]: { label: "已完成", variant: "success" },
  [CONFIG.SCAN_STATUS.FAILED]: { label: "失敗", variant: "destructive" },
};

export function ScanList({ scans }: ScanListProps) {
  if (scans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-2xl bg-neutral-100 p-6 mb-4">
          <Radar className="h-12 w-12 text-neutral-400" />
        </div>
        <h3 className="text-lg font-medium text-neutral-900">尚無掃描紀錄</h3>
        <p className="text-sm text-neutral-500 mt-1">
          發起您的第一次全網掃描
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {scans.map((scan) => {
        const status = statusConfig[scan.status] || statusConfig.pending;

        return (
          <Card key={scan.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {scan.assets?.file_url && (
                    <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-neutral-100">
                      <img
                        src={scan.assets.file_url}
                        alt={scan.assets.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-base">
                      {scan.assets?.name || "未知資產"}
                    </CardTitle>
                    <p className="text-xs text-neutral-500">
                      {formatDateTime(scan.created_at)}
                    </p>
                  </div>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div className="flex gap-2">
                  {scan.platforms.map((platform) => (
                    <span
                      key={platform}
                      className="px-2 py-0.5 bg-neutral-100 rounded text-xs text-neutral-600"
                    >
                      {CONFIG.SCAN_PLATFORMS.find((p) => p.id === platform)?.name || platform}
                    </span>
                  ))}
                </div>
                <span className="text-neutral-500">
                  發現 <strong className="text-neutral-900">{scan.match_count}</strong> 個匹配
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
