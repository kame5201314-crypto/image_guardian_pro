"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CONFIG } from "@/config/constants";
import type { Asset } from "@/types/database";

/**
 * 取得所有資產
 */
export async function getAssets(): Promise<{ data: Asset[] | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .eq("org_id", CONFIG.DEFAULT_ORG_ID)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data: data as Asset[], error: null };
  } catch (error) {
    console.error("Error fetching assets:", error);
    return { data: null, error: "無法取得資產列表" };
  }
}

/**
 * 取得單一資產
 */
export async function getAsset(id: string): Promise<{ data: Asset | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .eq("id", id)
      .eq("org_id", CONFIG.DEFAULT_ORG_ID)
      .single();

    if (error) throw error;
    return { data: data as Asset, error: null };
  } catch (error) {
    console.error("Error fetching asset:", error);
    return { data: null, error: "無法取得資產" };
  }
}

/**
 * 上傳資產（包含檔案上傳至 Storage）
 */
export async function uploadAsset(formData: FormData): Promise<{ data: Asset | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;

    if (!file || !name) {
      return { data: null, error: "請提供檔案和名稱" };
    }

    // 驗證檔案類型
    if (!CONFIG.ALLOWED_MIME_TYPES.includes(file.type as typeof CONFIG.ALLOWED_MIME_TYPES[number])) {
      return { data: null, error: "不支援的檔案格式" };
    }

    // 驗證檔案大小
    if (file.size > CONFIG.MAX_FILE_SIZE) {
      return { data: null, error: "檔案大小超過限制 (10MB)" };
    }

    // 生成唯一檔案路徑
    const fileExt = file.name.split(".").pop();
    const fileName = `${CONFIG.DEFAULT_ORG_ID}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // 上傳至 Storage
    const { error: uploadError } = await supabase.storage
      .from(CONFIG.STORAGE_BUCKETS.ASSETS)
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // 取得公開 URL
    const { data: urlData } = supabase.storage
      .from(CONFIG.STORAGE_BUCKETS.ASSETS)
      .getPublicUrl(fileName);

    // 建立資產記錄
    const assetData = {
      org_id: CONFIG.DEFAULT_ORG_ID,
      name,
      description: description || null,
      file_path: fileName,
      file_url: urlData.publicUrl,
      file_size: file.size,
      mime_type: file.type,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("assets")
      .insert(assetData)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/assets");
    return { data: data as Asset, error: null };
  } catch (error) {
    console.error("Error uploading asset:", error);
    return { data: null, error: "上傳失敗，請稍後再試" };
  }
}

/**
 * 更新資產
 */
export async function updateAsset(
  id: string,
  updates: { name?: string; description?: string | null }
): Promise<{ data: Asset | null; error: string | null }> {
  try {
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("assets")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("org_id", CONFIG.DEFAULT_ORG_ID)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/assets");
    return { data: data as Asset, error: null };
  } catch (error) {
    console.error("Error updating asset:", error);
    return { data: null, error: "更新失敗" };
  }
}

/**
 * 刪除資產
 */
export async function deleteAsset(id: string): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();

    // 先取得資產資訊以刪除 Storage 檔案
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: asset } = await (supabase as any)
      .from("assets")
      .select("file_path")
      .eq("id", id)
      .eq("org_id", CONFIG.DEFAULT_ORG_ID)
      .single();

    const filePath = asset?.file_path as string | undefined;
    if (filePath) {
      await supabase.storage
        .from(CONFIG.STORAGE_BUCKETS.ASSETS)
        .remove([filePath]);
    }

    // 刪除資料庫記錄
    const { error } = await supabase
      .from("assets")
      .delete()
      .eq("id", id)
      .eq("org_id", CONFIG.DEFAULT_ORG_ID);

    if (error) throw error;

    revalidatePath("/assets");
    return { error: null };
  } catch (error) {
    console.error("Error deleting asset:", error);
    return { error: "刪除失敗" };
  }
}
