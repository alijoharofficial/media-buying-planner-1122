import { ImageResponse } from 'next/og';
import { BRAND_NAME, SITE_URL } from '@/lib/brand';
import { iconDataUri } from '@/lib/logo-svg';

/** One dynamic template for every Open Graph / Twitter image: logo, brand, page or article title. */

const FONT_FAMILY: Record<string, string> = { zh: 'Noto Sans SC' };

/** Loads only the glyphs needed for the title from Google Fonts (CJK titles need a matching font). */
async function loadFont(family: string, text: string) {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@700&text=${encodeURIComponent(text)}`)).text();
    const url = css.match(/src: url\((.+?)\) format/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : undefined;
  } catch {
    return undefined;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get('locale') ?? 'en';
  // Arabic shaping is not supported by the image renderer, so Arabic cards show the brand only.
  const title = locale === 'ar' ? '' : (searchParams.get('title') ?? '').slice(0, 140);
  const family = FONT_FAMILY[locale];
  const fontData = family && title ? await loadFont(family, title) : undefined;
  const host = new URL(SITE_URL).host;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          color: '#eef1ff',
          background: 'linear-gradient(135deg, #060a1f 0%, #1e2a78 60%, #0e7490 100%)',
          ...(fontData && family ? { fontFamily: family } : {}),
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={iconDataUri()} width={84} height={84} alt="" />
          <span style={{ fontSize: 40, fontWeight: 800 }}>
            {BRAND_NAME.split(' ').slice(0, -1).join(' ')} <span style={{ color: '#22d3ee', marginLeft: 12 }}>{BRAND_NAME.split(' ').at(-1)}</span>
          </span>
        </div>
        <div style={{ display: 'flex', fontSize: title.length > 70 ? 54 : 66, fontWeight: 800, lineHeight: 1.15, maxWidth: 1000 }}>{title || BRAND_NAME}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 26, color: '#b3bbdc' }}>
          <span>{host}</span>
          <span style={{ display: 'flex', width: 220, height: 8, borderRadius: 4, background: 'linear-gradient(90deg, #6366f1, #22d3ee)' }} />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      ...(fontData && family ? { fonts: [{ name: family, data: fontData, weight: 700 as const, style: 'normal' as const }] } : {}),
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable' },
    },
  );
}
