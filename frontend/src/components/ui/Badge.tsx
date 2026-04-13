import { cn } from "@/lib/cn";

export function Badge({ 
  className, 
  children,
  variant = "default"
}: { 
  className?: string; 
  children: React.ReactNode;
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "error" | "outline"
}) {
  const variants = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    error: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    outline: "bg-transparent text-slate-400 border-slate-700"
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", 
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
