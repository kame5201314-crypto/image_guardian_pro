"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  captureInfringementEvidence,
  performAIAssessment,
  generateInfringementReport,
  markAsReported,
  updateInfringementStatus,
  deleteInfringement,
} from "@/app/actions/infringement-actions";
import type { Infringement } from "@/types/database";

interface ActionsProps {
  infringement: Infringement;
}

export function InfringementActions({ infringement }: ActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: string, fn: () => Promise<{ success?: boolean; error?: string }>) => {
    setLoading(action);
    setError(null);

    try {
      const result = await fn();
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    } catch {
      setError("操作失敗");
    } finally {
      setLoading(null);
    }
  };

  const actions = [
    {
      id: "capture",
      label: "擷取存證",
      icon: "📸",
      show: !infringement.screenshot_url,
      action: () => captureInfringementEvidence(infringement.id),
    },
    {
      id: "assess",
      label: "AI 鑑定",
      icon: "🤖",
      show: !infringement.ai_assessed_at,
      action: () => performAIAssessment(infringement.id),
    },
    {
      id: "report",
      label: "生成檢舉信",
      icon: "📝",
      show: !!infringement.ai_assessed_at && !infringement.report_email_content,
      action: async () => {
        const result = await generateInfringementReport(infringement.id);
        return { success: !result.error, error: result.error || undefined };
      },
    },
    {
      id: "mark_reported",
      label: "標記已檢舉",
      icon: "✅",
      show: infringement.status === "evidenced" || infringement.report_email_content,
      action: () => markAsReported(infringement.id, "email"),
    },
    {
      id: "resolve",
      label: "標記已解決",
      icon: "🎉",
      show: infringement.status === "reported",
      action: () => updateInfringementStatus(infringement.id, "resolved"),
    },
    {
      id: "dismiss",
      label: "忽略",
      icon: "🚫",
      show: infringement.status === "pending",
      action: () => updateInfringementStatus(infringement.id, "dismissed"),
    },
  ];

  const visibleActions = actions.filter((a) => a.show);

  return (
    <div className="relative">
      {/* 下拉選單 */}
      <div className="flex items-center gap-1">
        {visibleActions.slice(0, 2).map((action) => (
          <Button
            key={action.id}
            variant="ghost"
            size="sm"
            disabled={loading !== null}
            onClick={() => handleAction(action.id, action.action)}
            className="text-xs"
          >
            {loading === action.id ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <span>{action.icon}</span>
            )}
            <span className="ml-1 hidden sm:inline">{action.label}</span>
          </Button>
        ))}

        {/* 更多操作 */}
        {visibleActions.length > 2 && (
          <div className="relative group">
            <Button variant="ghost" size="sm" className="text-xs">
              ⋯
            </Button>
            <div className="absolute right-0 top-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg
                            opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10
                            min-w-[160px]">
              {visibleActions.slice(2).map((action) => (
                <button
                  key={action.id}
                  disabled={loading !== null}
                  onClick={() => handleAction(action.id, action.action)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2
                             disabled:opacity-50 first:rounded-t-xl last:rounded-b-xl"
                >
                  {loading === action.id ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <span>{action.icon}</span>
                  )}
                  {action.label}
                </button>
              ))}

              {/* 刪除按鈕 */}
              <div className="border-t border-neutral-100">
                <button
                  disabled={loading !== null}
                  onClick={() => {
                    if (confirm("確定要刪除此案件？此操作無法復原。")) {
                      handleAction("delete", () => deleteInfringement(infringement.id));
                    }
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2
                             disabled:opacity-50 rounded-b-xl"
                >
                  {loading === "delete" ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <span>🗑️</span>
                  )}
                  刪除案件
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 錯誤提示 */}
      {error && (
        <div className="absolute top-full left-0 mt-1 px-3 py-1 bg-red-100 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
