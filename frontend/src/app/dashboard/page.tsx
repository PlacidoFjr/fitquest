"use client";

import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  Flame,
  Scale,
  Sparkles,
  Target,
  Trophy,
  UserCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { useToast } from "@/components/providers/ToastProvider";
import { apiRequest } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { DailyProgress, UserProfile } from "@/types";

interface DashboardData {
  profile: UserProfile;
  dailyProgress: DailyProgress | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/");
      return;
    }
    apiRequest<DashboardData>("/api/dashboard", "GET", undefined, token)
      .then((response) => {
        setData(response);
        const key = `fitquest_onboarding_done_${response.profile.id}`;
        const done = window.localStorage.getItem(key) === "true";
        if (!done) setShowOnboarding(true);
      })
      .catch(() => {
        showToast("Nao foi possivel carregar o dashboard.", "error");
        router.push("/");
      });
  }, [router, showToast]);

  const progress = data?.dailyProgress;
  const profile = data?.profile;
  const caloriePercent = profile ? ((progress?.calories_total || 0) / profile.calorie_goal) * 100 : 0;
  const proteinPercent = profile ? ((progress?.protein_total || 0) / profile.protein_goal) * 100 : 0;
  const levelXp = (profile?.total_xp || 0) % 100;
  const xpProgress = levelXp;
  const userName = profile?.email?.split("@")[0] || "Atleta";

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const token = getToken();
    if (!token || !profile) return;
    setSaving(true);
    setFeedback("");
    try {
      await apiRequest<UserProfile>(
        "/api/users/me",
        "PUT",
        {
          weight: Number(formData.get("weight")),
          height: Number(formData.get("height")),
          goalType: formData.get("goalType"),
          calorieGoal: Number(formData.get("calorieGoal")),
          proteinGoal: Number(formData.get("proteinGoal")),
        },
        token
      );
      const refreshed = await apiRequest<DashboardData>("/api/dashboard", "GET", undefined, token);
      setData(refreshed);
      setFeedback("Perfil atualizado com sucesso.");
      showToast("Perfil salvo.");
      if (refreshed.profile?.id) {
        const key = `fitquest_onboarding_done_${refreshed.profile.id}`;
        window.localStorage.setItem(key, "true");
      }
      setShowOnboarding(false);
    } catch (error) {
      showToast((error as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-8 flex flex-col justify-between gap-6 rounded-[2.5rem] bg-gradient-to-br from-card to-slate-900 p-8 shadow-2xl border border-slate-800/60 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <Sparkles size={16} className="animate-pulse" />
            <p className="text-xs font-black uppercase tracking-[0.2em]">Painel de Controle</p>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">
            {new Date().getHours() < 12 ? "Bom dia" : "Boa tarde"}, <span className="text-primary">{userName}</span>!
          </h2>
          <p className="mt-2 text-slate-400 font-medium">Sua jornada épica continua hoje.</p>
        </div>
        
        <div className="flex items-center gap-5 rounded-3xl bg-slate-950/40 p-5 border border-white/5 backdrop-blur-md">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Trophy size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Badge variant="primary" className="px-1.5 py-0">Nível {profile?.level || 1}</Badge>
            </div>
            <p className="text-2xl font-black text-white leading-none">{profile?.total_xp || 0} <span className="text-xs text-slate-500 font-bold uppercase tracking-widest ml-1">XP</span></p>
          </div>
        </div>
      </div>

      {!data ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-[2rem]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card hover variant="gradient" className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
              <Target size={80} />
            </div>
            <div className="mb-6 flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-secondary/10 text-secondary border border-secondary/10">
                <Target size={22} />
              </div>
              <Badge variant="secondary">Energia</Badge>
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Calorias</h3>
            <div className="mt-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-3xl font-black text-white tracking-tighter">
                  <AnimatedNumber value={progress?.calories_total || 0} />
                </span>
                <span className="text-xs text-slate-500 font-bold">/ {profile?.calorie_goal || 0} kcal</span>
              </div>
              <ProgressBar
                value={caloriePercent}
                className="h-2.5 bg-slate-950/50"
                indicatorClassName={progress?.mission_calories_completed ? "bg-primary" : "bg-secondary"}
              />
            </div>
          </Card>

          <Card hover variant="gradient" className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
              <Activity size={80} />
            </div>
            <div className="mb-6 flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/10">
                <Activity size={22} />
              </div>
              <Badge variant="primary">Construção</Badge>
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Proteína</h3>
            <div className="mt-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-3xl font-black text-white tracking-tighter">
                  <AnimatedNumber value={progress?.protein_total || 0} />
                </span>
                <span className="text-xs text-slate-500 font-bold">/ {profile?.protein_goal || 0} g</span>
              </div>
              <ProgressBar value={proteinPercent} className="h-2.5 bg-slate-950/50" indicatorClassName="bg-primary" />
            </div>
          </Card>

          <Card hover variant="gradient" className="relative overflow-hidden group">
            <div className="mb-6 flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">
                <CheckCircle2 size={22} />
              </div>
              <Badge variant="success">Missões</Badge>
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Diário</h3>
            <div className="mt-4 space-y-3">
              {[
                { ok: progress?.mission_workout_completed, label: "Treino do Dia", xp: 50 },
                { ok: progress?.mission_calories_completed, label: "Meta Calórica", xp: 70 },
                { ok: progress?.mission_protein_completed, label: "Meta Proteica", xp: 30 },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between group/item">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded-lg flex items-center justify-center border-2 transition-all duration-300",
                      item.ok ? "bg-primary border-primary text-slate-950 scale-110" : "border-slate-700 bg-slate-900/50"
                    )}>
                      {item.ok && <CheckCircle2 size={12} strokeWidth={4} />}
                    </div>
                    <span className={cn("text-xs font-bold transition-colors", item.ok ? "text-white" : "text-slate-500")}>
                      {item.label}
                    </span>
                  </div>
                  <span className={cn("text-[10px] font-black tracking-tighter", item.ok ? "text-primary" : "text-slate-700")}>
                    +{item.xp} XP
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card hover variant="gradient" className="relative overflow-hidden group border-amber-500/20">
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-amber-500/5 blur-3xl group-hover:bg-amber-500/10 transition-colors" />
            <div className="mb-6 flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/10">
                <Flame size={22} className={cn(profile?.current_streak && profile.current_streak > 0 ? "animate-bounce" : "")} />
              </div>
              <Badge variant="warning">Fogo</Badge>
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Sequência</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl font-black text-white tracking-tighter">{profile?.current_streak || 0}</span>
              <span className="text-sm font-black text-amber-500 uppercase tracking-widest">Dias</span>
            </div>
            <p className="mt-3 text-[10px] text-slate-500 font-black uppercase leading-tight">
              Mantenha o ritmo para <br /> desbloquear recompensas!
            </p>
          </Card>
        </div>
      )}

      <Card className="mt-8 overflow-hidden border-slate-800/40 shadow-2xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-secondary/10 text-secondary border border-secondary/10">
            <UserCircle2 size={24} />
          </div>
          <div>
            <h3 id="perfil" className="text-xl font-black text-white tracking-tight">
              Perfil e Objetivos
            </h3>
            <p className="text-sm text-slate-500 font-medium">Ajuste seus parâmetros para cálculos precisos</p>
          </div>
        </div>

        <form className="grid gap-6 md:grid-cols-2 lg:grid-cols-5" onSubmit={updateProfile}>
          <Input 
            name="weight" 
            type="number" 
            defaultValue={profile?.weight} 
            placeholder="00.0" 
            icon={<Scale size={18} />}
          />
          <Input 
            name="height" 
            type="number" 
            defaultValue={profile?.height} 
            placeholder="000" 
            icon={<Activity size={18} />}
          />
          
          <div className="space-y-2">
            <div className="relative">
              <select
                className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-slate-100 outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/10 appearance-none"
                name="goalType"
                defaultValue={profile?.goal_type}
              >
                <option value="emagrecer">Emagrecer</option>
                <option value="manter">Manter</option>
                <option value="ganhar_massa">Ganhar Massa</option>
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                <ChevronRight size={16} className="rotate-90" />
              </div>
            </div>
          </div>

          <Input 
            name="calorieGoal" 
            type="number" 
            defaultValue={profile?.calorie_goal} 
            placeholder="0000" 
            icon={<Target size={18} />}
          />
          <Input 
            name="proteinGoal" 
            type="number" 
            defaultValue={profile?.protein_goal} 
            placeholder="000" 
            icon={<Activity size={18} />}
          />

          <div className="lg:col-span-5 flex items-center justify-between pt-4 border-t border-slate-800/60 mt-2">
            {feedback ? (
              <motion.p 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-xl border border-primary/20"
              >
                {feedback}
              </motion.p>
            ) : <div />}
            
            <Button 
              className="px-10 rounded-2xl" 
              type="submit" 
              loading={saving}
            >
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Card>

      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl"
            >
              <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-700 shadow-xl">
                  <Sparkles className="text-primary" size={32} />
                </div>
                <h3 className="text-2xl font-black text-white">Bem-vindo ao FitQuest!</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Para uma jornada personalizada, precisamos de alguns dados basicos.
                </p>
              </div>

              <div className="p-8">
                <form className="grid gap-6 md:grid-cols-2" onSubmit={updateProfile}>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Peso Atual</label>
                    <div className="relative group">
                      <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-secondary transition-colors" size={16} />
                      <Input name="weight" type="number" defaultValue={profile?.weight} placeholder="00.0" className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Altura (cm)</label>
                    <div className="relative group">
                      <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-secondary transition-colors" size={16} />
                      <Input name="height" type="number" defaultValue={profile?.height} placeholder="170" className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Seu Objetivo</label>
                    <select
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/35"
                      name="goalType"
                      defaultValue={profile?.goal_type || "manter"}
                    >
                      <option value="emagrecer">Emagrecer - Perda de gordura</option>
                      <option value="manter">Manter - Equilíbrio saudavel</option>
                      <option value="ganhar_massa">Ganhar Massa - Hipertrofia</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Meta Calorias</label>
                    <div className="relative group">
                      <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-secondary transition-colors" size={16} />
                      <Input name="calorieGoal" type="number" defaultValue={profile?.calorie_goal} placeholder="2200" className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Meta Proteina</label>
                    <div className="relative group">
                      <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-secondary transition-colors" size={16} />
                      <Input name="proteinGoal" type="number" defaultValue={profile?.protein_goal} placeholder="120" className="pl-10" required />
                    </div>
                  </div>
                  <Button className="mt-2 md:col-span-2 py-4 text-base font-black rounded-2xl" type="submit" disabled={saving}>
                    {saving ? "Salvando seu perfil..." : "Começar Minha Jornada"}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
