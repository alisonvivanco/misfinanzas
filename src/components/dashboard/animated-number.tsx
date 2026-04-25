"use client";
import { useEffect, useState } from "react";
import { useMotionValue, animate, useMotionValueEvent } from "framer-motion";
import { formatCLP } from "@/lib/utils";

export function AnimatedCLP({ value, className }: { value: number; className?: string }) {
  const motion = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(motion, value, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [value, motion]);

  useMotionValueEvent(motion, "change", (latest) => {
    setDisplay(latest);
  });

  return <span className={"tabular-nums " + (className || "")}>{formatCLP(Math.round(display))}</span>;
}
