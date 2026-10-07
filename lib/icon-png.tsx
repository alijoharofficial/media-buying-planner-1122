import { ImageResponse } from 'next/og';
import { iconDataUri } from './logo-svg';

/** Renders the logo mark as a PNG of the given size. */
export async function renderIconPng(size: number, padding = 0) {
  const src = iconDataUri();
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
