import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIAssessmentReport } from "@/types/database";
import { logSystemEvent } from "@/lib/screenshot/logger";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Nano Banana - Gemini 2.5 Flash (最新視覺模型)
const NANO_BANANA_MODEL = "gemini-2.0-flash-exp";

/**
 * Gemini Vision - 圖片分析
 */
export async function analyzeImage(imageUrl: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 下載圖片並轉換為 base64
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = response.headers.get("content-type") || "image/jpeg";

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
      "分析這張圖片的主要特徵，包括：主題、風格、顏色、構圖。用於圖片比對和侵權偵測。回傳 JSON 格式：{ subject, style, colors, composition, keywords }",
    ]);

    const text = result.response.text();

    // 嘗試解析 JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // 如果解析失敗，返回原始文字
    }

    return { raw: text };
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw error;
  }
}

/**
 * 比對兩張圖片的相似度
 */
export async function compareImages(imageUrl1: string, imageUrl2: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 下載兩張圖片
    const [res1, res2] = await Promise.all([
      fetch(imageUrl1),
      fetch(imageUrl2),
    ]);

    const [buf1, buf2] = await Promise.all([
      res1.arrayBuffer(),
      res2.arrayBuffer(),
    ]);

    const base64_1 = Buffer.from(buf1).toString("base64");
    const base64_2 = Buffer.from(buf2).toString("base64");

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: res1.headers.get("content-type") || "image/jpeg",
          data: base64_1,
        },
      },
      {
        inlineData: {
          mimeType: res2.headers.get("content-type") || "image/jpeg",
          data: base64_2,
        },
      },
      "比較這兩張圖片的相似度。評估它們是否可能是相同圖片的不同版本（如裁切、調色、加浮水印等）。回傳 JSON 格式：{ similarity_score: 0-100, is_potential_copy: boolean, differences: string[], conclusion: string }",
    ]);

    const text = result.response.text();

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // 解析失敗
    }

    return { raw: text, similarity_score: 0 };
  } catch (error) {
    console.error("Gemini comparison error:", error);
    throw error;
  }
}

/**
 * 生成圖片描述用於搜尋
 */
export async function generateSearchKeywords(imageUrl: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: response.headers.get("content-type") || "image/jpeg",
          data: base64,
        },
      },
      "為這張圖片生成搜尋關鍵字，用於在網路上尋找類似或相同的圖片。回傳 JSON 格式：{ keywords_en: string[], keywords_zh: string[], description: string }",
    ]);

    const text = result.response.text();

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // 解析失敗
    }

    return { raw: text };
  } catch (error) {
    console.error("Gemini keywords error:", error);
    throw error;
  }
}

/**
 * Nano Banana 鑑定引擎 - 完整侵權分析報告
 * 使用 Gemini 2.5 Flash 進行深度視覺推理
 */
