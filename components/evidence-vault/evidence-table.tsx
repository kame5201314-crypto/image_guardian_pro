"use client";

import { useState } from "react";
import { Scale, Trash2, ExternalLink, MoreVertical, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { deleteEvidence } from "@/app/actions/evidence-actions";
import { formatDateTime } from "@/lib/utils";
import { CONFIG } from "@/config/constants";
import type { Evidence, Asset } from "@/types/database";

interface EvidenceTableProps {
  evidences: (Evidence & {
    assets: Pick<Asset, "id" | "name" | "file_url"> | null;
  })[];
}

const typeLabels: Record<string, string> = {
  screenshot: "網頁截圖",
  webpage_archive: "網頁存檔",
  hash_certificate: "雜湊憑證",
};

export function EvidenceTable({ evidences }: EvidenceTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await deleteEvidence(deleteId);
      setDeleteId(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (evidences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-2xl bg-neutral-100 p-6 mb-4">
          <Scale className="h-12 w-12 text-neutral-400" />
        </div>
        <h3 className="text-lg font-medium text-neutral-900">尚無存證紀錄</h3>
        <p className="text-sm text-neutral-500 mt-1">
          建立您的第一筆維權存證
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-neutral-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50/50">
              <TableHead>存證標題</TableHead>
              <TableHead>關聯資產</TableHead>
              <TableHead>類型</TableHead>
              <TableHead>建立時間</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evidences.map((evidence) => (
              <TableRow key={evidence.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{evidence.title}</p>
                    {evidence.description && (
                      <p className="text-xs text-neutral-500 truncate max-w-xs">
                        {evidence.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {evidence.assets?.file_url && (
                      <img
                        src={evidence.assets.file_url}
                        alt=""
                        className="h-8 w-8 rounded object-cover"
                      />
                    )}
                    <span className="text-sm">
                      {evidence.assets?.name || "未知"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {typeLabels[evidence.evidence_type] || evidence.evidence_type}
                  </Badge>
                </TableCell>
                <TableCell className="text-neutral-500 text-sm">
                  {formatDateTime(evidence.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {evidence.file_url && (
                      <a
                        href={evidence.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setDeleteId(evidence.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
          </DialogHeader>
          <p className="text-neutral-600">
            確定要刪除此存證紀錄嗎？此操作無法復原。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "刪除"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
