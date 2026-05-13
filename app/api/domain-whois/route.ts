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

  // Ensure domain is in proper format (uppercase for RDAP)
  const rdapDomain = cleanDomain.toUpperCase();

  try {
    // Use RDAP (Registration Data Access Protocol) - standardized, no auth required
    const response = await fetch(
      `https://rdap.org/domain/${encodeURIComponent(rdapDomain)}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          error: '未找到该域名的注册信息',
          domain: cleanDomain,
        });
      }
      throw new Error(`RDAP API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Extract dates from events array
    const events = data.events || [];
    const getEventDate = (action: string) => {
      const event = events.find((e: any) => e.eventAction === action);
      return event?.eventDate || '';
    };

    // Extract nameservers
    const nameservers = (data.nameservers || []).map((ns: any) => ns.ldhName);

    // Extract registrar from entities
    const entities = data.entities || [];
    const registrarEntity = entities.find((e: any) => 
      e.roles?.includes('registrar') || e.objectClassName === 'entity'
    );
    const registrar = registrarEntity?.handle || 
                      registrarEntity?.vcardArray?.[1]?.find((v: any) => v[0] === 'fn')?.[3] || '';

    return NextResponse.json({
      domain: cleanDomain,
      registrar: registrar,
      createdDate: getEventDate('registration'),
      expiryDate: getEventDate('expiration'),
      updatedDate: getEventDate('last changed'),
      nameservers: nameservers,
      status: data.status || [],
    });
  } catch (error) {
    console.error('RDAP WHOIS lookup error:', error);
    return NextResponse.json({
      error: '查询失败，请稍后重试',
      domain: cleanDomain,
    }, { status: 500 });
  }
}