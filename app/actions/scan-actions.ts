"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CONFIG } from "@/config/constants";
import { executeFullScan, Platform } from "@/lib/search";
import type { Scan, ScanMatch, Asset } from "@/types/database";

type ScanWithAsset = Scan & { assets: Pick<Asset, "id" | "name" | "file_url"> | null };

/**
 * 取得所有掃描記錄
 */
export async function getScans(): Promise<{ data: ScanWithAsset[] | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("scans")
      .select(`
        *,
        assets (id, name, file_url)
      `)
      .eq("org_id", CONFIG.DEFAULT_ORG_ID)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data: data as ScanWithAsset[], error: null };
  } catch (error) {
    console.error("Error fetching scans:", error);
    return { data: null, error: "無法取得掃描記錄" };
  }
}

/**
 * 取得單一掃描及其匹配結果
 */
export async function getScanWithMatches(scanId: string) {
  try {
    const supabase = await createClient();

    const [scanResult, matchesResult] = await Promise.all([
      supabase
        .from("scans")
        .select(`*, assets (id, name, file_url)`)
        .eq("id", scanId)
        .eq("org_id", CONFIG.DEFAULT_ORG_ID)
        .single(),
      supabase
        .from("scan_matches")
        .select("*")
        .eq("scan_id", scanId)
        .eq("org_id", CONFIG.DEFAULT_ORG_ID)
        .order("similarity_score", { ascending: false }),
    ]);

    if (scanResult.error) throw scanResult.error;

    return {
      data: {
        scan: scanResult.data as ScanWithAsset,
        matches: (matchesResult.data || []) as ScanMatch[],
      },
      error: null,
    };
  } catch (error) {
    console.error("Error fetching scan:", error);
    return { data: null, error: "無法取得掃描詳情" };
  }
}

/**
 * 發起新掃描
 */
export async function createScan(assetId: string, platforms: string[]): Promise<{ data: Scan | null; error: string | null }> {
  try {
    const supabase = await createClient();

    // 先取得資產資訊
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: asset } = await (supabase as any)
      .from("assets")
      .select("file_url")
      .eq("id", assetId)
      .single();

    const assetFileUrl = asset?.file_url as string | undefined;
    if (!assetFileUrl) {
      return { data: null, error: "找不到資產圖片" };
    }

    const scanData = {
      org_id: CONFIG.DEFAULT_ORG_ID,
      asset_id: assetId,
      status: CONFIG.SCAN_STATUS.PENDING,
      platforms,
      match_count: 0,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("scans")
      .insert(scanData)
      .select()
      .single();

    if (error) throw error;

    // 開始真實掃描（不等待完成，讓它在背景執行）
    startRealScanProcess(data.id, assetId, assetFileUrl, platforms as Platform[]);

    revalidatePath("/scan");
    return { data: data as Scan, error: null };
  } catch (error) {
    console.error("Error creating scan:", error);
    return { data: null, error: "無法發起掃描" };
  }
}

/**
 * 真實掃描流程 - 搜尋蝦皮、momo、露天、Google 等平台
 */
