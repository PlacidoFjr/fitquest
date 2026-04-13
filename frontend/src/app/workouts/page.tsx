"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Calendar, Trophy, Clock, Trash2, Timer, Zap, Plus, Flame, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { useToast } from "@/components/providers/ToastProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { apiRequest } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { cn } from "@/lib/cn";

interface WorkoutItem {
  id: number;
  date: string;
  type: string;
  duration_minutes: number;
  calories_burned: number;
  completed: boolean;
}

const WORKOUT_TYPES = [
  { id: 'musculação', label: 'Musculação', icon: <Dumbbell size={14} />, kcalPerMin: 5 },
  { id: 'corrida', label: 'Corrida', icon: <Activity size={14} />, kcalPerMin: 10 },
  { id: 'caminhada', label: 'Caminhada', icon: <Activity size={14} />, kcalPerMin: 4 },
  { id: 'ciclismo', label: 'Ciclismo', icon: <Activity size={14} />, kcalPerMin: 8 },
  { id: 'natação', label: 'Natação', icon: <Activity size={14} />, kcalPerMin: 9 },
  { id: 'hiit', label: 'HIIT', icon: <Zap size={14} />, kcalPerMin: 12 },
  { id: 'futebol', label: 'Futebol', icon: <Activity size={14} />, kcalPerMin: 9 },
];

export default function WorkoutsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [type, setType] = useState('musculação');
  const [duration, setDuration] = useState(60);

  async function load(token: string) {
    const data = await apiRequest<WorkoutItem[]>("/api/workouts/history", "GET", undefined, token);
    setWorkouts(data);
  }

  const selectedType = WORKOUT_TYPES.find(t => t.id === type) || WORKOUT_TYPES[0];
  const estimatedKcal = duration * selectedType.kcalPerMin;

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
        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Trophy size={16} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Missão Diária</p>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Marque seu treino de hoje</h3>
              <p className="text-sm text-slate-400 font-medium">Conclua sua atividade física para ganhar <span className="text-primary font-bold">+50 XP</span></p>
            </div>
            {!showForm && (
              <Button
                size="lg"
                className="rounded-2xl px-8 shadow-2xl shadow-primary/20"
                onClick={() => setShowForm(true)}
              >
                Concluir Treino Agora
              </Button>
            )}
          </div>

          {showForm && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pt-6 border-t border-white/5 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tipo de Atividade</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {WORKOUT_TYPES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setType(t.id)}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all",
                          type === t.id 
                            ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" 
                            : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                        )}
                      >
                        {t.icon}
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tempo (minutos)</label>
                  <div className="flex items-center gap-4">
                    <Input 
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      icon={<Timer size={18} />}
                      className="text-center font-bold text-lg"
                    />
                    <div className="flex flex-col gap-1 shrink-0">
                      <div className="flex items-center gap-2 text-amber-500">
                        <Flame size={14} />
                        <span className="text-xs font-black">{estimatedKcal} KCAL</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter italic">Estimativa Strava</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 rounded-xl h-12 shadow-lg shadow-primary/20"
                  disabled={loading}
                  onClick={async () => {
                    const token = getToken();
                    if (!token) return;
                    try {
                      setLoading(true);
                      await apiRequest("/api/workouts/complete", "POST", {
                        type: type,
                        duration_minutes: duration,
                        calories_burned: estimatedKcal
                      }, token);
                      await load(token);
                      showToast(`Treino de ${selectedType.label} registrado! +50 XP.`);
                      setShowForm(false);
                    } catch (error) {
                      showToast((error as Error).message, "error");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {loading ? "Salvando..." : "Confirmar e Ganhar XP"}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl h-12 border-slate-800 text-slate-500"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </motion.div>
          )}
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
                {WORKOUT_TYPES.find(t => t.id === item.type)?.icon || <Clock size={18} />}
              </div>
              <div>
                <p className="font-bold text-white tracking-tight">{item.date}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {WORKOUT_TYPES.find(t => t.id === item.type)?.label || 'Sessão'} • {item.duration_minutes} min
                  </p>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500/80">
                    <Flame size={10} />
                    <span>{Number(item.calories_burned).toFixed(0)} kcal</span>
                  </div>
                </div>
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
