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

// 服务器列表缓存（edge isolate 内全局，10 分钟过期）
function getCache(): { servers: any[]; ts: number } | null {
  return (globalThis as any).__ooklaServersCache || null;
}
function setCache(servers: any[]) {
  (globalThis as any).__ooklaServersCache = { servers, ts: Date.now() };
}

async function fetchServers(search: string): Promise<any[]> {
  const cached = getCache();
  if (cached && Date.now() - cached.ts < 10 * 60 * 1000) {
    return cached.servers;
  }
  const res = await fetch(`${OOKLA_JS_API}&search=${encodeURIComponent(search)}&limit=50`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
  });
  if (!res.ok) throw new Error(`Ookla API responded ${res.status}`);
  const data = await res.json();
  const servers = (data || [])
    .filter((s: any) => s.https_functional === 1)
    .map((s: any) => ({
      id: String(s.id),
      name: s.name,
      country: s.country,
      cc: s.cc,
      sponsor: s.sponsor,
      host: s.host,
      base: s.url.replace(/^http:\/\//, 'https://').replace(/upload\.php$/, ''),
    }));
  setCache(servers);
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
      const servers = await fetchServers(search);
      return NextResponse.json({ servers });
    }

    const id = sp.get('id');
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });

    // 从缓存/实时列表解析服务器，URL 服务端构造
    let servers: any[] = [];
    try {
      servers = await fetchServers(sp.get('search') || 'China');
    } catch (e) {
      const cached = getCache();
      if (cached) servers = cached.servers;
    }
    const server = servers.find((s) => s.id === id);
    if (!server) return NextResponse.json({ error: 'server not found' }, { status: 404 });

    if (action === 'ping') {
      const start = Date.now();
      const res = await fetch(`${server.base}${LATENCY_FILE}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      await res.arrayBuffer();
      return NextResponse.json({ ms: Date.now() - start, status: res.status });
    }

    if (action === 'download') {
      const file = sp.get('file') || DOWNLOAD_FILES[3];
      if (!isAllowedFile(file)) {
        return NextResponse.json({ error: 'file not allowed' }, { status: 400 });
      }
      const res = await fetch(`${server.base}${file}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
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
      const cached = getCache();
      if (cached) servers = cached.servers;
    }
    const server = servers.find((s) => s.id === id);
    if (!server) return NextResponse.json({ error: 'server not found' }, { status: 404 });

    // 转发上传流到 Ookla upload.php
    const res = await fetch(`${server.base}${UPLOAD_EP}`, {
      method: 'POST',
      body: request.body,
      duplex: 'half',
      headers: { 'User-Agent': 'Mozilla/5.0' },
    } as RequestInit);
    const text = await res.text();
    return NextResponse.json({ status: res.status, text: text.slice(0, 200) });
  } catch (e) {
    console.error('speedtest upload proxy error:', e);
    return NextResponse.json({ error: 'upload proxy failed' }, { status: 502 });
  }
}
