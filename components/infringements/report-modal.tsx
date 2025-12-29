"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generateInfringementReport, markAsReported } from "@/app/actions/infringement-actions";
import type { Infringement, Asset, AIAssessmentReport } from "@/types/database";

type InfringementWithAsset = Infringement & {
  assets: Pick<Asset, "id" | "name" | "file_url"> | null;
};

interface ModalProps {
  infringement: InfringementWithAsset;
  onClose: () => void;
}

export function ReportModal({ infringement, onClose }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(
    infringement.report_email_content || null
  );
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 解析 AI 報告
  const aiReport = infringement.ai_assessment_report as AIAssessmentReport | null;

  // 生成檢舉信
  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);

    const result = await generateInfringementReport(infringement.id);

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setReportContent(result.data);
    }

    setLoading(false);
  };

  // 複製到剪貼簿
  const handleCopy = async () => {
    if (!reportContent) return;

    try {
      await navigator.clipboard.writeText(reportContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("無法複製到剪貼簿");
    }
  };

  // 標記為已檢舉
  const handleMarkReported = async () => {
    setLoading(true);
    await markAsReported(infringement.id, "email");
    setLoading(false);
    onClose();
  };

  // 開啟郵件客戶端
  const handleOpenEmail = () => {
    if (!reportContent) return;

    const subject = encodeURIComponent(`圖片侵權檢舉 - ${infringement.case_number}`);
    const body = encodeURIComponent(reportContent);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 標題列 */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              案件詳情
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              {infringement.case_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center text-xl"
          >
            ×
          </button>
        </div>

        {/* 內容區 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 圖片對比 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-neutral-500">原始圖片</h3>
              {infringement.assets?.file_url ? (
                <Image
                  src={infringement.assets.file_url}
                  alt="原始圖片"
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover rounded-xl border border-neutral-200"
                />
              ) : (
                <div className="w-full h-48 bg-neutral-100 rounded-xl flex items-center justify-center">
                  無圖片
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-neutral-500">侵權截圖</h3>
              {infringement.screenshot_url ? (
                <Image
                  src={infringement.screenshot_url}
                  alt="侵權截圖"
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover rounded-xl border border-red-200"
                />
              ) : (
                <div className="w-full h-48 bg-red-50 rounded-xl flex items-center justify-center text-neutral-500">
                  尚未擷取存證
                </div>
              )}
            </div>
          </div>

          {/* AI 鑑定報告 */}
          {aiReport && (
            <div className="bg-neutral-50 rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                🤖 AI 鑑定報告
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-neutral-500 mb-1">相似度</div>
                  <div className="text-2xl font-semibold">
                    {aiReport.subject_comparison.match_percentage}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500 mb-1">信心指數</div>
                  <div className="text-2xl font-semibold">
                    {aiReport.conclusion.confidence_score}%
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-neutral-700 mb-1">主體分析</div>
                  <p className="text-sm text-neutral-600">
                    {aiReport.subject_comparison.analysis}
                  </p>
                </div>

                <div>
                  <div className="text-sm font-medium text-neutral-700 mb-1">背景分析</div>
                  <p className="text-sm text-neutral-600">
                    {aiReport.background_comparison.analysis}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {aiReport.manipulation_detection.watermark_removed && (
                    <Badge className="bg-red-100 text-red-800">浮水印移除</Badge>
                  )}
                  {aiReport.manipulation_detection.cropped && (
                    <Badge className="bg-orange-100 text-orange-800">已裁切</Badge>
                  )}
                  {aiReport.manipulation_detection.color_adjusted && (
                    <Badge className="bg-yellow-100 text-yellow-800">調色</Badge>
                  )}
                </div>

                <div className="pt-3 border-t border-neutral-200">
                  <div className="text-sm font-medium text-neutral-700 mb-1">法律建議</div>
                  <p className="text-sm text-neutral-600">
                    {aiReport.conclusion.legal_recommendation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 存證資訊 */}
          {infringement.screenshot_hash && (
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                📋 存證資訊
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">擷取時間</span>
                  <span className="font-mono">
                    {infringement.screenshot_taken_at
                      ? new Date(infringement.screenshot_taken_at).toLocaleString("zh-TW")
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">SHA-256 雜湊值</span>
                  <span className="font-mono text-xs truncate max-w-[300px]">
                    {infringement.screenshot_hash}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">侵權網址</span>
                  <a
                    href={infringement.infringing_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate max-w-[300px]"
                  >
                    {infringement.infringing_url}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* 檢舉信內容 */}
          {reportContent && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-neutral-900">📝 檢舉信內容</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? "✓ 已複製" : "複製"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleOpenEmail}>
                    開啟郵件
                  </Button>
                </div>
              </div>
              <pre className="bg-neutral-900 text-neutral-100 rounded-xl p-4 text-sm overflow-x-auto whitespace-pre-wrap">
                {reportContent}
              </pre>
            </div>
          )}

          {/* 錯誤提示 */}
          {error && (
            <div className="bg-red-50 text-red-700 rounded-xl p-4 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="p-6 border-t border-neutral-100 flex justify-between items-center">
          <Button variant="outline" onClick={onClose}>
            關閉
          </Button>

          <div className="flex gap-3">
            {!reportContent && aiReport && (
              <Button onClick={handleGenerateReport} disabled={loading}>
                {loading ? "生成中..." : "生成檢舉信"}
              </Button>
            )}

            {reportContent && infringement.status !== "reported" && (
              <Button onClick={handleMarkReported} disabled={loading}>
                {loading ? "處理中..." : "標記為已檢舉"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
