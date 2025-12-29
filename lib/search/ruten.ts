/**
 * 露天拍賣搜尋服務
 * 搜尋露天拍賣上的商品
 */

export interface RutenSearchResult {
  itemId: string;
  name: string;
  price: number;
  priceDisplay: string;
  imageUrl: string;
  productUrl: string;
  sellerName: string;
  soldCount: number;
}

const RUTEN_API_BASE = "https://rtapi.ruten.com.tw/api/search/v3/index.php/core/prod";
const RUTEN_IMAGE_BASE = "https://img.ruten.com.tw/s1/";

/**
 * 在露天拍賣搜尋商品
 */
export async function searchRuten(
  keywords: string[]
): Promise<RutenSearchResult[]> {
  try {
    const query = keywords.join(" ");
    const params = new URLSearchParams({
      q: query,
      type: "direct",
      sort: "rnk/dc",
      offset: "1",
      limit: "20",
    });

    const url = `${RUTEN_API_BASE}?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
        "Accept-Language": "zh-TW,zh;q=0.9",
        Referer: "https://www.ruten.com.tw/",
      },
    });

    if (!response.ok) {
      console.error("Ruten API error:", response.status);
      return searchRutenFallback(keywords);
    }

    const data = await response.json();

    if (!data.Rows || data.Rows.length === 0) {
      return searchRutenFallback(keywords);
    }

    return data.Rows.slice(0, 10).map((item: {
      Id: string;
      Name: string;
      PriceRange: number[];
      Image: string;
      Nick: string;
      SoldQty: number;
    }) => {
      const price = item.PriceRange?.[0] || 0;
      const imageId = item.Image || "";
      const imageUrl = imageId
        ? `${RUTEN_IMAGE_BASE}${imageId.substring(0, 4)}/${imageId}`
        : "";

      return {
        itemId: item.Id,
        name: item.Name,
        price,
        priceDisplay: `NT$ ${price.toLocaleString()}`,
        imageUrl,
        productUrl: `https://www.ruten.com.tw/item/show?${item.Id}`,
        sellerName: item.Nick || "露天賣家",
        soldCount: item.SoldQty || 0,
      };
    });
  } catch (error) {
    console.error("Ruten search error:", error);
    return searchRutenFallback(keywords);
  }
}

/**
 * 備用方法：使用搜尋引擎搜尋露天
 */
async function searchRutenFallback(
  keywords: string[]
): Promise<RutenSearchResult[]> {
  try {
    const query = `site:ruten.com.tw ${keywords.join(" ")}`;
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const html = await response.text();

    const results: RutenSearchResult[] = [];
    // 尋找露天商品連結
    const linkRegex =
      /href="[^"]*ruten\.com\.tw\/item\/show\?(\d+)[^"]*"[^>]*>/g;
    let match;
    let count = 0;

    while ((match = linkRegex.exec(html)) !== null && count < 10) {
      const itemId = match[1];
      results.push({
        itemId,
        name: `露天商品 ${itemId}`,
        price: 0,
        priceDisplay: "查看商品",
        imageUrl: "",
        productUrl: `https://www.ruten.com.tw/item/show?${itemId}`,
        sellerName: "露天賣家",
        soldCount: 0,
      });
      count++;
    }

    return results;
  } catch (error) {
    console.error("Ruten fallback search error:", error);
    return [];
  }
}

/**
 * 取得露天商品詳情
 */
export async function getRutenItemDetail(
  itemId: string
): Promise<{
  name: string;
  images: string[];
  price: number;
  description: string;
} | null> {
  try {
    const url = `https://rtapi.ruten.com.tw/api/prod/v2/index.php/prod?id=${itemId}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
        Referer: "https://www.ruten.com.tw/",
      },
    });

    const data = await response.json();

    if (!data || data.length === 0) return null;

    const item = data[0];
    const images = (item.Photos || []).map((photo: { URL: string }) =>
      photo.URL.startsWith("//") ? `https:${photo.URL}` : photo.URL
    );

    return {
      name: item.Name || `露天商品 ${itemId}`,
      images,
      price: item.PriceRange?.[0] || 0,
      description: item.StoreDesc || "",
    };
  } catch (error) {
    console.error("Ruten item detail error:", error);
    return null;
  }
}
