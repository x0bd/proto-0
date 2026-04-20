"use client";

import { useMotionValue } from "motion/react";

export function usePanelPosition(id: string) {
  const savedPos = (() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(`panel_pos_${id}`);
      if (!raw) return null;
      const pos = JSON.parse(raw);
      if (typeof pos?.x === "number" && typeof pos?.y === "number") return pos as { x: number; y: number };
      return null;
    } catch { return null; }
  })();

  const x = useMotionValue(savedPos?.x ?? 0);
  const y = useMotionValue(savedPos?.y ?? 0);

  const onDragEnd = () => {
    try {
      localStorage.setItem(`panel_pos_${id}`, JSON.stringify({ x: x.get(), y: y.get() }));
    } catch { /* noop */ }
  };

  return { x, y, onDragEnd };
}
