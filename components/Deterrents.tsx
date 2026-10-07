'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/Toast';

/** Form fields keep normal selection, copy, paste and context menus. */
const EDITABLE = 'input, textarea, select, [contenteditable="true"]';
const isEditable = (t: EventTarget | null) => t instanceof Element && Boolean(t.closest(EDITABLE));

/**
 * Copy and inspect deterrents (brief 17), mounted once in the root layout.
 * They only discourage casual copying: keyboard navigation, screen readers and crawlers are unaffected
 * (content stays in the HTML, Tab/Enter/arrows are never blocked).
 */
export function Deterrents() {
  const t = useTranslations('common');
  const toast = useToast();
  const lastToast = useRef(0);

  useEffect(() => {
    const notify = () => {
      const now = Date.now();
      if (now - lastToast.current > 2500) {
        lastToast.current = now;
        toast(t('protected'), 'info');
      }
    };
    const onContextMenu = (e: MouseEvent) => {
      if (isEditable(e.target)) return;
      e.preventDefault();
    };
    const onCopy = (e: ClipboardEvent) => {
      if (isEditable(e.target) || isEditable(document.activeElement)) return;
      e.preventDefault();
      notify();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      const blocked = e.key === 'F12' || (mod && e.shiftKey && ['i', 'j', 'c'].includes(key)) || (mod && !e.shiftKey && ['u', 's'].includes(key));
      if (blocked) {
        e.preventDefault();
        notify();
      }
    };
    const onDragStart = (e: DragEvent) => {
      if (e.target instanceof HTMLImageElement || (e.target instanceof Element && e.target.closest('svg'))) e.preventDefault();
    };

    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('copy', onCopy);
    document.addEventListener('cut', onCopy);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('dragstart', onDragStart);
    document.documentElement.classList.add('protect');
    return () => {
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('cut', onCopy);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('dragstart', onDragStart);
      document.documentElement.classList.remove('protect');
    };
  }, [t, toast]);

  return null;
}
