"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CONFIG } from "@/config/constants";
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

    // 模擬開始掃描（實際應整合 AI 掃描 API）
    await startScanProcess(data.id);

    revalidatePath("/scan");
    return { data: data as Scan, error: null };
  } catch (error) {
    console.error("Error creating scan:", error);
    return { data: null, error: "無法發起掃描" };
  }
}

/**
 * 模擬掃描流程（實際應替換為真實 AI 掃描邏輯）
 */
async function startScanProcess(scanId: string) {
  try {
    const supabase = await createClient();

    // 更新狀態為執行中
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("scans")
      .update({
        status: CONFIG.SCAN_STATUS.RUNNING,
        started_at: new Date().toISOString(),
      })
      .eq("id", scanId);

    // 模擬完成
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("scans")
      .update({
        status: CONFIG.SCAN_STATUS.COMPLETED,
        completed_at: new Date().toISOString(),
      })
      .eq("id", scanId);
  } catch (error) {
    console.error("Scan process error:", error);
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("scans")
      .update({ status: CONFIG.SCAN_STATUS.FAILED })
      .eq("id", scanId);
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
