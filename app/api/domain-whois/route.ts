import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: '域名不能为空' }, { status: 400 });
  }

  // Clean domain
  let cleanDomain = domain.trim().toLowerCase();
  cleanDomain = cleanDomain.replace(/^(https?:\/\/)?(www\.)?/, '');
  cleanDomain = cleanDomain.split('/')[0];

  try {
    // Use Domainr API from server-side (bypasses CORS)
    const response = await fetch(
      `https://api.domains.dev/api/v2/whois?domain=${encodeURIComponent(cleanDomain)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Parse and return WHOIS data
    const whois = data?.whoIs;

    if (!whois) {
      return NextResponse.json({
        error: '未找到域名信息',
        domain: cleanDomain,
      });
    }

    return NextResponse.json({
      domain: cleanDomain,
      registrar: whois.registrar || '',
      createdDate: whois.createdDate || '',
      expiryDate: whois.expiresAt || '',
      updatedDate: whois.updatedAt || '',
      nameservers: whois.nameServers || [],
      status: whois.status || [],
    });
  } catch (error) {
    console.error('WHOIS lookup error:', error);
    return NextResponse.json({
      error: '查询失败，请稍后重试',
      domain: cleanDomain,
    }, { status: 500 });
  }
}