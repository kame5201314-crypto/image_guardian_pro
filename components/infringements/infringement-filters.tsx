"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface FiltersProps {
  currentStatus?: string;
  currentPriority?: string;
  currentPlatform?: string;
}

const statusOptions = [
  { value: "", label: "全部狀態" },
  { value: "pending", label: "待處理" },
  { value: "evidenced", label: "已存證" },
  { value: "reported", label: "已檢舉" },
  { value: "resolved", label: "已解決" },
  { value: "dismissed", label: "已忽略" },
];

const priorityOptions = [
  { value: "", label: "全部優先級" },
  { value: "critical", label: "極嚴重" },
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
];

const platformOptions = [
  { value: "", label: "全部平台" },
  { value: "shopee", label: "蝦皮購物" },
  { value: "momo", label: "momo購物網" },
  { value: "ruten", label: "露天拍賣" },
  { value: "google", label: "Google" },
];

export function InfringementFilters({
  currentStatus,
  currentPriority,
  currentPlatform,
}: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/infringements?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/infringements");
  };

  const hasFilters = currentStatus || currentPriority || currentPlatform;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* 狀態篩選 */}
      <select
        value={currentStatus || ""}
        onChange={(e) => updateFilter("status", e.target.value)}
        className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm
                   focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent
                   transition-all"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* 優先級篩選 */}
      <select
        value={currentPriority || ""}
        onChange={(e) => updateFilter("priority", e.target.value)}
        className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm
                   focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent
                   transition-all"
      >
        {priorityOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* 平台篩選 */}
      <select
        value={currentPlatform || ""}
        onChange={(e) => updateFilter("platform", e.target.value)}
        className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm
                   focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent
                   transition-all"
      >
        {platformOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* 清除篩選 */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          清除篩選
        </Button>
      )}
    </div>
  );
}
