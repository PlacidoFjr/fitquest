"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/providers/ToastProvider";
import { apiRequest } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface HistoryItem {
  date: string;
  calories_total: number;
  protein_total: number;
  completed_missions_count: number;
  daily_xp: number;
  feedback_grade: string;
}

import { History, Calendar, Star, LayoutDashboard, Target, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";

// Helper para formatar a data
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Hoje";
  if (date.toDateString() === yesterday.toDateString()) return "Ontem";

  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

// Formatação para data completa do treino (ex: 13 Abr, 14:30)
function formatWorkoutDate(dateStr: string) {
  const date = new Date(dateStr);
  const dayMonth = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  
  // Se for apenas data sem hora (ISO date), retorna apenas dia/mês
  if (dateStr.length <= 10) return dayMonth;

  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${dayMonth}, ${time}`;
}

export default function HistoryPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/");
      return;
    }

    apiRequest<HistoryItem[]>("/api/dashboard/history", "GET", undefined, token)
      .then((daily) => {
        setHistory(daily);
      })
      .catch(() => {
        showToast("Erro ao carregar histórico.", "error");
        router.push("/");
      });
  }, [router, showToast]);

  return (
    <AppShell>
      <div className="mb-8 flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/10 shadow-lg shadow-amber-500/5">
          <History size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Histórico de Progresso</h2>
          <p className="text-sm text-slate-500 font-medium">Reveja suas conquistas e mantenha a constância</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card variant="gradient" className="border-slate-800/40">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              Atividade Recente
            </h3>
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
              <LayoutDashboard size={14} />
              Voltar ao Painel
            </Button>
          </div>

          <div className="space-y-4">
            {history.map((item, index) => (
              <motion.div
                key={item.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group flex flex-col gap-4 rounded-2xl bg-slate-950/40 border border-white/5 p-5 hover:border-primary/20 transition-all hover:bg-slate-900/60"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-white tracking-tight">{formatDate(item.date)}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Resumo do Dia</p>
                    </div>
                  </div>
                  <Badge variant={Number(item.completed_missions_count) >= 2 ? "success" : "secondary"} className="h-7 px-3">
                    Status: {Number(item.completed_missions_count) === 3 ? "Lendário" : item.completed_missions_count >= 1 ? "Em Progresso" : "Iniciado"}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500 flex items-center gap-1">
                      <Target size={10} className="text-primary" /> Missões
                    </span>
                    <p className="text-sm font-bold text-white">{item.completed_missions_count}/3 Batidas</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500 flex items-center gap-1">
                      <Star size={10} className="text-amber-500" /> XP Ganho
                    </span>
                    <p className="text-sm font-bold text-white">+{item.daily_xp} XP</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500 flex items-center gap-1">
                      <Flame size={10} className="text-secondary" /> Macros
                    </span>
                    <p className="text-xs font-bold text-slate-400">
                      {Number(item.calories_total).toFixed(0)} kcal | {Number(item.protein_total).toFixed(1)}g
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            {history.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-slate-500 font-medium italic">Seu histórico está sendo forjado...</p>
                <Button className="mt-4" variant="primary" onClick={() => router.push("/workouts")}>
                  Registrar Primeiro Treino
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
