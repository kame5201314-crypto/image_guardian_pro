/**
 * Shopee (蝦皮) 搜尋服務
 * 使用蝦皮的搜尋 API 來搜尋商品
 */

export interface ShopeeSearchResult {
  itemId: number;
  shopId: number;
  name: string;
  price: number;
  priceDisplay: string;
  imageUrl: string;
  shopName: string;
  productUrl: string;
  sold: number;
  rating: number;
}

const SHOPEE_API_BASE = "https://shopee.tw/api/v4/search/search_items";
const SHOPEE_IMAGE_BASE = "https://cf.shopee.tw/file/";

/**
 * 在蝦皮搜尋商品
 */
export async function searchShopee(
  keywords: string[]
): Promise<ShopeeSearchResult[]> {
  try {
    const query = keywords.join(" ");
    const params = new URLSearchParams({
      by: "relevancy",
      keyword: query,
      limit: "20",
      newest: "0",
      order: "desc",
      page_type: "search",
      scenario: "PAGE_GLOBAL_SEARCH",
      version: "2",
    });

    const url = `${SHOPEE_API_BASE}?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
        "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        Referer: "https://shopee.tw/",
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    if (!response.ok) {
      console.error("Shopee API error:", response.status);
      return searchShopeeFallback(keywords);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return searchShopeeFallback(keywords);
    }

    return data.items.slice(0, 10).map((item: {
      item_basic: {
        itemid: number;
        shopid: number;
        name: string;
        price: number;
        image: string;
        shop_name: string;
        historical_sold: number;
        item_rating: { rating_star: number };
      };
    }) => {
      const basic = item.item_basic;
      return {
        itemId: basic.itemid,
        shopId: basic.shopid,
        name: basic.name,
        price: basic.price / 100000, // 蝦皮價格需要除以 100000
        priceDisplay: `NT$ ${(basic.price / 100000).toLocaleString()}`,
        imageUrl: `${SHOPEE_IMAGE_BASE}${basic.image}`,
        shopName: basic.shop_name || "蝦皮賣家",
        productUrl: `https://shopee.tw/product/${basic.shopid}/${basic.itemid}`,
        sold: basic.historical_sold || 0,
        rating: basic.item_rating?.rating_star || 0,
      };
    });
  } catch (error) {
    console.error("Shopee search error:", error);
    return searchShopeeFallback(keywords);
  }
}

/**
 * 備用方法：使用 Google Site Search
 */
async function searchShopeeFallback(
  keywords: string[]
): Promise<ShopeeSearchResult[]> {
  try {
    // 使用 DuckDuckGo 搜尋蝦皮站內
    const query = `site:shopee.tw ${keywords.join(" ")}`;
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const html = await response.text();

    // 簡單解析結果
    const results: ShopeeSearchResult[] = [];
    const linkRegex =
      /href="(https:\/\/shopee\.tw\/[^"]+)"[^>]*>([^<]+)</g;
    let match;
    let count = 0;

    while ((match = linkRegex.exec(html)) !== null && count < 10) {
      const productUrl = match[1];
      const name = match[2].trim();

      // 嘗試從 URL 提取 shop_id 和 item_id
      const urlMatch = productUrl.match(/\.(\d+)\.(\d+)/);

      results.push({
        itemId: urlMatch ? parseInt(urlMatch[2]) : count,
        shopId: urlMatch ? parseInt(urlMatch[1]) : 0,
        name: name || `蝦皮商品 ${count + 1}`,
        price: 0,
        priceDisplay: "查看商品",
        imageUrl: "",
        shopName: "蝦皮賣家",
        productUrl: productUrl.startsWith("http")
          ? productUrl
          : `https://shopee.tw${productUrl}`,
        sold: 0,
        rating: 0,
      });
      count++;
    }

    return results;
  } catch (error) {
    console.error("Shopee fallback search error:", error);
    return [];
  }
}

/**
 * 取得蝦皮商品詳情
 */
export async function getShopeeItemDetail(
  shopId: number,
  itemId: number
): Promise<{
  name: string;
  images: string[];
  price: number;
  description: string;
} | null> {
  try {
    const url = `https://shopee.tw/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
        Referer: "https://shopee.tw/",
      },
    });

    const data = await response.json();

    if (!data.data) return null;

    const item = data.data;
    return {
      name: item.name,
      images: (item.images || []).map(
        (img: string) => `${SHOPEE_IMAGE_BASE}${img}`
      ),
      price: item.price / 100000,
      description: item.description || "",
    };
  } catch (error) {
    console.error("Shopee item detail error:", error);
    return null;
  }
}
