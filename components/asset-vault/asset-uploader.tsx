"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
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
import { uploadAsset } from "@/app/actions/asset-actions";
import { CONFIG } from "@/config/constants";

export function AssetUploader() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) return;

    if (!CONFIG.ALLOWED_MIME_TYPES.includes(file.type as never)) {
      setError("不支援的檔案格式，請上傳 JPG、PNG 或 WebP");
      return;
    }

    if (file.size > CONFIG.MAX_FILE_SIZE) {
      setError("檔案大小超過 10MB 限制");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await uploadAsset(formData);

      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch {
      setError("上傳失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          上傳原圖
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>上傳原創圖片</DialogTitle>
          <DialogDescription>
            將您的原創作品上傳至資產庫，開始監控保護
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload Area */}
          <div className="relative">
            {preview ? (
              <div className="relative rounded-xl overflow-hidden border border-neutral-200">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={clearPreview}
                  className="absolute top-2 right-2 p-1 bg-white/90 rounded-lg hover:bg-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-neutral-200 rounded-xl cursor-pointer hover:border-neutral-300 hover:bg-neutral-50 transition-colors">
                <Upload className="h-8 w-8 text-neutral-400 mb-2" />
                <span className="text-sm text-neutral-500">
                  點擊或拖曳檔案至此
                </span>
                <span className="text-xs text-neutral-400 mt-1">
                  支援 JPG、PNG、WebP（最大 10MB）
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  name="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
              </label>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-neutral-700">
              資產名稱
            </label>
            <Input
              name="name"
              placeholder="輸入圖片名稱"
              className="mt-1"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-neutral-700">
              描述（選填）
            </label>
            <Textarea
              name="description"
              placeholder="輸入圖片描述..."
              className="mt-1"
              rows={2}
            />
          </div>

          {/* Error Message */}
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
            <Button type="submit" disabled={loading || !preview}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  上傳中...
                </>
              ) : (
                "確認上傳"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
