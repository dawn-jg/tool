// app/api/video-info/route.ts — Edge runtime proxy for video info extraction
export const runtime = 'edge';

// --- Platform detection ---
function getPlatform(url: string): string | null {
  if (/bilibili\.com|b23\.tv/i.test(url)) return 'bilibili';
  if (/tiktok\.com/i.test(url)) return 'tiktok';
  if (/douyin\.com/i.test(url)) return 'douyin';
  if (/kuaishou\.com/i.test(url)) return 'kuaishou';
  if (/xiaohongshu\.com|xhslink\.com/i.test(url)) return 'xiaohongshu';
  return null;
}

function extractBvid(url: string): string | null {
  const m = url.match(/BV\w{10}/);
  return m ? m[0] : null;
}

function extractTikTokId(url: string): string | null {
  const m = url.match(/video\/(\d+)/);
  return m ? m[1] : null;
}

interface VideoResult {
  platform: string;
  title?: string;
  author?: string;
  cover?: string;
  downloadUrl?: string;
  error?: string;
  fallbackUrl?: string;
}

async function fetchBilibili(bvid: string): Promise<VideoResult> {
  const infoRes = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  });
  if (!infoRes.ok) return { platform: 'bilibili', error: 'B站API请求失败' };
  const info = await infoRes.json() as any;
  if (info.code !== 0) return { platform: 'bilibili', error: info.message || '视频不存在' };

  const { data } = info;
  const cid = data.cid;

  const playRes = await fetch(
    `https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=80&platform=web&high_quality=1`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Referer': 'https://www.bilibili.com' } }
  );
  const play = await playRes.json() as any;
  let downloadUrl: string | undefined;
  if (play.code === 0 && play.data?.durl?.length > 0) {
    downloadUrl = play.data.durl[0].url;
  }

  return {
    platform: 'bilibili',
    title: data.title,
    author: data.owner?.name,
    cover: data.pic,
    downloadUrl,
  };
}

async function fetchTikTok(videoId: string): Promise<VideoResult> {
  const embedRes = await fetch(`https://www.tiktok.com/oembed?url=https://www.tiktok.com/video/${videoId}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  if (embedRes.ok) {
    const embed = await embedRes.json() as any;
    return {
      platform: 'tiktok',
      title: embed.title,
      author: embed.author_name,
      cover: embed.thumbnail_url,
      fallbackUrl: embed.author_url,
    };
  }

  try {
    const pageRes = await fetch(`https://www.tiktok.com/@x/video/${videoId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const html = await pageRes.text();
    const match = html.match(/"playAddr":\s*"([^"]+)"/);
    if (match) {
      return { platform: 'tiktok', downloadUrl: match[1].replace(/\\u002F/g, '/') };
    }
  } catch {}

  return { platform: 'tiktok', error: '无法提取下载链接（TikTok 限制较严）' };
}

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

  const { url } = body;
  if (!url || typeof url !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing url' }), { status: 400 });
  }

  const platform = getPlatform(url);
  if (!platform) {
    return new Response(JSON.stringify({
      platform: 'unknown',
      error: '不支持的平台，目前支持: B站(bilibili)、TikTok'
    }), { status: 200 });
  }

  let result: VideoResult;
  switch (platform) {
    case 'bilibili': {
      const bvid = extractBvid(url);
      if (!bvid) return new Response(JSON.stringify({ platform: 'bilibili', error: '无法提取BV号' }), { status: 200 });
      result = await fetchBilibili(bvid);
      break;
    }
    case 'tiktok': {
      const id = extractTikTokId(url);
      if (!id) return new Response(JSON.stringify({ platform: 'tiktok', error: '无法提取视频ID' }), { status: 200 });
      result = await fetchTikTok(id);
      break;
    }
    default: {
      result = { platform, error: `${platform} 暂不支持自动解析，请使用官方APP下载` };
    }
  }

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
  });
}
