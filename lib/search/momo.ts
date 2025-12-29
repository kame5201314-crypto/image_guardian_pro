/**
 * momo 購物網搜尋服務
 * 搜尋 momo 購物網上的商品
 */

export interface MomoSearchResult {
  goodsCode: string;
  goodsName: string;
  price: number;
  priceDisplay: string;
  imageUrl: string;
  productUrl: string;
  brandName: string;
  category: string;
}

const MOMO_SEARCH_URL = "https://www.momoshop.com.tw/search/searchShop.jsp";

/**
 * 在 momo 購物網搜尋商品
 */
export async function searchMomo(
  keywords: string[]
): Promise<MomoSearchResult[]> {
  try {
    const query = keywords.join(" ");
    const url = `${MOMO_SEARCH_URL}?keyword=${encodeURIComponent(query)}&searchType=1&cateLevel=0&cateCode=&curPage=1&maxPage=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-TW,zh;q=0.9",
        Referer: "https://www.momoshop.com.tw/",
      },
    });

    const html = await response.text();

    // 解析 HTML 取得商品資訊
    return parseMomoHtml(html);
  } catch (error) {
    console.error("momo search error:", error);
    return searchMomoFallback(keywords);
  }
}

/**
 * 解析 momo HTML 頁面
 */
function parseMomoHtml(html: string): MomoSearchResult[] {
  const results: MomoSearchResult[] = [];

  try {
    // 尋找商品卡片資訊
    // momo 的商品通常在 goodsUrl 和圖片中
    const productPattern =
      /goodsCode=(\d+)[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*>[\s\S]*?class="prdName"[^>]*>([^<]+)/g;
    const pricePattern = /class="price"[^>]*>[\s\S]*?(\d[\d,]+)/g;

    let match;
    let count = 0;

    // 簡化的解析邏輯 - 尋找商品連結和圖片
    const linkPattern =
      /href="[^"]*goodsCode=(\d+)[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/g;

    while ((match = linkPattern.exec(html)) !== null && count < 10) {
      const goodsCode = match[1];
      const imageUrl = match[2].startsWith("//")
        ? `https:${match[2]}`
        : match[2];
      const name = match[3] || `momo商品 ${goodsCode}`;

      results.push({
        goodsCode,
        goodsName: name,
        price: 0,
        priceDisplay: "查看商品",
        imageUrl,
        productUrl: `https://www.momoshop.com.tw/goods/GoodsDetail.jsp?i_code=${goodsCode}`,
        brandName: "momo",
        category: "",
      });
      count++;
    }

    // 如果沒有找到任何商品，嘗試另一種模式
    if (results.length === 0) {
      const simplePattern = /i_code=(\d+)/g;
      while ((match = simplePattern.exec(html)) !== null && count < 10) {
        const goodsCode = match[1];
        results.push({
          goodsCode,
          goodsName: `momo商品 ${goodsCode}`,
          price: 0,
          priceDisplay: "查看商品",
          imageUrl: "",
          productUrl: `https://www.momoshop.com.tw/goods/GoodsDetail.jsp?i_code=${goodsCode}`,
          brandName: "momo",
          category: "",
        });
        count++;
      }
    }

    return results;
  } catch (error) {
    console.error("Parse momo HTML error:", error);
    return [];
  }
}

/**
 * 備用方法：使用搜尋引擎搜尋 momo
 */
async function searchMomoFallback(
  keywords: string[]
): Promise<MomoSearchResult[]> {
  try {
    const query = `site:momoshop.com.tw ${keywords.join(" ")}`;
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const html = await response.text();

    const results: MomoSearchResult[] = [];
    const linkRegex =
      /href="[^"]*momoshop\.com\.tw[^"]*i_code=(\d+)[^"]*"[^>]*>/g;
    let match;
    let count = 0;

    while ((match = linkRegex.exec(html)) !== null && count < 10) {
      const goodsCode = match[1];
      results.push({
        goodsCode,
        goodsName: `momo商品 ${goodsCode}`,
        price: 0,
        priceDisplay: "查看商品",
        imageUrl: "",
        productUrl: `https://www.momoshop.com.tw/goods/GoodsDetail.jsp?i_code=${goodsCode}`,
        brandName: "momo",
        category: "",
      });
      count++;
    }

    return results;
  } catch (error) {
    console.error("momo fallback search error:", error);
    return [];
  }
}

/**
 * 取得 momo 商品詳情
 */
export async function getMomoItemDetail(
  goodsCode: string
): Promise<{
  name: string;
  images: string[];
  price: number;
  description: string;
} | null> {
  try {
    const url = `https://www.momoshop.com.tw/goods/GoodsDetail.jsp?i_code=${goodsCode}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html",
        Referer: "https://www.momoshop.com.tw/",
      },
    });

    const html = await response.text();

    // 解析商品詳情
    const nameMatch = html.match(/<title>([^<]+)/);
    const priceMatch = html.match(/class="price"[^>]*>[\s\S]*?(\d[\d,]+)/);
    const imageMatches = html.matchAll(
      /class="[^"]*goodsimg[^"]*"[^>]*src="([^"]+)"/g
    );

    const images: string[] = [];
    for (const match of imageMatches) {
      const imgUrl = match[1].startsWith("//")
        ? `https:${match[1]}`
        : match[1];
      images.push(imgUrl);
    }

    return {
      name: nameMatch
        ? nameMatch[1].replace(" - momo購物網", "").trim()
        : `momo商品 ${goodsCode}`,
      images,
      price: priceMatch ? parseInt(priceMatch[1].replace(/,/g, "")) : 0,
      description: "",
    };
  } catch (error) {
    console.error("momo item detail error:", error);
    return null;
  }
}
