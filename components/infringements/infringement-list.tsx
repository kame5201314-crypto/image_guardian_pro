"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InfringementActions } from "./infringement-actions";
import { ReportModal } from "./report-modal";
import type { Infringement, Asset } from "@/types/database";

type InfringementWithAsset = Infringement & {
  assets: Pick<Asset, "id" | "name" | "file_url"> | null;
};

interface ListProps {
  infringements: InfringementWithAsset[];
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  evidenced: "bg-blue-100 text-blue-800",
  reported: "bg-purple-100 text-purple-800",
  resolved: "bg-green-100 text-green-800",
  dismissed: "bg-neutral-100 text-neutral-600",
};

const statusLabels: Record<string, string> = {
  pending: "待處理",
  evidenced: "已存證",
  reported: "已檢舉",
  resolved: "已解決",
  dismissed: "已忽略",
};

const priorityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-neutral-100 text-neutral-600",
};

const priorityLabels: Record<string, string> = {
  critical: "極嚴重",
  high: "高",
  medium: "中",
  low: "低",
};

const platformLabels: Record<string, string> = {
  shopee: "蝦皮購物",
  momo: "momo購物網",
  ruten: "露天拍賣",
  google: "Google",
};

export function InfringementList({ infringements }: ListProps) {
  const [selectedInfringement, setSelectedInfringement] = useState<InfringementWithAsset | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  if (infringements.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🛡️</div>
        <h3 className="text-lg font-medium text-neutral-900 mb-2">
          尚無侵權案件
        </h3>
        <p className="text-neutral-500">
          當掃描發現疑似侵權時，會在這裡顯示
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {infringements.map((infringement) => (
          <div
            key={infringement.id}
            className="bg-white border border-neutral-100 rounded-2xl p-6
                       hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start gap-6">
              {/* 圖片對比 */}
              <div className="flex gap-2 shrink-0">
                {/* 原始圖片 */}
                <div className="relative">
                  {infringement.assets?.file_url ? (
                    <Image
                      src={infringement.assets.file_url}
                      alt="原始圖片"
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-neutral-100 rounded-xl flex items-center justify-center text-2xl">
                      📷
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    原
                  </span>
                </div>

                {/* VS */}
                <div className="flex items-center text-neutral-400 text-sm font-medium">
                  VS
                </div>

                {/* 侵權截圖 */}
                <div className="relative">
                  {infringement.screenshot_url ? (
                    <Image
                      src={infringement.screenshot_url}
                      alt="侵權截圖"
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-red-50 rounded-xl flex items-center justify-center text-2xl">
                      ⚠️
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    疑
                  </span>
                </div>
              </div>

              {/* 案件資訊 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-neutral-500">
                        {infringement.case_number}
                      </span>
                      <Badge className={statusColors[infringement.status]}>
                        {statusLabels[infringement.status] || infringement.status}
                      </Badge>
                      <Badge className={priorityColors[infringement.priority]}>
                        {priorityLabels[infringement.priority] || infringement.priority}
                      </Badge>
                    </div>

                    <h3 className="font-medium text-neutral-900 mb-1 truncate">
                      {infringement.assets?.name || "未知資產"}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <span>
                        {platformLabels[infringement.infringing_platform] || infringement.infringing_platform}
                      </span>
                      {infringement.ai_confidence_score && (
                        <span className="flex items-center gap-1">
                          🤖 信心指數 {infringement.ai_confidence_score}%
                        </span>
                      )}
                      {infringement.screenshot_hash && (
                        <span className="font-mono text-xs truncate max-w-[200px]">
                          SHA: {infringement.screenshot_hash.slice(0, 16)}...
                        </span>
                      )}
                    </div>

                    {infringement.ai_conclusion && (
                      <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
                        {infringement.ai_conclusion}
                      </p>
                    )}
                  </div>

                  {/* 操作按鈕 */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedInfringement(infringement);
                        setShowReportModal(true);
                      }}
                    >
                      查看詳情
                    </Button>
                    <InfringementActions infringement={infringement} />
                  </div>
                </div>
              </div>
            </div>

            {/* 時間線 */}
            <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-6 text-xs text-neutral-400">
              <span>建立：{new Date(infringement.created_at).toLocaleString("zh-TW")}</span>
              {infringement.screenshot_taken_at && (
                <span>存證：{new Date(infringement.screenshot_taken_at).toLocaleString("zh-TW")}</span>
              )}
              {infringement.ai_assessed_at && (
                <span>鑑定：{new Date(infringement.ai_assessed_at).toLocaleString("zh-TW")}</span>
              )}
              {infringement.reported_at && (
                <span>檢舉：{new Date(infringement.reported_at).toLocaleString("zh-TW")}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 檢舉信 Modal */}
      {showReportModal && selectedInfringement && (
        <ReportModal
          infringement={selectedInfringement}
          onClose={() => {
            setShowReportModal(false);
            setSelectedInfringement(null);
          }}
        />
      )}
    </>
  );
}
