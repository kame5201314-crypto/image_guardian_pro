/**
 * Google Custom Search API / SerpAPI Integration
 * 用於反向圖片搜尋和關鍵字搜尋
 */

export interface GoogleSearchResult {
  title: string;
  link: string;
  displayLink: string;
  snippet: string;
  image?: {
    contextLink: string;
    thumbnailLink: string;
  };
}

/**
 * 使用 Google Custom Search API 搜尋圖片
 * 需要設定 GOOGLE_API_KEY 和 GOOGLE_SEARCH_ENGINE_ID
 */
export async function searchGoogleImages(
  keywords: string[]
): Promise<GoogleSearchResult[]> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  // 如果沒有 API Key，使用備用方法
  if (!apiKey || !searchEngineId) {
    console.log("Google API not configured, using fallback search");
    return searchGoogleFallback(keywords);
  }

  try {
    const query = keywords.join(" ");
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&searchType=image&num=10`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("Google API error:", data.error);
      return searchGoogleFallback(keywords);
    }

    return (data.items || []).map((item: {
      title: string;
      link: string;
      displayLink: string;
      snippet: string;
      image?: { contextLink: string; thumbnailLink: string };
    }) => ({
      title: item.title,
      link: item.link,
      displayLink: item.displayLink,
      snippet: item.snippet,
      image: item.image
        ? {
            contextLink: item.image.contextLink,
            thumbnailLink: item.image.thumbnailLink,
          }
        : undefined,
    }));
  } catch (error) {
    console.error("Google search error:", error);
    return searchGoogleFallback(keywords);
  }
}

/**
 * 備用方法：使用 DuckDuckGo 或其他免費搜尋
 */
async function searchGoogleFallback(
  keywords: string[]
): Promise<GoogleSearchResult[]> {
  try {
    const query = keywords.join(" ");
    // 使用 DuckDuckGo Instant Answer API (免費)
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;

    const response = await fetch(url);
    const data = await response.json();

    const results: GoogleSearchResult[] = [];

    // 解析 DuckDuckGo 結果
    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, 10)) {
        if (topic.FirstURL) {
          results.push({
            title: topic.Text || "搜尋結果",
            link: topic.FirstURL,
            displayLink: new URL(topic.FirstURL).hostname,
            snippet: topic.Text || "",
            image: topic.Icon?.URL
              ? {
                  contextLink: topic.FirstURL,
                  thumbnailLink: topic.Icon.URL,
                }
              : undefined,
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error("Fallback search error:", error);
    return [];
  }
}

/**
 * 使用 SerpAPI 進行反向圖片搜尋（如果有 API Key）
 */
export async function reverseImageSearch(
  imageUrl: string
): Promise<GoogleSearchResult[]> {
  const serpApiKey = process.env.SERPAPI_KEY;

  if (!serpApiKey) {
    console.log("SerpAPI not configured");
    return [];
  }

  try {
    const url = `https://serpapi.com/search.json?engine=google_reverse_image&image_url=${encodeURIComponent(imageUrl)}&api_key=${serpApiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("SerpAPI error:", data.error);
      return [];
    }

    return (data.image_results || []).slice(0, 10).map((item: {
      title: string;
      link: string;
      source: string;
      snippet: string;
      thumbnail: string;
    }) => ({
      title: item.title,
      link: item.link,
      displayLink: item.source,
      snippet: item.snippet || "",
      image: {
        contextLink: item.link,
        thumbnailLink: item.thumbnail,
      },
    }));
  } catch (error) {
    console.error("Reverse image search error:", error);
    return [];
  }
}
