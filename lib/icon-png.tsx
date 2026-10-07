import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

/** Renders app/icon.svg (single source of the logo mark) as a PNG of the given size. */
export async function renderIconPng(size: number, padding = 0) {
  const svg = await readFile(join(process.cwd(), 'app/icon.svg'), 'utf8');
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  const inner = size - padding * 2;
  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: padding ? '#1E2A78' : 'transparent',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={inner} height={inner} alt="" />
      </div>
    ),
    { width: size, height: size },
  );
}
