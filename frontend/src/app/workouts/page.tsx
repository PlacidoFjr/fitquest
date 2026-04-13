"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Calendar, Trophy, Clock, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/components/providers/ToastProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { apiRequest } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface WorkoutItem {
  id: number;
  date: string;
  completed: boolean;
}

export default function WorkoutsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function load(token: string) {
    const data = await apiRequest<WorkoutItem[]>("/api/workouts/history", "GET", undefined, token);
    setWorkouts(data);
  }

  async function handleDeleteWorkout(id: number) {
    const token = getToken();
    if (!token) return;
    try {
      await apiRequest(`/api/workouts/${id}`, "DELETE", undefined, token);
      showToast("Treino removido.");
      await load(token);
    } catch (error) {
      showToast((error as Error).message, "error");
    }
  }

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/");
      return;
    }
    load(token).catch(() => {
      showToast("Erro ao carregar treinos.", "error");
      router.push("/");
    });
  }, [router, showToast]);

  return (
    <AppShell>
      <div className="mb-8 flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-secondary/10 text-secondary border border-secondary/10 shadow-lg shadow-secondary/5">
          <Dumbbell size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Treinos</h2>
          <p className="text-sm text-slate-500 font-medium">Forje sua melhor versão através da disciplina</p>
        </div>
      </div>

      <Card variant="gradient" className="mb-8 border-slate-800/40 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
          <Trophy size={120} />
        </div>
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Trophy size={16} />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Missão Diária</p>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">Marque seu treino de hoje</h3>
            <p className="text-sm text-slate-400 font-medium">Conclua sua atividade física para ganhar <span className="text-primary font-bold">+50 XP</span></p>
          </div>
          <Button
            size="lg"
            className="rounded-2xl px-8 shadow-2xl shadow-primary/20"
            disabled={loading}
            onClick={async () => {
              const token = getToken();
              if (!token) return;
              try {
                setLoading(true);
                await apiRequest("/api/workouts/complete", "POST", {}, token);
                await load(token);
                showToast("Treino de hoje concluído! +50 XP ganhos.");
              } catch (error) {
                showToast((error as Error).message, "error");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Registrando..." : "Concluir Treino Agora"}
          </Button>
        </div>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-black text-white tracking-tight">Histórico de Atividade</h3>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <Calendar size={12} />
          <span>Últimos Treinos</span>
        </div>
      </div>

      <div className="grid gap-3">
        {workouts.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between rounded-[1.25rem] bg-card/40 border border-slate-800/60 p-4 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500">
                <Clock size={18} />
              </div>
              <div>
                <p className="font-bold text-white tracking-tight">{item.date}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sessão de Treinamento</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={item.completed ? "success" : "warning"} className="px-4">
                {item.completed ? "Concluído" : "Pendente"}
              </Badge>
              <button
                onClick={() => handleDeleteWorkout(item.id)}
                className="p-2 text-slate-500 hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
        {workouts.length === 0 && (
          <Card variant="glass" className="py-12 text-center border-dashed border-slate-800">
            <p className="text-slate-500 font-medium">Nenhum treino registrado ainda. A primeira vitória começa agora!</p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
