import { headers } from 'next/headers';

/** Structured data block. Content is our own data (never user input); "<" is escaped so it cannot close the tag. */
export async function JsonLd({ data }: { data: object }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: json }} />;
}
