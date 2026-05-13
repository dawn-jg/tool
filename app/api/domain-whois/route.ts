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
    // Use HackerTarget API (free tier, no auth required)
    const response = await fetch(
      `https://api.hackertarget.com/whois/?q=${encodeURIComponent(cleanDomain)}`
    );

    const text = await response.text();

    // HackerTarget returns error message as plain text when domain not found
    if (!response.ok || text.startsWith('ERROR') || text.startsWith('DNS')) {
      return NextResponse.json({
        error: '未找到域名信息或查询失败',
        domain: cleanDomain,
      });
    }

    // Parse whois text response into structured data
    const lines = text.split('\n');
    const whoisData: Record<string, string> = {};
    
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        if (key) whoisData[key] = value;
      }
    }

    return NextResponse.json({
      domain: cleanDomain,
      registrar: whoisData['Registrar'] || whoisData['Registrar Name'] || '',
      createdDate: whoisData['Created Date'] || whoisData['Creation Date'] || '',
      expiryDate: whoisData['Expires Date'] || whoisData['Expiration Date'] || whoisData['Registry Expiry Date'] || '',
      updatedDate: whoisData['Updated Date'] || whoisData['Updated'] || '',
      nameservers: whoisData['Name Server'] ? whoisData['Name Server'].split(',').map(ns => ns.trim()) : [],
      rawText: text,
    });
  } catch (error) {
    console.error('WHOIS lookup error:', error);
    return NextResponse.json({
      error: '查询失败，请稍后重试',
      domain: cleanDomain,
    }, { status: 500 });
  }
}