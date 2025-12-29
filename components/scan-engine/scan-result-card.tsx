"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Scale } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { CONFIG } from "@/config/constants";
import type { ScanMatch } from "@/types/database";

interface ScanResultCardProps {
  match: ScanMatch & {
    assets?: { id: string; name: string; file_url: string } | null;
  };
  onCreateEvidence?: (matchId: string) => void;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline" }> = {
  [CONFIG.MATCH_STATUS.DETECTED]: { label: "待處理", variant: "warning" },
  [CONFIG.MATCH_STATUS.REPORTED]: { label: "已檢舉", variant: "default" },
  [CONFIG.MATCH_STATUS.RESOLVED]: { label: "已解決", variant: "success" },
  [CONFIG.MATCH_STATUS.IGNORED]: { label: "已忽略", variant: "secondary" },
};

export function ScanResultCard({ match, onCreateEvidence }: ScanResultCardProps) {
  const status = statusConfig[match.status] || statusConfig.detected;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {match.assets?.file_url && (
              <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-neutral-100">
                <Image
                  src={match.assets.file_url}
                  alt="Original"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <CardTitle className="text-base">
                {match.assets?.name || "未知資產"}
              </CardTitle>
              <p className="text-xs text-neutral-500 mt-0.5">
                {match.source_platform}
              </p>
            </div>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Similarity Score */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-neutral-500">相似度</span>
              <span className="font-medium">{match.similarity_score}%</span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  match.similarity_score >= 90
                    ? "bg-red-500"
                    : match.similarity_score >= 80
                    ? "bg-amber-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${match.similarity_score}%` }}
              />
            </div>
          </div>
        </div>

        {/* Source URL */}
        <div>
          <p className="text-xs text-neutral-500 mb-1">發現來源</p>
          <a
            href={match.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-neutral-900 hover:text-neutral-600 flex items-center gap-1 truncate"
          >
            {match.source_url}
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
          </a>
        </div>

        {/* Detected Time */}
        <p className="text-xs text-neutral-400">
          發現時間：{formatDateTime(match.detected_at)}
        </p>

        {/* Actions */}
        {match.status === CONFIG.MATCH_STATUS.DETECTED && onCreateEvidence && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onCreateEvidence(match.id)}
          >
            <Scale className="h-4 w-4 mr-2" />
            建立存證
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
