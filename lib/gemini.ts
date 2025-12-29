import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
