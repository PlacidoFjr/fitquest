import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export function ProgressBar({
  value,
  className,
  indicatorClassName,
}: {
  value: number;
  className?: string;
  indicatorClassName?: string;
}) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-slate-800", className)}>
      <motion.div
        className={cn("h-full rounded-full bg-primary", indicatorClassName)}
        initial={{ width: 0 }}
        animate={{ width: `${safeValue}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}