export async function performInfringementAssessment(
  originalImageUrl: string,
  infringingImageUrl: string
): Promise<{
  success: boolean;
  report?: AIAssessmentReport;
  similarityScore?: number;
  confidenceScore?: number;
  conclusion?: string;
  error?: string;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: NANO_BANANA_MODEL });

    // 下載兩張圖片
    const [originalRes, infringingRes] = await Promise.all([
      fetch(originalImageUrl),
      fetch(infringingImageUrl),
    ]);

    if (!originalRes.ok || !infringingRes.ok) {
      throw new Error("Failed to fetch images for assessment");
    }

    const [originalBuf, infringingBuf] = await Promise.all([
      originalRes.arrayBuffer(),
      infringingRes.arrayBuffer(),
    ]);

    const originalBase64 = Buffer.from(originalBuf).toString("base64");
    const infringingBase64 = Buffer.from(infringingBuf).toString("base64");

    const assessmentPrompt = `
你是一位專業的智慧財產權鑑定專家。請仔細分析以下兩張圖片：
- 第一張是「原始圖片」（版權擁有者的資產）
- 第二張是「疑似侵權圖片」（在網路上發現的）

請進行以下分析並以 JSON 格式回傳：

{
  "subject_comparison": {
    "original_features": ["列出原始圖片的主要特徵，如產品外觀、品牌標誌、獨特設計元素"],
    "infringing_features": ["列出疑似侵權圖片的對應特徵"],
    "match_percentage": 0-100 的數字，表示主體特徵的吻合程度,
    "analysis": "詳細說明產品主體的相似與差異處"
  },
  "background_comparison": {
    "original_bg": "描述原始圖片的背景",
    "infringing_bg": "描述疑似侵權圖片的背景",
    "is_different": true 或 false,
    "analysis": "分析背景差異，是否有後製處理痕跡"
  },
  "manipulation_detection": {
    "watermark_removed": true 或 false（是否有移除浮水印的跡象）,
    "cropped": true 或 false（是否有裁切）,
    "color_adjusted": true 或 false（是否有調色）,
    "analysis": "詳細說明檢測到的圖片處理痕跡"
  },
  "conclusion": {
    "is_infringement": true 或 false,
    "confidence_score": 0-100 的信心指數,
    "severity": "low" 或 "medium" 或 "high" 或 "critical",
    "legal_recommendation": "根據分析結果給出法律行動建議"
  }
}

請確保回傳有效的 JSON 格式。
`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: originalRes.headers.get("content-type") || "image/jpeg",
          data: originalBase64,
        },
      },
      {
        inlineData: {
          mimeType: infringingRes.headers.get("content-type") || "image/jpeg",
          data: infringingBase64,
        },
      },
      assessmentPrompt,
    ]);

    const text = result.response.text();

    // 解析 JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI assessment response");
    }

    const report = JSON.parse(jsonMatch[0]) as AIAssessmentReport;

    await logSystemEvent("info", "nano_banana", "Infringement assessment completed", {
      similarity: report.subject_comparison.match_percentage,
      confidence: report.conclusion.confidence_score,
      is_infringement: report.conclusion.is_infringement,
    });

    return {
      success: true,
      report,
      similarityScore: report.subject_comparison.match_percentage,
      confidenceScore: report.conclusion.confidence_score,
      conclusion: report.conclusion.is_infringement
        ? `疑似侵權（信心指數 ${report.conclusion.confidence_score}%）：${report.conclusion.legal_recommendation}`
        : `未發現明顯侵權（信心指數 ${report.conclusion.confidence_score}%）`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    await logSystemEvent("error", "nano_banana", `Assessment failed: ${errorMessage}`, {
      originalImageUrl,
      infringingImageUrl,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 快速相似度檢查（輕量版）
 */
export async function quickSimilarityCheck(
  imageUrl1: string,
  imageUrl2: string
): Promise<{ score: number; isPotentialCopy: boolean }> {
  try {
    const result = await compareImages(imageUrl1, imageUrl2);
    return {
      score: result.similarity_score || 0,
      isPotentialCopy: result.is_potential_copy || false,
    };
  } catch {
    return { score: 0, isPotentialCopy: false };
  }
}

/**
 * 生成檢舉信內容
 */
export async function generateReportEmail(
  caseNumber: string,
  originalImageUrl: string,
  infringingUrl: string,
  assessment: AIAssessmentReport,
  screenshotUrl?: string
): Promise<string> {
  const severity = assessment.conclusion.severity;
  const severityText = {
    low: "輕微",
    medium: "中度",
    high: "嚴重",
    critical: "極嚴重",
  }[severity];

  const emailTemplate = `
主旨：圖片侵權檢舉 - 案件編號 ${caseNumber}

致 平台管理團隊：

本人/本公司發現貴平台上存在未經授權使用本人/本公司圖片之情況，茲提出正式檢舉如下：

【案件資訊】
案件編號：${caseNumber}
檢舉日期：${new Date().toLocaleDateString("zh-TW")}
侵權嚴重程度：${severityText}

【侵權內容位置】
${infringingUrl}

【原始圖片資訊】
本人/本公司為該圖片之合法著作權人，原始圖片可於以下位置查看：
${originalImageUrl}

【AI 鑑定結果】
相似度分析：${assessment.subject_comparison.match_percentage}%
信心指數：${assessment.conclusion.confidence_score}%
主體特徵分析：${assessment.subject_comparison.analysis}
${assessment.manipulation_detection.watermark_removed ? "⚠️ 檢測到浮水印移除痕跡" : ""}
${assessment.manipulation_detection.cropped ? "⚠️ 檢測到圖片裁切痕跡" : ""}

${screenshotUrl ? `【存證截圖】\n${screenshotUrl}\n` : ""}

【法律聲明】
依據《著作權法》，本人/本公司保留對侵權行為追究法律責任之權利。
請貴平台於收到本檢舉後，依法於合理期限內移除侵權內容。

如有任何疑問，請與本人/本公司聯繫。

此致
敬禮

---
本檢舉由 Image Guardian Pro 智慧圖片守護系統自動生成
鑑定時間：${new Date().toISOString()}
`.trim();

  return emailTemplate;
}
