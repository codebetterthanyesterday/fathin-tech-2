import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Basic validation
    new URL(url);

    // Fetch the HTML with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PortfolioBot/1.0)',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract metadata
    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      '';

    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    // Image isn't strictly necessary for the minimal card, but good to have
    const image = 
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      '';

    // Favicon resolution
    let favicon = 
      $('link[rel="apple-touch-icon"]').attr('href') ||
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href');

    // Make favicon absolute if it's relative
    if (favicon && !favicon.startsWith('http')) {
      try {
        const baseUrl = new URL(url);
        favicon = new URL(favicon, baseUrl.origin).toString();
      } catch (e) {
        // Ignore parsing errors for favicon
      }
    }

    // Fallback to default favicon.ico if none found
    if (!favicon) {
      try {
        const baseUrl = new URL(url);
        favicon = `${baseUrl.origin}/favicon.ico`;
      } catch (e) {
        // Ignore
      }
    }

    return NextResponse.json({
      title: title.trim(),
      description: description.trim(),
      favicon,
      image,
    });
  } catch (error: any) {
    console.error('Link preview error:', error);
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 408 });
    }
    return NextResponse.json({ error: 'Failed to process URL' }, { status: 500 });
  }
}
