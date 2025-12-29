"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CONFIG } from "@/config/constants";
import type { Evidence, Asset } from "@/types/database";

type EvidenceWithAsset = Evidence & {
  assets: Pick<Asset, "id" | "name" | "file_url"> | null;
};

/**
 * 取得所有存證記錄
 */
export async function getEvidences(): Promise<{ data: EvidenceWithAsset[] | null; error: string | null }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("evidence")
      .select(`
        *,
        assets (id, name, file_url)
      `)
      .eq("org_id", CONFIG.DEFAULT_ORG_ID)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data: data as EvidenceWithAsset[], error: null };
  } catch (error) {
    console.error("Error fetching evidences:", error);
    return { data: null, error: "無法取得存證記錄" };
  }
}

/**
 * 取得單一存證詳情
 */
export async function getEvidence(id: string): Promise<{ data: Evidence | null; error: string | null }> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("evidence")
      .select(`
        *,
        assets (id, name, file_url),
        scan_matches (id, source_url, similarity_score)
      `)
      .eq("id", id)
      .eq("org_id", CONFIG.DEFAULT_ORG_ID)
      .single();

    if (error) throw error;
    return { data: data as Evidence, error: null };
  } catch (error) {
    console.error("Error fetching evidence:", error);
    return { data: null, error: "無法取得存證詳情" };
  }
}

/**
 * 建立存證記錄
 */
export async function createEvidence(formData: FormData): Promise<{ data: Evidence | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const assetId = formData.get("asset_id") as string;
    const matchId = formData.get("match_id") as string | null;
    const evidenceType = formData.get("evidence_type") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const file = formData.get("file") as File | null;

    if (!assetId || !evidenceType || !title) {
      return { data: null, error: "請填寫必要欄位" };
    }

    let filePath = null;
    let fileUrl = null;

    // 如果有上傳檔案
    if (file && file.size > 0) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${CONFIG.DEFAULT_ORG_ID}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(CONFIG.STORAGE_BUCKETS.EVIDENCE)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(CONFIG.STORAGE_BUCKETS.EVIDENCE)
        .getPublicUrl(fileName);

      filePath = fileName;
      fileUrl = urlData.publicUrl;
    }

    const evidenceData = {
      org_id: CONFIG.DEFAULT_ORG_ID,
      asset_id: assetId,
      match_id: matchId || null,
      evidence_type: evidenceType,
      title,
      description: description || null,
      file_path: filePath,
      file_url: fileUrl,
      metadata: {
        created_by: "admin",
        timestamp: new Date().toISOString(),
        ip: "server-side",
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("evidence")
      .insert(evidenceData)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/evidence");
    return { data: data as Evidence, error: null };
  } catch (error) {
    console.error("Error creating evidence:", error);
    return { data: null, error: "建立存證失敗" };
  }
}

/**
 * 更新存證記錄
 */
export async function updateEvidence(
  id: string,
  updates: { title?: string; description?: string | null }
): Promise<{ data: Evidence | null; error: string | null }> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("evidence")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("org_id", CONFIG.DEFAULT_ORG_ID)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/evidence");
    return { data: data as Evidence, error: null };
  } catch (error) {
    console.error("Error updating evidence:", error);
    return { data: null, error: "更新失敗" };
  }
}

/**
 * 刪除存證記錄
 */
export async function deleteEvidence(id: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();

    // 先取得存證資訊以刪除 Storage 檔案
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: evidence } = await (supabase as any)
      .from("evidence")
      .select("file_path")
      .eq("id", id)
      .eq("org_id", CONFIG.DEFAULT_ORG_ID)
      .single();

    const filePath = evidence?.file_path as string | undefined;
    if (filePath) {
      await supabase.storage
        .from(CONFIG.STORAGE_BUCKETS.EVIDENCE)
        .remove([filePath]);
    }

    // 刪除資料庫記錄
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("evidence")
      .delete()
      .eq("id", id)
      .eq("org_id", CONFIG.DEFAULT_ORG_ID);

    if (error) throw error;

    revalidatePath("/evidence");
    return { error: null };
  } catch (error) {
    console.error("Error deleting evidence:", error);
    return { error: "刪除失敗" };
  }
}

/**
 * 快速建立存證（從匹配結果一鍵生成）
 */
export async function createEvidenceFromMatch(matchId: string): Promise<{ data: Evidence | null; error: string | null }> {
  try {
    const supabase = await createClient();

    // 取得匹配資訊
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: match, error: matchError } = await (supabase as any)
      .from("scan_matches")
      .select(`*, assets (id, name)`)
      .eq("id", matchId)
      .single();

    if (matchError || !match) throw matchError || new Error("找不到匹配記錄");

    const matchData = match as {
      asset_id: string;
      source_platform: string;
      source_url: string;
      similarity_score: number;
      detected_at: string
    };

    const evidenceData = {
      org_id: CONFIG.DEFAULT_ORG_ID,
      asset_id: matchData.asset_id,
      match_id: matchId,
      evidence_type: "screenshot",
      title: `侵權證據 - ${matchData.source_platform}`,
      description: `發現於 ${matchData.source_url}，相似度 ${matchData.similarity_score}%`,
      metadata: {
        source_url: matchData.source_url,
        similarity_score: matchData.similarity_score,
        detected_at: matchData.detected_at,
        created_by: "auto-capture",
        timestamp: new Date().toISOString(),
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("evidence")
      .insert(evidenceData)
      .select()
      .single();

    if (error) throw error;

    // 更新匹配狀態為已檢舉
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("scan_matches")
      .update({ status: CONFIG.MATCH_STATUS.REPORTED })
      .eq("id", matchId);

    revalidatePath("/evidence");
    revalidatePath("/scan");
    return { data: data as Evidence, error: null };
  } catch (error) {
    console.error("Error creating evidence from match:", error);
    return { data: null, error: "建立存證失敗" };
  }
}
