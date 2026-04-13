import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: Variant; 
  size?: Size;
  loading?: boolean;
}) {
  const variants: Record<Variant, string> = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
    secondary: 
      "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg shadow-secondary/20",
    outline:
      "border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white",
    ghost: 
      "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20",
  };

  const sizes: Record<Size, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {props.children}
    </button>
  );
}
