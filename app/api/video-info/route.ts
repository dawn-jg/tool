// app/api/video-info/route.ts — Edge runtime proxy for multi-platform video extraction
export const runtime = 'edge';

// ===== Platform Detection =====
function getPlatform(url: string): string | null {
  if (/bilibili\.com|b23\.tv/i.test(url)) return 'bilibili';
  if (/tiktok\.com/i.test(url)) return 'tiktok';
  if (/douyin\.com|iesdouyin/i.test(url)) return 'douyin';
  if (/kuaishou\.com/i.test(url)) return 'kuaishou';
  if (/xiaohongshu\.com|xhslink\.com/i.test(url)) return 'xiaohongshu';
  if (/weibo\.com/i.test(url)) return 'weibo';
  if (/ixigua\.com/i.test(url)) return 'xigua';
  if (/toutiao\.com/i.test(url)) return 'toutiao';
  if (/haokan\./i.test(url)) return 'haokan';
  if (/pipixia\.com/i.test(url)) return 'pipixia';
  return null;
}

const PLATFORM_NAME: Record<string, string> = {
  bilibili: 'B站', tiktok: 'TikTok', douyin: '抖音',
  kuaishou: '快手', xiaohongshu: '小红书', weibo: '微博',
  xigua: '西瓜视频', toutiao: '今日头条', haokan: '好看视频', pipixia: '皮皮虾',
};

const SCRAPE_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

interface VideoResult {
  platform: string;
  platformName: string;
  title?: string;
  author?: string;
  cover?: string;
  downloadUrl?: string;
  error?: string;
}

// ===== Bilibili (open API) =====
async function parseBilibili(url: string): Promise<VideoResult> {
  const m = url.match(/BV\w{10}/);
  if (!m) return { platform: 'bilibili', platformName: 'B站', error: '无法提取BV号' };

  const bvid = m[0];
  const infoRes = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
    headers: { 'User-Agent': SCRAPE_UA },
  });
  if (!infoRes.ok) return { platform: 'bilibili', platformName: 'B站', error: 'API请求失败' };
  const info: any = await infoRes.json();
  if (info.code !== 0) return { platform: 'bilibili', platformName: 'B站', error: info.message || '视频不存在' };

  const cid = info.data.cid;
  const playRes = await fetch(
    `https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=80&platform=web&high_quality=1`,
    { headers: { 'User-Agent': SCRAPE_UA, 'Referer': 'https://www.bilibili.com' } }
  );
  const play: any = await playRes.json();
  let downloadUrl: string | undefined;
  if (play.code === 0 && play.data?.durl?.length > 0) {
    downloadUrl = play.data.durl[0].url;
  }

  return {
    platform: 'bilibili', platformName: 'B站',
    title: info.data.title, author: info.data.owner?.name,
    cover: info.data.pic, downloadUrl,
  };
}

// ===== Generic page scraper =====
// Fetches the page and extracts video info from HTML, meta tags, JSON-LD
async function pageScrape(url: string, platform: string, platformName: string): Promise<VideoResult> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': SCRAPE_UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    if (!res.ok) {
      return { platform, platformName, error: `页面请求失败 (HTTP ${res.status})` };
    }

    const html = await res.text();
    let title: string | undefined;
    let cover: string | undefined;
    let downloadUrl: string | undefined;
    let author: string | undefined;

    // Try JSON-LD
    const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (ldMatch) {
      try {
        const ld: any = JSON.parse(ldMatch[1]);
        title = title || ld.name || ld.headline;
        cover = cover || ld.thumbnailUrl?.[0] || ld.image;
        downloadUrl = downloadUrl || ld.contentUrl || ld.url;
      } catch {}
    }

    // Try meta tags
    const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1];
    title = title || ogTitle;
    const ogImage = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1];
    cover = cover || ogImage;
    const ogVideo = html.match(/<meta[^>]+property="og:video"[^>]+content="([^"]+)"/i)?.[1];
    downloadUrl = downloadUrl || ogVideo;

    // Try <video>/<source> tags
    const vidSrc = html.match(/<video[^>]+src="([^"]+)"/)?.[1];
    downloadUrl = downloadUrl || vidSrc;
    const srcTag = html.match(/<source[^>]+src="([^"]+)"/i)?.[1];
    downloadUrl = downloadUrl || srcTag;

    // Try to find any video URL in raw HTML
    const vidUrls = html.match(/(https?:[^"'\s]+\.(mp4|webm|m3u8)[^"'\s]*)/gi);
    if (vidUrls && vidUrls.length > 0) {
      downloadUrl = downloadUrl || vidUrls[0];
    }

    // Try meta author
    const authorMeta = html.match(/<meta[^>]+name="author"[^>]+content="([^"]+)"/i)?.[1];
    author = author || authorMeta;

    if (!downloadUrl && !title && !cover) {
      return { platform, platformName, error: `${platformName} 解析链接受限制，可尝试使用官方APP下载` };
    }

    return { platform, platformName, title, author, cover, downloadUrl };
  } catch (e: any) {
    return { platform, platformName, error: e.message || '网络请求失败' };
  }
}

