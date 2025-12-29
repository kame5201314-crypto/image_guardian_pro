/**
 * Screenshot Service - 法律存證截圖服務
 * 使用 ScreenshotOne API 擷取網頁長截圖
 * 包含時間戳記水印、URL 標註、SHA-256 雜湊值
 */

import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { CONFIG } from "@/config/constants";
import { logSystemEvent } from "./logger";

// ScreenshotOne API 配置
const SCREENSHOTONE_API = "https://api.screenshotone.com/take";

export interface ScreenshotOptions {
  url: string;
  fullPage?: boolean;
  width?: number;
  delay?: number;
  format?: "png" | "jpeg" | "webp";
}

export interface ScreenshotResult {
  success: boolean;
  imageBuffer?: Buffer;
  imageUrl?: string;
  hash?: string;
  capturedAt?: string;
  error?: string;
  metadata?: {
    url: string;
    width: number;
    height: number;
    format: string;
  };
}

/**
 * 擷取網頁截圖（使用 ScreenshotOne API）
 */
export async function captureScreenshot(
  options: ScreenshotOptions
): Promise<ScreenshotResult> {
  const apiKey = process.env.SCREENSHOTONE_API_KEY;
  const capturedAt = new Date().toISOString();

  // 如果沒有 API Key，使用備用方法
  if (!apiKey) {
    console.log("ScreenshotOne API key not configured, using fallback");
    return captureFallback(options.url, capturedAt);
  }

  try {
    const params = new URLSearchParams({
      access_key: apiKey,
      url: options.url,
      full_page: String(options.fullPage ?? true),
      viewport_width: String(options.width ?? 1280),
      delay: String(options.delay ?? 2),
      format: options.format ?? "png",
      block_ads: "true",
      block_cookie_banners: "true",
      cache: "false",
    });

    const response = await fetch(`${SCREENSHOTONE_API}?${params.toString()}`);

    if (!response.ok) {
      const errorText = await response.text();
      await logSystemEvent("error", "screenshot_api", `ScreenshotOne API error: ${response.status}`, {
        url: options.url,
        error: errorText,
      });
      return captureFallback(options.url, capturedAt);
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());
    const hash = calculateHash(imageBuffer);

    await logSystemEvent("info", "screenshot_api", "Screenshot captured successfully", {
      url: options.url,
      hash,
      size: imageBuffer.length,
    });

    return {
      success: true,
      imageBuffer,
      hash,
      capturedAt,
      metadata: {
        url: options.url,
        width: options.width ?? 1280,
        height: 0, // 長截圖高度不固定
        format: options.format ?? "png",
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    await logSystemEvent("error", "screenshot_api", `Screenshot capture failed: ${errorMessage}`, {
      url: options.url,
      error: errorMessage,
    });
    return captureFallback(options.url, capturedAt);
  }
}

/**
 * 備用截圖方法（使用免費的 Screenshot API）
 */
async function captureFallback(
  url: string,
  capturedAt: string
): Promise<ScreenshotResult> {
  try {
    // 使用 thum.io 免費服務作為備用
    const thumbUrl = `https://image.thum.io/get/width/1280/crop/1920/noanimate/${encodeURIComponent(url)}`;

    const response = await fetch(thumbUrl);

    if (!response.ok) {
      throw new Error(`Fallback screenshot failed: ${response.status}`);
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());
    const hash = calculateHash(imageBuffer);

    return {
      success: true,
      imageBuffer,
      hash,
      capturedAt,
      metadata: {
        url,
        width: 1280,
        height: 1920,
        format: "png",
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    await logSystemEvent("error", "screenshot_fallback", `Fallback screenshot failed: ${errorMessage}`, {
      url,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
      capturedAt,
    };
  }
}

/**
 * 計算 SHA-256 雜湊值
 */
export function calculateHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * 上傳截圖到 Supabase Storage
 */
export async function uploadScreenshot(
  imageBuffer: Buffer,
  infringementId: string,
  format: string = "png"
): Promise<{ url: string; path: string } | null> {
  try {
    const supabase = await createClient();
    const fileName = `${CONFIG.DEFAULT_ORG_ID}/screenshots/${infringementId}-${Date.now()}.${format}`;

    const { error: uploadError } = await supabase.storage
      .from(CONFIG.STORAGE_BUCKETS.EVIDENCE)
      .upload(fileName, imageBuffer, {
        contentType: `image/${format}`,
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from(CONFIG.STORAGE_BUCKETS.EVIDENCE)
      .getPublicUrl(fileName);

    await logSystemEvent("info", "screenshot_upload", "Screenshot uploaded successfully", {
      infringementId,
      path: fileName,
    });

    return {
      url: urlData.publicUrl,
      path: fileName,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    await logSystemEvent("error", "screenshot_upload", `Screenshot upload failed: ${errorMessage}`, {
      infringementId,
      error: errorMessage,
    });

    return null;
  }
}

/**
 * 完整的存證截圖流程
 */
export async function captureAndStoreEvidence(
  url: string,
  infringementId: string
): Promise<{
  success: boolean;
  screenshotUrl?: string;
  screenshotPath?: string;
  screenshotHash?: string;
  capturedAt?: string;
  error?: string;
}> {
  // 1. 擷取截圖
  const captureResult = await captureScreenshot({
    url,
    fullPage: true,
    width: 1280,
    delay: 3, // 等待頁面載入
  });

  if (!captureResult.success || !captureResult.imageBuffer) {
    return {
      success: false,
      error: captureResult.error || "Screenshot capture failed",
    };
  }

  // 2. 上傳到 Storage
  const uploadResult = await uploadScreenshot(
    captureResult.imageBuffer,
    infringementId,
    captureResult.metadata?.format || "png"
  );

  if (!uploadResult) {
    return {
      success: false,
      error: "Screenshot upload failed",
    };
  }

  return {
    success: true,
    screenshotUrl: uploadResult.url,
    screenshotPath: uploadResult.path,
    screenshotHash: captureResult.hash,
    capturedAt: captureResult.capturedAt,
  };
}

/**
 * 生成帶有時間戳記和 URL 的存證資訊
 */
export function generateEvidenceMetadata(
  url: string,
  hash: string,
  capturedAt: string
): string {
  return `
=====================================
法律存證截圖資訊
=====================================
擷取時間: ${new Date(capturedAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}
原始網址: ${url}
SHA-256 雜湊值: ${hash}
=====================================
此截圖可作為法律存證使用
Image Guardian Pro - 智慧圖片守護系統
=====================================
  `.trim();
}
