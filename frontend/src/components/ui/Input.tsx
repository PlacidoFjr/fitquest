import { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Input({ 
  className, 
  icon,
  error,
  ...props 
}: InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
  error?: string;
}) {
  return (
    <div className="w-full space-y-1.5">
      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
            {icon}
          </div>
        )}
        <input
          className={cn(
            "w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500",
            "focus:border-primary/50 focus:ring-4 focus:ring-primary/10",
            icon ? "pl-11" : "",
            error ? "border-destructive focus:ring-destructive/10" : "",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs font-medium text-destructive px-1">{error}</p>}
    </div>
  );
}
