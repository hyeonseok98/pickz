export const sidebarBackdropMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.18, ease: "easeOut" },
} as const;

export const sidebarPanelMotion = {
  initial: { x: "-100%" },
  animate: { x: 0 },
  exit: { x: "-100%" },
  transition: { type: "spring", stiffness: 380, damping: 34, mass: 0.9 },
} as const;
