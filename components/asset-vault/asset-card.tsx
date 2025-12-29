"use client";

import { useState } from "react";
import Image from "next/image";
import { MoreVertical, Pencil, Trash2, Radar, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { updateAsset, deleteAsset } from "@/app/actions/asset-actions";
import { formatFileSize, formatDateTime } from "@/lib/utils";
import type { Asset } from "@/types/database";

interface AssetCardProps {
  asset: Asset;
}

export function AssetCard({ asset }: AssetCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editName, setEditName] = useState(asset.name);
  const [editDescription, setEditDescription] = useState(asset.description || "");

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateAsset(asset.id, {
        name: editName,
        description: editDescription || null,
      });
      setShowEdit(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteAsset(asset.id);
      setShowDelete(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="group overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square bg-neutral-100">
          <Image
            src={asset.file_url}
            alt={asset.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Overlay Menu */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
              <div className="text-white">
                <p className="font-medium truncate">{asset.name}</p>
                <p className="text-xs text-white/70">
                  {formatFileSize(asset.file_size)}
                </p>
              </div>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-white/20 hover:bg-white/30 text-white"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>

                {showMenu && (
                  <div className="absolute right-0 bottom-full mb-1 bg-white rounded-lg shadow-lg py-1 min-w-[140px] z-10">
                    <button
                      className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2"
                      onClick={() => {
                        setShowMenu(false);
                        setShowEdit(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      編輯
                    </button>
                    <button className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2">
                      <Radar className="h-4 w-4" />
                      發起掃描
                    </button>
                    <button
                      className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2 text-red-600"
                      onClick={() => {
                        setShowMenu(false);
                        setShowDelete(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      刪除
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-medium truncate">{asset.name}</h3>
          <p className="text-xs text-neutral-500 mt-1">
            {formatDateTime(asset.created_at)}
          </p>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯資產</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">名稱</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">描述</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>
              取消
            </Button>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "儲存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
          </DialogHeader>
          <p className="text-neutral-600">
            確定要刪除「{asset.name}」嗎？此操作無法復原。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "刪除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
