"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CONFIG } from "@/config/constants";
import { captureAndStoreEvidence } from "@/lib/screenshot";
import { performInfringementAssessment, generateReportEmail } from "@/lib/gemini";
import type { Infringement, Asset, AIAssessmentReport } from "@/types/database";

type InfringementWithAsset = Infringement & {
  assets: Pick<Asset, "id" | "name" | "file_url"> | null;
};

/**
 * 生成案件編號
 */
function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `IGP-${year}-${random}`;
}

/**
 * 取得所有侵權案件
 */
export async function getInfringements(filters?: {
  status?: string;
  priority?: string;
  platform?: string;
}): Promise<{ data: InfringementWithAsset[] | null; error: string | null }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("infringements")
      .select(`
        *,
        assets (id, name, file_url)
      `)
      .eq("org_id", CONFIG.DEFAULT_ORG_ID)
      .order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.priority) {
      query = query.eq("priority", filters.priority);
    }
    if (filters?.platform) {
      query = query.eq("infringing_platform", filters.platform);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data: data as InfringementWithAsset[], error: null };
  } catch (error) {
    console.error("Error fetching infringements:", error);
    return { data: null, error: "無法取得侵權案件" };
  }
}

/**
 * 取得單一侵權案件詳情
 */
export async function getInfringement(id: string): Promise<{
  data: InfringementWithAsset | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("infringements")
      .select(`
        *,
        assets (id, name, file_url)
      `)
      .eq("id", id)
      .eq("org_id", CONFIG.DEFAULT_ORG_ID)
      .single();

    if (error) throw error;
    return { data: data as InfringementWithAsset, error: null };
  } catch (error) {
    console.error("Error fetching infringement:", error);
    return { data: null, error: "無法取得案件詳情" };
  }
}

/**
 * 取得侵權案件統計
 */
export async function getInfringementStats(): Promise<{
  pending: number;
  evidenced: number;
  reported: number;
  resolved: number;
  dismissed: number;
  total: number;
}> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("infringements")
      .select("status")
      .eq("org_id", CONFIG.DEFAULT_ORG_ID);

    if (error) throw error;

    const stats = {
      pending: 0,
      evidenced: 0,
      reported: 0,
      resolved: 0,
      dismissed: 0,
      total: 0,
    };

    for (const row of data || []) {
      stats.total++;
      const status = row.status as keyof typeof stats;
      if (status in stats) {
        stats[status]++;
      }
    }

    return stats;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { pending: 0, evidenced: 0, reported: 0, resolved: 0, dismissed: 0, total: 0 };
  }
}

/**
 * 從掃描匹配建立侵權案件
 */
export async function createInfringementFromMatch(
  matchId: string
): Promise<{ data: Infringement | null; error: string | null }> {
  try {
    const supabase = await createClient();

    // 取得匹配資訊
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: match, error: matchError } = await (supabase as any)
      .from("scan_matches")
      .select(`
        *,
        assets (id, name, file_url)
      `)
      .eq("id", matchId)
      .single();

    if (matchError || !match) {
      throw new Error("找不到匹配記錄");
    }

    const matchData = match as {
      asset_id: string;
      source_url: string;
      source_platform: string;
      similarity_score: number;
      assets: { file_url: string } | null;
    };

    const caseNumber = generateCaseNumber();

    const infringementData = {
      org_id: CONFIG.DEFAULT_ORG_ID,
      asset_id: matchData.asset_id,
      match_id: matchId,
      case_number: caseNumber,
      status: "pending",
      priority: matchData.similarity_score >= 90 ? "high" : matchData.similarity_score >= 70 ? "medium" : "low",
      infringing_url: matchData.source_url,
      infringing_platform: matchData.source_platform,
      ai_similarity_score: matchData.similarity_score,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("infringements")
      .insert(infringementData)
      .select()
      .single();

    if (error) throw error;

    // 更新匹配狀態
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("scan_matches")
      .update({ status: CONFIG.MATCH_STATUS.REPORTED })
      .eq("id", matchId);

    revalidatePath("/infringements");
    revalidatePath("/scan");

    return { data: data as Infringement, error: null };
  } catch (error) {
    console.error("Error creating infringement:", error);
    return { data: null, error: "建立案件失敗" };
  }
}

/**
 * 執行存證截圖
 */
export async function captureInfringementEvidence(
  infringementId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // 取得案件資訊
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: infringement, error: fetchError } = await (supabase as any)
      .from("infringements")
      .select("infringing_url")
      .eq("id", infringementId)
      .single();

    if (fetchError || !infringement) {
      throw new Error("找不到案件");
    }

    const url = infringement.infringing_url as string;

    // 執行截圖
    const result = await captureAndStoreEvidence(url, infringementId);

    if (!result.success) {
      throw new Error(result.error || "截圖失敗");
    }

    // 更新案件
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("infringements")
      .update({
        screenshot_url: result.screenshotUrl,
        screenshot_path: result.screenshotPath,
        screenshot_hash: result.screenshotHash,
        screenshot_taken_at: result.capturedAt,
        status: "evidenced",
        updated_at: new Date().toISOString(),
      })
      .eq("id", infringementId);

    revalidatePath("/infringements");
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error capturing evidence:", error);
    return { success: false, error: errorMessage };
  }
}

