"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, Dumbbell, LayoutDashboard, LogOut, Menu, UserCircle2, UtensilsCrossed, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, getToken } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

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
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [canRequestNotification, setCanRequestNotification] = useState(false);
  const activePath = useMemo(() => pathname ?? "/dashboard", [pathname]);

  const handleLogout = () => {
    clearToken();
    router.push("/");
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setCanRequestNotification(false);
        setNotificationOpen(false);
      }
    }
  };

  // Lógica de notificação simulada para Streak
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    
    // Verifica se já temos permissão
    if ('Notification' in window) {
      const isDefault = Notification.permission === 'default';
      setTimeout(() => {
        setCanRequestNotification(isDefault);
      }, 0);
    }

    // Simula uma verificação de streak
    const lastCheck = localStorage.getItem("fitquest_streak_check");
    const today = new Date().toDateString();
    
    if (lastCheck !== today) {
      setTimeout(() => {
        setNotificationOpen(true);
        localStorage.setItem("fitquest_streak_check", today);
      }, 2000);
    }
  }, []);

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
                      active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                      )}
                    >
                      <Icon size={18} className={cn(active ? "text-white" : "text-slate-500", "transition-transform group-hover:scale-110")} />
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
              {menuOpen ? (
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
              ) : null}
            </AnimatePresence>

          <main className="animate-in relative">{children}
            <AnimatePresence>
              {notificationOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  className="fixed bottom-8 right-8 z-50 max-w-sm"
                >
                  <Card variant="glass" className="p-4 border-primary/20 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
                    <div className="flex gap-4">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <Bell size={20} className="animate-bounce" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-white">Não perca seu Streak! 🔥</p>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">Você ainda não registrou suas missões hoje. Complete 2 missões para manter seu foguinho!</p>
                        <div className="mt-3 flex flex-col gap-2">
                          {canRequestNotification ? (
                            <div className="flex gap-2">
                              <Button size="sm" className="h-8 px-4 text-[10px]" onClick={requestNotificationPermission}>
                                Ativar Notificações 🔥
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 px-4 text-[10px] text-slate-500" onClick={() => setNotificationOpen(false)}>
                                Agora não
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button size="sm" className="h-8 px-4 text-[10px]" onClick={() => setNotificationOpen(false)}>
                                Vou fazer agora!
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
