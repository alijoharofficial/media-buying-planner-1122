import type { Transition, Variants } from 'framer-motion';

/** Shared animation variants. MotionConfig reducedMotion="user" disables transforms when requested. */
export const easeOut: Transition['ease'] = [0.22, 1, 0.36, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: easeOut } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 380, damping: 22 } },
};

export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});

/** Word-by-word reveal for headlines: wrap each word in a motion.span with this variant. */
export const wordReveal: Variants = {
  hidden: { opacity: 0, y: '0.4em', filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease: easeOut } },
};

/** Props for scroll-triggered reveals on any motion element. */
export const revealOnScroll = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, margin: '-80px' },
} as const;