async function startRealScanProcess(
  scanId: string,
  assetId: string,
  imageUrl: string,
  platforms: Platform[]
) {
  const supabase = await createClient();

  try {
    // 更新狀態為執行中
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("scans")
      .update({
        status: CONFIG.SCAN_STATUS.RUNNING,
        started_at: new Date().toISOString(),
      })
      .eq("id", scanId);

    console.log(`Starting scan ${scanId} for image: ${imageUrl}`);
    console.log(`Platforms: ${platforms.join(", ")}`);

    // 執行真實的多平台搜尋
    const scanResult = await executeFullScan(imageUrl, platforms);

    console.log(`Scan completed. Found ${scanResult.totalMatches} matches.`);

    // 儲存匹配結果
    let savedMatchCount = 0;
    for (const match of scanResult.matches) {
      // 只儲存相似度高於門檻的結果
      if (match.similarityScore >= CONFIG.SIMILARITY_THRESHOLD) {
        const matchData = {
          org_id: CONFIG.DEFAULT_ORG_ID,
          scan_id: scanId,
          asset_id: assetId,
          source_url: match.sourceUrl,
          source_platform: match.platform,
          thumbnail_url: match.thumbnailUrl || null,
          similarity_score: match.similarityScore,
          status: CONFIG.MATCH_STATUS.DETECTED,
          detected_at: match.detectedAt,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase as any)
          .from("scan_matches")
          .insert(matchData);

        if (!insertError) {
          savedMatchCount++;
        } else {
          console.error("Error inserting match:", insertError);
        }
      }
    }

    // 更新掃描完成狀態
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("scans")
      .update({
        status: CONFIG.SCAN_STATUS.COMPLETED,
        completed_at: new Date().toISOString(),
        match_count: savedMatchCount,
      })
      .eq("id", scanId);

    console.log(`Scan ${scanId} completed. Saved ${savedMatchCount} matches.`);

    // 重新驗證頁面以顯示結果
    revalidatePath("/scan");
  } catch (error) {
    console.error("Scan process error:", error);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("scans")
      .update({
        status: CONFIG.SCAN_STATUS.FAILED,
        completed_at: new Date().toISOString(),
      })
      .eq("id", scanId);
  }
}

/**
 * 手動重新掃描
 */
export async function rescanAsset(scanId: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();

    // 取得原掃描資訊
    const { data: scan, error: scanError } = await supabase
      .from("scans")
      .select(`*, assets (file_url)`)
      .eq("id", scanId)
      .eq("org_id", CONFIG.DEFAULT_ORG_ID)
      .single();

    if (scanError || !scan) {
      return { error: "找不到掃描記錄" };
    }

    const scanData = scan as { asset_id: string; platforms: Platform[]; assets: { file_url: string } | null };

    if (!scanData.assets?.file_url) {
      return { error: "找不到資產圖片" };
    }

    // 刪除舊的匹配結果
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("scan_matches")
      .delete()
      .eq("scan_id", scanId);

    // 重置掃描狀態
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("scans")
      .update({
        status: CONFIG.SCAN_STATUS.PENDING,
        match_count: 0,
        started_at: null,
        completed_at: null,
      })
      .eq("id", scanId);

    // 重新執行掃描
    startRealScanProcess(
      scanId,
      scanData.asset_id,
      scanData.assets.file_url,
      scanData.platforms || ["shopee", "momo", "ruten", "google"]
    );

    revalidatePath("/scan");
    return { error: null };
  } catch (error) {
    console.error("Error rescanning:", error);
    return { error: "重新掃描失敗" };
  }
}

/**
 * 更新匹配狀態
 */
export async function updateMatchStatus(matchId: string, status: string): Promise<{ data: ScanMatch | null; error: string | null }> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("scan_matches")
      .update({ status })
      .eq("id", matchId)
      .eq("org_id", CONFIG.DEFAULT_ORG_ID)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/scan");
    return { data: data as ScanMatch, error: null };
  } catch (error) {
    console.error("Error updating match status:", error);
    return { data: null, error: "無法更新狀態" };
  }
}

/**
 * 取得所有匹配結果
 */
export async function getAllMatches() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("scan_matches")
      .select(`
        *,
        assets (id, name, file_url),
        scans (id, status)
      `)
      .eq("org_id", CONFIG.DEFAULT_ORG_ID)
      .order("detected_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching matches:", error);
    return { data: null, error: "無法取得匹配結果" };
  }
}

/**
 * 刪除掃描記錄
 */
export async function deleteScan(scanId: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();

    // 刪除相關的匹配記錄（CASCADE 會自動處理）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("scans")
      .delete()
      .eq("id", scanId)
      .eq("org_id", CONFIG.DEFAULT_ORG_ID);

    if (error) throw error;

    revalidatePath("/scan");
    return { error: null };
  } catch (error) {
    console.error("Error deleting scan:", error);
    return { error: "刪除失敗" };
  }
}
