"use client";

/**
 * Apple ProMotion 120Hz Fluid Physics & Animation Presets
 * Tuned for ultra-low restDelta (0.0005) and deterministic exit transitions
 * so overlays and screens never stall or block pointer events.
 */

export const APPLE_SPRING_SNAPPY = {
  type: "spring",
  stiffness: 540,
  damping: 34,
  mass: 0.7,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const APPLE_SPRING_FLUID = {
  type: "spring",
  stiffness: 380,
  damping: 30,
  mass: 0.85,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const APPLE_SPRING_SILKY = {
  type: "spring",
  stiffness: 290,
  damping: 28,
  mass: 0.95,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const APPLE_SPRING_BOUNCY = {
  type: "spring",
  stiffness: 580,
  damping: 24,
  mass: 0.65,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const APPLE_EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

export const appleButtonTapProps = {
  whileHover: { scale: 1.035, y: -1 },
  whileTap: { scale: 0.94 },
  transition: APPLE_SPRING_SNAPPY,
};

export const applePillTapProps = {
  whileHover: { scale: 1.03 },
  whileTap: { scale: 0.95 },
  transition: APPLE_SPRING_SNAPPY,
};

/**
 * Screen / Tab Continuity Variants (Apple macOS / iPadOS Stage Manager spring feel)
 */
export const appleScreenVariants = {
  initial: {
    opacity: 0,
    y: 18,
    scale: 0.975,
    filter: "blur(10px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      ...APPLE_SPRING_FLUID,
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.985,
    filter: "blur(6px)",
    transition: {
      duration: 0.16,
      ease: APPLE_EASE_OUT_EXPO,
    },
  },
};

export const appleStaggerContainerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.015,
    },
  },
};

export const appleItemSpringVariants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.96,
    filter: "blur(6px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: APPLE_SPRING_FLUID,
  },
};

/**
 * Modal / Sheet Continuity Variants (deterministic exit so DOM always unmounts cleanly)
 */
export const appleModalBackdropVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2, ease: APPLE_EASE_OUT_EXPO },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: APPLE_EASE_OUT_EXPO },
  },
};

export const appleModalCardVariants = {
  initial: {
    opacity: 0,
    scale: 0.92,
    y: 16,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: APPLE_SPRING_FLUID,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.15,
      ease: APPLE_EASE_OUT_EXPO,
    },
  },
};