// ===== TikTok =====
async function parseTikTok(url: string): Promise<VideoResult> {
  try {
    const videoId = url.match(/video\/(\d+)/)?.[1];
    if (!videoId) return { platform: 'tiktok', platformName: 'TikTok', error: '无法提取视频ID' };
    const embedRes = await fetch(`https://www.tiktok.com/oembed?url=https://www.tiktok.com/video/${videoId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (embedRes.ok) {
      const embed: any = await embedRes.json();
      return {
        platform: 'tiktok', platformName: 'TikTok',
        title: embed.title, author: embed.author_name, cover: embed.thumbnail_url,
      };
    }
  } catch {}
  return pageScrape(url, 'tiktok', 'TikTok');
}

// ===== Platform-specific parsers (use generic page scraper) =====
const parseWeibo = (url: string) => pageScrape(url.split('?')[0], 'weibo', '微博');
const parseXigua = (url: string) => pageScrape(url, 'xigua', '西瓜视频');
const parseToutiao = (url: string) => pageScrape(url, 'toutiao', '今日头条');
const parseHaokan = (url: string) => pageScrape(url, 'haokan', '好看视频');
const parseDouyin = (url: string) => pageScrape(url, 'douyin', '抖音');
const parseKuaishou = (url: string) => pageScrape(url, 'kuaishou', '快手');
const parseXiaohongshu = (url: string) => pageScrape(url, 'xiaohongshu', '小红书');
const parsePipixia = (url: string) => pageScrape(url, 'pipixia', '皮皮虾');

// ===== Main handler =====
export async function POST(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const url = body?.url?.trim();
  if (!url) {
    return new Response(JSON.stringify({ error: '请输入视频链接' }), { status: 200 });
  }

  const platform = getPlatform(url);
  if (!platform) {
    return new Response(JSON.stringify({
      platform: 'unknown', platformName: '未知',
      error: '暂不支持的平台。目前支持: 抖音、B站、TikTok、快手、小红书、微博、西瓜视频、今日头条、好看视频、皮皮虾',
    }), { status: 200 });
  }

  let result: VideoResult;
  switch (platform) {
    case 'bilibili': result = await parseBilibili(url); break;
    case 'tiktok': result = await parseTikTok(url); break;
    case 'douyin': result = await parseDouyin(url); break;
    case 'kuaishou': result = await parseKuaishou(url); break;
    case 'xiaohongshu': result = await parseXiaohongshu(url); break;
    case 'weibo': result = await parseWeibo(url); break;
    case 'xigua': result = await parseXigua(url); break;
    case 'toutiao': result = await parseToutiao(url); break;
    case 'haokan': result = await parseHaokan(url); break;
    case 'pipixia': result = await parsePipixia(url); break;
    default: result = { platform, platformName: PLATFORM_NAME[platform] || platform, error: '暂不支持解析' };
  }

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
  });
}
