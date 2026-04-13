import { cn } from "@/lib/cn";

export function Card({ 
  className, 
  children,
  hover = false,
  variant = "default"
}: { 
  className?: string; 
  children: React.ReactNode;
  hover?: boolean;
  variant?: "default" | "glass" | "gradient"
}) {
  const variants = {
    default: "bg-card border border-slate-800/60",
    glass: "glass",
    gradient: "card-gradient border border-slate-800/40"
  };

  return (
    <section 
      className={cn(
        "rounded-[1.5rem] p-6 shadow-xl transition-all duration-300",
        variants[variant],
        hover && "hover:translate-y-[-4px] hover:shadow-2xl hover:border-slate-700/80",
        className
      )}
    >
      {children}
    </section>
  );
}
