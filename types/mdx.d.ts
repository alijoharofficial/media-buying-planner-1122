// Guide articles: default export is the compiled MDX body; `faq` feeds the FAQ block and FAQPage JSON-LD.
declare module '*.mdx' {
  import type { ComponentType } from 'react';
  export const faq: Array<{ q: string; a: string }> | undefined;
  const MDXContent: ComponentType;
  export default MDXContent;
}
