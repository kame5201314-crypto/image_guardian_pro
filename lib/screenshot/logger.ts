/**
 * System Logger - 系統日誌記錄服務
 * 將錯誤和事件記錄到 Supabase
 */

import { createClient } from "@/lib/supabase/server";
import { CONFIG } from "@/config/constants";

type LogLevel = "info" | "warn" | "error" | "fatal";

interface LogMetadata {
  [key: string]: unknown;
}

/**
 * 記錄系統事件到 Supabase
 */
export async function logSystemEvent(
  level: LogLevel,
  source: string,
  message: string,
  metadata: LogMetadata = {},
  orgId: string = CONFIG.DEFAULT_ORG_ID
): Promise<string | null> {
  try {
    const supabase = await createClient();

    const logData = {
      org_id: orgId,
      level,
      source,
      message,
      metadata,
      created_at: new Date().toISOString(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("system_logs")
      .insert(logData)
      .select("id")
      .single();

    if (error) {
      // 如果寫入失敗，至少在 console 記錄
      console.error("[SYSTEM LOG ERROR]", {
        level,
        source,
        message,
        metadata,
        dbError: error,
      });
      return null;
    }

    // 同時輸出到 console（便於開發調試）
    const logFn = level === "error" || level === "fatal" ? console.error : console.log;
    logFn(`[${level.toUpperCase()}] [${source}] ${message}`, metadata);

    return data?.id || null;
  } catch (err) {
    // 最後的備用：直接輸出到 console
    console.error("[CRITICAL] Failed to write system log:", {
      level,
      source,
      message,
      metadata,
      error: err,
    });
    return null;
  }
}

/**
 * 記錄 API 錯誤
 */
export async function logApiError(
  apiName: string,
  error: Error | unknown,
  context: LogMetadata = {}
): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stackTrace = error instanceof Error ? error.stack : undefined;

  await logSystemEvent("error", `api_${apiName}`, errorMessage, {
    ...context,
    stack_trace: stackTrace,
  });
}

/**
 * 記錄操作成功
 */
export async function logSuccess(
  operation: string,
  details: LogMetadata = {}
): Promise<void> {
  await logSystemEvent("info", operation, "Operation completed successfully", details);
}

/**
 * 記錄警告
 */
export async function logWarning(
  source: string,
  message: string,
  details: LogMetadata = {}
): Promise<void> {
  await logSystemEvent("warn", source, message, details);
}
