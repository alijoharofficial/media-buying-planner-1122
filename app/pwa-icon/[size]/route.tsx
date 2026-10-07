import { renderIconPng } from '@/lib/icon-png';

export const dynamic = 'force-static';
export const dynamicParams = false;

const PWA_ICON_SIZES = ['192', '512', '512-maskable'] as const;

export function generateStaticParams() {
  return PWA_ICON_SIZES.map((size) => ({ size }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const maskable = size.endsWith('-maskable');
  const px = parseInt(size, 10);
  // Maskable icons need a safe zone, so the mark sits inside a 10% padded brand square.
  return renderIconPng(px, maskable ? Math.round(px * 0.1) : 0);
}
