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

    // Log raw response for debugging
    console.log('HackerTarget WHOIS response for', cleanDomain, ':', text.substring(0, 500));

    // HackerTarget returns error message as plain text when domain not found
    if (!response.ok || text.startsWith('ERROR') || text.startsWith('DNS') || text.includes('API count')) {
      return NextResponse.json({
        error: '未找到域名信息或查询失败',
        domain: cleanDomain,
        rawText: text,
      });
    }

    // Parse whois text response into structured data
    const lines = text.split('\n');
    const whoisData: Record<string, string> = {};
    
    for (const line of lines) {
      if (line.trim()) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim().toLowerCase();
          const value = line.substring(colonIndex + 1).trim();
          if (key && value) {
            whoisData[key] = value;
          }
        }
      }
    }

    console.log('Parsed whoisData:', whoisData);

    // If parsing failed (no keys found), return raw text for debugging
    const hasData = Object.keys(whoisData).length > 0;
    
    if (!hasData) {
      return NextResponse.json({
        domain: cleanDomain,
        registrar: '',
        createdDate: '',
        expiryDate: '',
        updatedDate: '',
        nameservers: [],
        status: [],
        rawText: text,
        parseError: true,
      });
    }

    return NextResponse.json({
      domain: cleanDomain,
      registrar: whoisData['registrar'] || whoisData['registrar name'] || whoisData['registrar'] || '',
      createdDate: whoisData['created date'] || whoisData['creation date'] || whoisData['created_date'] || '',
      expiryDate: whoisData['expires date'] || whoisData['expiration date'] || whoisData['registry expiry date'] || whoisData['expiry date'] || '',
      updatedDate: whoisData['updated date'] || whoisData['updated'] || whoisData['updated_date'] || '',
      nameservers: whoisData['name server'] ? whoisData['name server'].split(',').map(ns => ns.trim()) : [],
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