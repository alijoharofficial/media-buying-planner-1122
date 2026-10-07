import type { MDXComponents } from 'mdx/types';
import { Callout, Formula, SmartLink, TryPlanner } from '@/components/guides/ArticleParts';

/** Components available to every guide (shared MDX layout lives in app/[locale]/guides/[slug]). */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components, a: SmartLink, TryPlanner, Callout, Formula };
}
