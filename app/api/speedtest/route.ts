import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/*
 * Ookla Speedtest 代理
 * Ookla 测速服务器不开放 CORS，浏览器无法直连，全部请求经此路由转发。
 * 服务器列表来自 Ookla 公开 js API（按地区 search），URL 全部服务端构造，避免 SSRF。
 */

const OOKLA_JS_API = 'https://www.speedtest.net/api/js/servers?engine=js';
const UPLOAD_EP = 'upload.php';
const LATENCY_FILE = 'latency.txt';
const DOWNLOAD_FILES = [
  'random350x350.jpg',
  'random500x500.jpg',
  'random750x750.jpg',
  'random1000x1000.jpg',
  'random1500x1500.jpg',
  'random2000x2000.jpg',
  'random2500x2500.jpg',
];

// 服务器列表缓存（按 search 区分，10 分钟过期）
function getCache(): Record<string, { servers: any[]; ts: number }> {
  return ((globalThis as any).__ooklaServersCache =
    (globalThis as any).__ooklaServersCache || {});
}

async function fetchServers(search: string): Promise<any[]> {
  const cache = getCache();
  const hit = cache[search];
  if (hit && Date.now() - hit.ts < 10 * 60 * 1000) {
    return hit.servers;
  }
  const res = await fetch(`${OOKLA_JS_API}&search=${encodeURIComponent(search)}&limit=50`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
  });
  if (!res.ok) throw new Error(`Ookla API responded ${res.status}`);
  const data = await res.json();
  // 代理模式下 CF 服务端 fetch 无混合内容/CORS 限制，http 节点也可用，不过滤
  const servers = (data || []).map((s: any) => ({
    id: String(s.id),
    name: s.name,
    country: s.country,
    cc: s.cc,
    sponsor: s.sponsor,
    host: s.host,
    // 保留原协议（http/https），base 指向 speedtest 目录
    base: s.url.replace(/upload\.php$/, ''),
  }));
  cache[search] = { servers, ts: Date.now() };
  return servers;
}

function isAllowedFile(file: string): boolean {
  return file === LATENCY_FILE || DOWNLOAD_FILES.includes(file);
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const action = sp.get('action') || 'servers';
  try {
    if (action === 'servers') {
      const search = sp.get('search') || 'China';
      // 支持逗号分隔多个地区，合并去重（Ookla API 动态截断，单 search 可能缺节点）
      const searches = search.split(',').map((s) => s.trim()).filter(Boolean);
      const seen = new Set<string>();
      const merged: any[] = [];
      for (const q of searches) {
        let list: any[] = [];
        try {
          list = await fetchServers(q);
        } catch (e) {
          // 单个 search 失败不影响其他
        }
        for (const s of list) {
          if (!seen.has(s.id)) {
            seen.add(s.id);
            merged.push(s);
          }
        }
      }
      return NextResponse.json({ servers: merged });
    }

    const id = sp.get('id');
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });

    // 从缓存/实时列表解析服务器，URL 服务端构造
    let servers: any[] = [];
    try {
      servers = await fetchServers(sp.get('search') || 'China');
    } catch (e) {
      const hit = getCache()[sp.get('search') || 'China'];
      if (hit) servers = hit.servers;
    }
    const server = servers.find((s) => s.id === id);
    if (!server) return NextResponse.json({ error: 'server not found' }, { status: 404 });

    if (action === 'ping') {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      try {
        const start = Date.now();
        const res = await fetch(`${server.base}${LATENCY_FILE}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: ctrl.signal,
        });
        await res.arrayBuffer();
        return NextResponse.json({ ms: Date.now() - start, status: res.status });
      } finally {
        clearTimeout(timer);
      }
    }

    if (action === 'download') {
      const file = sp.get('file') || DOWNLOAD_FILES[3];
      if (!isAllowedFile(file)) {
        return NextResponse.json({ error: 'file not allowed' }, { status: 400 });
      }
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 20000);
      try {
        const res = await fetch(`${server.base}${file}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) {
          return NextResponse.json({ error: 'download failed' }, { status: 502 });
        }
        return new NextResponse(res.body, {
          status: 200,
          headers: {
            'Content-Type': 'application/octet-stream',
            'Cache-Control': 'no-store',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } finally {
        clearTimeout(timer);
      }
    }

    return NextResponse.json({ error: 'unknown action' }, { status: 400 });
  } catch (e) {
    console.error('speedtest proxy error:', e);
    return NextResponse.json({ error: 'proxy failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const id = sp.get('id');
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });

  try {
    let servers: any[] = [];
    try {
      servers = await fetchServers(sp.get('search') || 'China');
    } catch (e) {
      const hit = getCache()[sp.get('search') || 'China'];
      if (hit) servers = hit.servers;
    }
    const server = servers.find((s) => s.id === id);
    if (!server) return NextResponse.json({ error: 'server not found' }, { status: 404 });

    // 转发上传流到 Ookla upload.php
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch(`${server.base}${UPLOAD_EP}`, {
        method: 'POST',
        body: request.body,
        duplex: 'half',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: ctrl.signal,
      } as RequestInit);
      const text = await res.text();
      return NextResponse.json({ status: res.status, text: text.slice(0, 200) });
    } finally {
      clearTimeout(timer);
    }
  } catch (e) {
    console.error('speedtest upload proxy error:', e);
    return NextResponse.json({ error: 'upload proxy failed' }, { status: 502 });
  }
}