/**
 * 執行 AI 鑑定
 */
export async function performAIAssessment(
  infringementId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // 取得案件和資產資訊
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: infringement, error: fetchError } = await (supabase as any)
      .from("infringements")
      .select(`
        *,
        assets (file_url)
      `)
      .eq("id", infringementId)
      .single();

    if (fetchError || !infringement) {
      throw new Error("找不到案件");
    }

    const infringementData = infringement as {
      infringing_url: string;
      screenshot_url: string | null;
      assets: { file_url: string } | null;
    };

    if (!infringementData.assets?.file_url) {
      throw new Error("找不到原始圖片");
    }

    // 使用截圖或侵權 URL 進行比對
    const infringingImageUrl = infringementData.screenshot_url || infringementData.infringing_url;

    // 執行 AI 鑑定
    const result = await performInfringementAssessment(
      infringementData.assets.file_url,
      infringingImageUrl
    );

    if (!result.success) {
      throw new Error(result.error || "AI 鑑定失敗");
    }

    // 更新案件
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("infringements")
      .update({
        ai_similarity_score: result.similarityScore,
        ai_confidence_score: result.confidenceScore,
        ai_assessment_report: result.report,
        ai_conclusion: result.conclusion,
        ai_assessed_at: new Date().toISOString(),
        priority: result.report?.conclusion.severity || "medium",
        updated_at: new Date().toISOString(),
      })
      .eq("id", infringementId);

    revalidatePath("/infringements");
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error performing AI assessment:", error);
    return { success: false, error: errorMessage };
  }
}

/**
 * 生成檢舉信
 */
export async function generateInfringementReport(
  infringementId: string
): Promise<{ data: string | null; error: string | null }> {
  try {
    const supabase = await createClient();

    // 取得完整案件資訊
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: infringement, error: fetchError } = await (supabase as any)
      .from("infringements")
      .select(`
        *,
        assets (file_url)
      `)
      .eq("id", infringementId)
      .single();

    if (fetchError || !infringement) {
      throw new Error("找不到案件");
    }

    const data = infringement as {
      case_number: string;
      infringing_url: string;
      screenshot_url: string | null;
      ai_assessment_report: AIAssessmentReport | null;
      assets: { file_url: string } | null;
    };

    if (!data.ai_assessment_report) {
      throw new Error("請先執行 AI 鑑定");
    }

    if (!data.assets?.file_url) {
      throw new Error("找不到原始圖片");
    }

    // 生成檢舉信
    const emailContent = await generateReportEmail(
      data.case_number,
      data.assets.file_url,
      data.infringing_url,
      data.ai_assessment_report,
      data.screenshot_url || undefined
    );

    // 儲存檢舉信內容
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("infringements")
      .update({
        report_email_content: emailContent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", infringementId);

    revalidatePath("/infringements");
    return { data: emailContent, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating report:", error);
    return { data: null, error: errorMessage };
  }
}

/**
 * 標記為已檢舉
 */
export async function markAsReported(
  infringementId: string,
  method: string,
  reference?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("infringements")
      .update({
        status: "reported",
        reported_at: new Date().toISOString(),
        reported_method: method,
        reported_reference: reference || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", infringementId);

    revalidatePath("/infringements");
    return { success: true };
  } catch (error) {
    console.error("Error marking as reported:", error);
    return { success: false, error: "更新狀態失敗" };
  }
}

/**
 * 更新案件狀態
 */
export async function updateInfringementStatus(
  infringementId: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("infringements")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", infringementId);

    revalidatePath("/infringements");
    return { success: true };
  } catch (error) {
    console.error("Error updating status:", error);
    return { success: false, error: "更新狀態失敗" };
  }
}

/**
 * 刪除侵權案件
 */
export async function deleteInfringement(
  infringementId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // 先取得截圖路徑以刪除 Storage 檔案
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: infringement } = await (supabase as any)
      .from("infringements")
      .select("screenshot_path")
      .eq("id", infringementId)
      .single();

    const screenshotPath = infringement?.screenshot_path as string | undefined;
    if (screenshotPath) {
      await supabase.storage
        .from(CONFIG.STORAGE_BUCKETS.EVIDENCE)
        .remove([screenshotPath]);
    }

    // 刪除資料庫記錄
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("infringements")
      .delete()
      .eq("id", infringementId)
      .eq("org_id", CONFIG.DEFAULT_ORG_ID);

    revalidatePath("/infringements");
    return { success: true };
  } catch (error) {
    console.error("Error deleting infringement:", error);
    return { success: false, error: "刪除失敗" };
  }
}
