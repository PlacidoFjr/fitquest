"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedNumber({ value, durationMs = 700 }: { value: number; durationMs?: number }) {
  const [display, setDisplay] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    let frame = 0;
    const steps = 24;
    const start = previous.current;
    const stepValue = (value - start) / steps;
    const timer = window.setInterval(() => {
      frame += 1;
      const next = frame >= steps ? value : Math.round(start + stepValue * frame);
      setDisplay(next);
      if (frame >= steps) {
        previous.current = value;
        window.clearInterval(timer);
      }
    }, Math.max(16, Math.floor(durationMs / steps)));

    return () => window.clearInterval(timer);
  }, [durationMs, value]);

  return <>{display}</>;
}
