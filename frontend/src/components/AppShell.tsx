"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, LayoutDashboard, LogOut, Menu, UserCircle2, UtensilsCrossed, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { Button } from "./ui/Button";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/meals", label: "Refeições", icon: UtensilsCrossed },
  { href: "/workouts", label: "Treinos", icon: Dumbbell },
  { href: "/history", label: "Histórico", icon: LayoutDashboard },
  { href: "/dashboard#perfil", label: "Perfil", icon: UserCircle2 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const activePath = useMemo(() => pathname ?? "/dashboard", [pathname]);

  const handleLogout = () => {
    clearToken();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full" />
      </div>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        {/* Desktop Sidebar */}
        <aside className="hidden w-72 flex-col gap-6 md:flex">
          <div className="flex flex-col rounded-3xl bg-card/50 border border-slate-800/60 p-6 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-8 px-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Dumbbell size={24} />
              </div>
              <p className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-2xl font-black tracking-tight text-transparent">
                FitQuest
              </p>
            </div>

            <nav className="flex flex-col gap-1.5">
              {links.map((item) => {
                const Icon = item.icon;
                const active = activePath === item.href || (item.href === "/dashboard#perfil" && activePath === "/dashboard");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200",
                      active 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                    )}
                  >
                    <Icon size={18} className={cn("transition-transform group-hover:scale-110", active ? "text-white" : "text-slate-500")} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 pt-6 border-t border-slate-800/60">
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-400 hover:text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                Sair da Conta
              </Button>
            </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="flex-1">
          <header className="mb-6 flex items-center justify-between rounded-3xl bg-card/50 border border-slate-800/60 px-6 py-4 shadow-xl backdrop-blur-sm md:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Dumbbell size={18} />
              </div>
              <p className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-xl font-black text-transparent">
                FitQuest
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-slate-700"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </header>

          {/* Mobile Menu Overlay */}
          <AnimatePresence>
            {menuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden rounded-3xl bg-card border border-slate-800 px-2 py-3 shadow-2xl md:hidden"
              >
                <div className="flex flex-col gap-1">
                  {links.map((item) => {
                    const Icon = item.icon;
                    const active = activePath === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all",
                          active ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-slate-800"
                        )}
                        onClick={() => setMenuOpen(false)}
                      >
                        <Icon size={18} />
                        {item.label}
                      </Link>
                    );
                  })}
                  <button
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-rose-400 hover:bg-rose-500/10"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    Sair
                  </button>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>

          <main className="animate-in">{children}</main>
        </div>
      </div>
    </div>
  );
}
